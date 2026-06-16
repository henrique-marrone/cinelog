from sqlalchemy import Column, Integer, String, Float
from database import Base


class Filme(Base):
    """
    Model SQLAlchemy que representa a tabela 'filmes' no banco de dados.
    Preservado integralmente da V1 — nenhuma coluna foi alterada.
    """
    __tablename__ = "filmes"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, unique=True, index=True, nullable=False)
    diretor = Column(String, nullable=False)
    ano_lancamento = Column(Integer, nullable=False)
    nota = Column(Float, nullable=False)


class Usuario(Base):
    """
    Model SQLAlchemy que representa a tabela 'usuarios' no banco de dados.
    Criado na V2 para suportar autenticação JWT.

    Regras de negócio:
      - email deve ser único (não pode haver dois usuários com o mesmo e-mail)
      - a senha NUNCA é armazenada em texto puro (apenas o hash bcrypt)
    """
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    senha_hash = Column(String, nullable=False)
