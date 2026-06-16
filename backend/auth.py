import os
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db

# ─────────────────────────────────────────────────────────────
# CONFIGURAÇÕES — lidas exclusivamente de variáveis de ambiente
# ─────────────────────────────────────────────────────────────

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

if not SECRET_KEY:
    raise RuntimeError(
        "A variável de ambiente SECRET_KEY não foi definida. "
        "Gere uma chave segura com: openssl rand -hex 32"
    )

# ─────────────────────────────────────────────────────────────
# HASH DE SENHAS — passlib com bcrypt
# ─────────────────────────────────────────────────────────────

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_senha(senha: str) -> str:
    """Gera o hash bcrypt da senha fornecida."""
    return pwd_context.hash(senha)


def verificar_senha(senha_plain: str, senha_hash: str) -> bool:
    """Verifica se a senha em texto puro corresponde ao hash armazenado."""
    return pwd_context.verify(senha_plain, senha_hash)


# ─────────────────────────────────────────────────────────────
# GERAÇÃO E VALIDAÇÃO DE JWT
# ─────────────────────────────────────────────────────────────

def criar_access_token(data: dict) -> str:
    """
    Gera um JWT assinado com os dados fornecidos.
    Adiciona automaticamente o campo 'exp' (expiração) ao payload.
    """
    payload = data.copy()
    expiracao = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload.update({"exp": expiracao})
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


# ─────────────────────────────────────────────────────────────
# DEPENDÊNCIA DE AUTENTICAÇÃO
# ─────────────────────────────────────────────────────────────

# Esquema Bearer — extrai o token do header 'Authorization: Bearer <token>'
bearer_scheme = HTTPBearer()


def get_usuario_atual(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> models.Usuario:
    """
    Dependência FastAPI que valida o JWT e retorna o usuário autenticado.

    Retorna 401 Unauthorized quando:
      - o header Authorization está ausente
      - o token está malformado
      - o token está expirado
      - o e-mail contido no token não existe no banco
    """
    token = credentials.credentials

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas ou token expirado.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    usuario = db.query(models.Usuario).filter(models.Usuario.email == email).first()
    if usuario is None:
        raise credentials_exception

    return usuario
