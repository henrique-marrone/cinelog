import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Carrega as variáveis do arquivo .env (apenas em desenvolvimento local)
load_dotenv()

# DATABASE_URL deve vir exclusivamente de variável de ambiente
# Exemplo: postgresql://usuario:senha@host:5432/database
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "A variável de ambiente DATABASE_URL não foi definida. "
        "Crie um arquivo .env baseado no .env.example antes de iniciar."
    )

# Neon/Supabase retornam URLs com prefixo 'postgres://' (antigo).
# SQLAlchemy 2.x exige 'postgresql://' — corrigimos aqui automaticamente.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Engine PostgreSQL — sem connect_args especiais (diferente do SQLite)
engine = create_engine(DATABASE_URL)

# Fábrica de sessões: cada requisição usa uma sessão isolada
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Classe base para os modelos SQLAlchemy
Base = declarative_base()


def get_db():
    """
    Dependency do FastAPI que fornece uma sessão de banco de dados.
    Garante que a sessão seja fechada após o uso (mesmo em caso de erro).
    Utilizado com Depends(get_db) nas rotas.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
