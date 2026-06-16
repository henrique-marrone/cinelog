from pydantic import BaseModel, Field, EmailStr
from typing import Optional


# ─────────────────────────────────────────────────────────────
# SCHEMAS DE FILMES — preservados integralmente da V1
# ─────────────────────────────────────────────────────────────

class FilmeCreate(BaseModel):
    """Schema utilizado na criação de um novo filme (POST)."""
    titulo: str = Field(..., min_length=1, max_length=200, description="Título do filme")
    diretor: str = Field(..., min_length=1, max_length=200, description="Nome do diretor")
    ano_lancamento: int = Field(..., ge=1888, le=2100, description="Ano de lançamento (a partir de 1888)")
    nota: float = Field(..., ge=0.0, le=10.0, description="Nota de 0 a 10")


class FilmeUpdate(BaseModel):
    """Schema utilizado na atualização de um filme existente (PUT). Todos os campos são opcionais."""
    titulo: Optional[str] = Field(None, min_length=1, max_length=200)
    diretor: Optional[str] = Field(None, min_length=1, max_length=200)
    ano_lancamento: Optional[int] = Field(None, ge=1888, le=2100)
    nota: Optional[float] = Field(None, ge=0.0, le=10.0)


class FilmeResponse(BaseModel):
    """Schema utilizado nas respostas da API (GET, POST, PUT). Inclui o campo 'id'."""
    id: int
    titulo: str
    diretor: str
    ano_lancamento: int
    nota: float

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────────
# SCHEMAS DE AUTENTICAÇÃO — novos na V2
# ─────────────────────────────────────────────────────────────

class UsuarioCreate(BaseModel):
    """Schema para cadastro de novo usuário (POST /auth/register)."""
    email: EmailStr = Field(..., description="E-mail válido e único")
    senha: str = Field(..., min_length=6, description="Senha com no mínimo 6 caracteres")


class UsuarioLogin(BaseModel):
    """Schema para login (POST /auth/login)."""
    email: EmailStr
    senha: str


class UsuarioResponse(BaseModel):
    """Schema de resposta com dados públicos do usuário (sem senha)."""
    id: int
    email: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    """Schema de resposta do login — retorna o access token e o tipo."""
    access_token: str
    token_type: str = "bearer"
