import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List

import models
import schemas
from database import engine, get_db
from auth import (
    hash_senha,
    verificar_senha,
    criar_access_token,
    get_usuario_atual,
)

# Cria todas as tabelas no banco de dados automaticamente na primeira execução
models.Base.metadata.create_all(bind=engine)

# ─────────────────────────────────────────────────────────────
# APLICAÇÃO
# ─────────────────────────────────────────────────────────────

app = FastAPI(
    title="CineLog API",
    description="API para gerenciar lista de filmes assistidos com autenticação JWT",
    version="2.0.0",
)

# ─────────────────────────────────────────────────────────────
# CORS — permite frontend local e produção (Vercel)
# ─────────────────────────────────────────────────────────────

# A variável FRONTEND_URL pode ser definida no Render para apontar à URL da Vercel

# Lista base de origens permitidas (incluindo versões com/sem porta para dev)
FRONTEND_URLS = ["http://localhost:5173", "http://localhost:5174"] 

# Adiciona a URL do Vercel caso ela esteja definida nas variáveis de ambiente
vercel_url = os.getenv("FRONTEND_URL")
if vercel_url:
    # Remove barras extras no final caso existam e adiciona à lista
    clean_vercel_url = vercel_url.rstrip('/')
    if clean_vercel_url not in FRONTEND_URLS:
        FRONTEND_URLS.append(clean_vercel_url)

# Mude para este código temporariamente para testar
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ISSO LIBERA TUDO. Se funcionar, o problema é o filtro da variável.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────
# ROTAS DE AUTENTICAÇÃO
# ─────────────────────────────────────────────────────────────

@app.post(
    "/auth/register",
    response_model=schemas.UsuarioResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Autenticação"],
    summary="Registra um novo usuário",
)
def registrar(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    """
    POST /auth/register
    Cadastra um novo usuário com e-mail e senha.
    A senha é armazenada apenas como hash bcrypt — nunca em texto puro.
    Retorna 400 se o e-mail já estiver cadastrado.
    """
    existente = db.query(models.Usuario).filter(
        models.Usuario.email == usuario.email
    ).first()
    if existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe uma conta com este e-mail.",
        )

    novo_usuario = models.Usuario(
        email=usuario.email,
        senha_hash=hash_senha(usuario.senha),
    )
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    return novo_usuario


@app.post(
    "/auth/login",
    response_model=schemas.Token,
    tags=["Autenticação"],
    summary="Autentica um usuário e retorna o JWT",
)
def login(dados: schemas.UsuarioLogin, db: Session = Depends(get_db)):
    """
    POST /auth/login
    Valida e-mail e senha, retorna um JWT com 30 minutos de validade.
    Retorna 401 se as credenciais forem inválidas.
    """
    usuario = db.query(models.Usuario).filter(
        models.Usuario.email == dados.email
    ).first()

    if not usuario or not verificar_senha(dados.senha, usuario.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = criar_access_token(data={"sub": usuario.email})
    return {"access_token": token, "token_type": "bearer"}


@app.get(
    "/auth/me",
    response_model=schemas.UsuarioResponse,
    tags=["Autenticação"],
    summary="Retorna os dados do usuário autenticado",
)
def me(usuario_atual: models.Usuario = Depends(get_usuario_atual)):
    """
    GET /auth/me
    Rota protegida — exige token válido no header Authorization.
    Retorna os dados públicos do usuário logado.
    """
    return usuario_atual


# ─────────────────────────────────────────────────────────────
# ROTAS DE FILMES
# ─────────────────────────────────────────────────────────────

@app.get(
    "/filmes",
    response_model=List[schemas.FilmeResponse],
    tags=["Filmes"],
    summary="Lista todos os filmes (público)",
)
def listar_filmes(db: Session = Depends(get_db)):
    """
    GET /filmes — PÚBLICO (não exige autenticação).
    Retorna todos os filmes cadastrados.
    """
    return db.query(models.Filme).all()


@app.get(
    "/filmes/{filme_id}",
    response_model=schemas.FilmeResponse,
    tags=["Filmes"],
    summary="Busca um filme pelo ID (público)",
)
def buscar_filme(filme_id: int, db: Session = Depends(get_db)):
    """
    GET /filmes/{id} — PÚBLICO.
    Retorna 404 se o filme não for encontrado.
    """
    filme = db.query(models.Filme).filter(models.Filme.id == filme_id).first()
    if not filme:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Filme com id {filme_id} não encontrado.",
        )
    return filme


@app.post(
    "/filmes",
    response_model=schemas.FilmeResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Filmes"],
    summary="Cadastra um novo filme (requer autenticação)",
)
def criar_filme(
    filme: schemas.FilmeCreate,
    db: Session = Depends(get_db),
    _: models.Usuario = Depends(get_usuario_atual),   # protegido
):
    """
    POST /filmes — PROTEGIDO (exige JWT).
    Cadastra um novo filme. Retorna 400 se o título já existir.
    """
    novo_filme = models.Filme(**filme.model_dump())
    db.add(novo_filme)
    try:
        db.commit()
        db.refresh(novo_filme)
        return novo_filme
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Já existe um filme com o título '{filme.titulo}'.",
        )


@app.put(
    "/filmes/{filme_id}",
    response_model=schemas.FilmeResponse,
    tags=["Filmes"],
    summary="Atualiza um filme existente (requer autenticação)",
)
def atualizar_filme(
    filme_id: int,
    dados: schemas.FilmeUpdate,
    db: Session = Depends(get_db),
    _: models.Usuario = Depends(get_usuario_atual),   # protegido
):
    """
    PUT /filmes/{id} — PROTEGIDO (exige JWT).
    Atualiza apenas os campos enviados. Retorna 404 se não encontrado.
    """
    filme = db.query(models.Filme).filter(models.Filme.id == filme_id).first()
    if not filme:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Filme com id {filme_id} não encontrado.",
        )

    for campo, valor in dados.model_dump(exclude_unset=True).items():
        setattr(filme, campo, valor)

    try:
        db.commit()
        db.refresh(filme)
        return filme
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe um filme com esse título.",
        )


@app.delete(
    "/filmes/{filme_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["Filmes"],
    summary="Remove um filme (requer autenticação)",
)
def deletar_filme(
    filme_id: int,
    db: Session = Depends(get_db),
    _: models.Usuario = Depends(get_usuario_atual),   # protegido
):
    """
    DELETE /filmes/{id} — PROTEGIDO (exige JWT).
    Retorna 404 se o filme não for encontrado.
    Retorna 204 (sem conteúdo) em caso de sucesso.
    """
    filme = db.query(models.Filme).filter(models.Filme.id == filme_id).first()
    if not filme:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Filme com id {filme_id} não encontrado.",
        )
    db.delete(filme)
    db.commit()
