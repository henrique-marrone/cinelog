# 🎬 CineLog V2 — Lista de Filmes Assistidos

Aplicação web full stack para gerenciar sua lista pessoal de filmes assistidos, agora com **autenticação JWT**, **PostgreSQL** e pronta para **deploy em produção**.

**Trabalho Acadêmico — Ciência da Computação**

---

## 📋 Descrição do Projeto

CineLog é um CRUD completo de filmes com autenticação de usuários. Cada usuário cria uma conta, faz login e gerencia sua própria lista de filmes (cadastrar, editar, remover). Visitantes não autenticados podem apenas visualizar os filmes (rotas GET são públicas).

---

## 🛠 Tecnologias

### Back-end
| Tecnologia | Função |
|---|---|
| FastAPI | Framework web principal |
| SQLAlchemy | ORM — mapeia classes Python para tabelas SQL |
| PostgreSQL | Banco de dados relacional em produção |
| psycopg2-binary | Driver de conexão PostgreSQL |
| passlib[bcrypt] | Hash seguro de senhas |
| python-jose | Geração e validação de JWT |
| python-dotenv | Carregamento de variáveis de ambiente |
| uvicorn | Servidor ASGI |

### Front-end
| Tecnologia | Função |
|---|---|
| React 18 | Biblioteca de interface |
| Vite | Build tool e servidor de desenvolvimento |
| Axios | Requisições HTTP com interceptors |

### Deploy
| Serviço | Uso |
|---|---|
| Render | Hospedagem do backend FastAPI |
| Vercel | Hospedagem do frontend React |
| Neon / Supabase | PostgreSQL gerenciado na nuvem |

---

## 📁 Estrutura de Pastas

```
cinelog/
│
├── backend/
│   ├── database.py        # Engine PostgreSQL + get_db dependency
│   ├── models.py          # Models: Filme + Usuario (SQLAlchemy)
│   ├── schemas.py         # Schemas Pydantic: Filme + Auth
│   ├── auth.py            # JWT, hash bcrypt, dependência get_usuario_atual
│   ├── main.py            # Rotas REST + CORS
│   ├── requirements.txt   # Dependências Python
│   ├── .env.example       # Template de variáveis de ambiente
│   └── .gitignore
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    ├── .env.example        # Template de variáveis Vite
    ├── .gitignore
    └── src/
        ├── main.jsx
        ├── App.jsx             # Roteamento auth + tela principal
        ├── App.css             # Estilos globais (inclui estilos de auth)
        ├── components/
        │   ├── Login.jsx       # Formulário de login
        │   ├── Register.jsx    # Formulário de registro
        │   ├── FilmeForm.jsx   # Formulário cadastro/edição (preservado)
        │   └── FilmeTabela.jsx # Tabela de filmes (preservado)
        └── services/
            └── api.js          # Axios centralizado + interceptors JWT
```

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- Python 3.10+
- Node.js 18+
- PostgreSQL local **ou** conta no [Neon](https://neon.tech) / [Supabase](https://supabase.com)

---

### 1. Back-end (FastAPI)

```bash
# Entre na pasta do back-end
cd cinelog/backend

# Crie e ative um ambiente virtual
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Instale as dependências
pip install -r requirements.txt

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com seus dados reais (veja seção "Variáveis de Ambiente")

# Inicie o servidor
uvicorn main:app --reload
```

O servidor iniciará em: **http://localhost:8000**

Acesse a documentação interativa: **http://localhost:8000/docs**

---

### 2. Front-end (React + Vite)

```bash
# Em outro terminal, entre na pasta do front-end
cd cinelog/frontend

# Instale as dependências
npm install

# Configure a variável de ambiente
cp .env.example .env
# O arquivo já vem configurado para desenvolvimento local (localhost:8000)

# Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação abrirá em: **http://localhost:5173**

---

## 🔑 Variáveis de Ambiente

### Back-end (`backend/.env`)

```env
# Banco de dados PostgreSQL
# Neon:     postgresql://usuario:senha@host.neon.tech/neondb?sslmode=require
# Supabase: postgresql://postgres:senha@db.xxxx.supabase.co:5432/postgres
# Local:    postgresql://postgres:postgres@localhost:5432/cinelog
DATABASE_URL=postgresql://usuario:senha@host:5432/database

# JWT — gere com: openssl rand -hex 32
SECRET_KEY=sua-chave-secreta-com-pelo-menos-32-caracteres

# Algoritmo JWT (não altere)
ALGORITHM=HS256

# Expiração do token em minutos
ACCESS_TOKEN_EXPIRE_MINUTES=30

# URL do frontend em produção (Vercel) — deixe vazio em desenvolvimento
FRONTEND_URL=
```

### Front-end (`frontend/.env`)

```env
# URL da API (altere para a URL do Render em produção)
VITE_API_URL=http://localhost:8000
```

---

## ☁️ Deploy — Banco de Dados (Neon ou Supabase)

### Opção A — Neon (recomendado, gratuito)

1. Acesse [neon.tech](https://neon.tech) e crie uma conta.
2. Crie um novo projeto → escolha uma região próxima.
3. Copie a **Connection string** (formato `postgresql://...`).
4. Cole em `DATABASE_URL` nas variáveis do Render.

### Opção B — Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto.
2. Vá em **Settings → Database → Connection string → URI**.
3. Copie e cole em `DATABASE_URL` nas variáveis do Render.

> As tabelas são criadas automaticamente pelo SQLAlchemy na primeira inicialização.

---

## ☁️ Deploy — Backend no Render

1. Crie uma conta em [render.com](https://render.com).
2. Clique em **New → Web Service**.
3. Conecte seu repositório GitHub.
4. Configure:
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Em **Environment Variables**, adicione:
   ```
   DATABASE_URL    = <sua connection string do Neon/Supabase>
   SECRET_KEY      = <chave gerada com openssl rand -hex 32>
   ALGORITHM       = HS256
   ACCESS_TOKEN_EXPIRE_MINUTES = 30
   FRONTEND_URL    = https://seu-projeto.vercel.app
   ```
6. Clique em **Create Web Service**.
7. Aguarde o deploy. A URL será algo como `https://cinelog-api.onrender.com`.

---

## ☁️ Deploy — Frontend no Vercel

1. Crie uma conta em [vercel.com](https://vercel.com).
2. Clique em **New Project** e importe seu repositório.
3. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Em **Environment Variables**, adicione:
   ```
   VITE_API_URL = https://cinelog-api.onrender.com
   ```
5. Clique em **Deploy**.
6. Copie a URL gerada (ex: `https://cinelog.vercel.app`).
7. **Volte ao Render** e atualize a variável `FRONTEND_URL` com essa URL.
8. Faça um novo deploy do backend para aplicar o CORS atualizado.

---

## 🔐 Fluxo de Autenticação

```
1. Usuário acessa o frontend
        ↓
2. App verifica localStorage por um token existente
        ↓
   Token existe? → GET /auth/me (valida token)
        ↓                   ↓
   Token válido?       Token inválido/expirado
        ↓                   ↓
   Tela Principal      Remove token → Tela de Login
        ↓
3. Usuário não tem conta → Register
   POST /auth/register { email, senha }
        ↓
   Redireciona para Login
        ↓
4. Usuário faz login
   POST /auth/login { email, senha }
        ↓
   API retorna { access_token, token_type }
        ↓
   Token salvo no localStorage
        ↓
5. Tela Principal carregada
   Todas as requisições incluem:
   Authorization: Bearer <token>
        ↓
6. Usuário clica em Sair
   Remove token do localStorage → volta ao Login

────────────────────────────────────────────────
PROTEÇÃO DE ROTAS:

GET  /filmes       → PÚBLICO (sem token)
GET  /filmes/{id}  → PÚBLICO
POST /filmes       → PROTEGIDO (exige JWT válido)
PUT  /filmes/{id}  → PROTEGIDO
DELETE /filmes/{id}→ PROTEGIDO

GET  /auth/me      → PROTEGIDO
POST /auth/register→ PÚBLICO
POST /auth/login   → PÚBLICO
```

---

## 🧪 Endpoints da API

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/auth/register` | ❌ | Registra novo usuário |
| POST | `/auth/login` | ❌ | Autentica e retorna JWT |
| GET | `/auth/me` | ✅ | Dados do usuário logado |
| GET | `/filmes` | ❌ | Lista todos os filmes |
| GET | `/filmes/{id}` | ❌ | Busca filme por ID |
| POST | `/filmes` | ✅ | Cadastra novo filme |
| PUT | `/filmes/{id}` | ✅ | Atualiza filme existente |
| DELETE | `/filmes/{id}` | ✅ | Remove filme |

---

## ✅ Checklist de Requisitos

### Etapa 1 — PostgreSQL
- [x] SQLite removido completamente
- [x] SQLAlchemy configurado para PostgreSQL
- [x] psycopg2-binary adicionado
- [x] DATABASE_URL via variável de ambiente
- [x] python-dotenv implementado
- [x] backend/.env.example criado
- [x] Suporte automático a URLs `postgres://` → `postgresql://`

### Etapa 2 — Autenticação JWT
- [x] Model `Usuario` criado (id, email, senha_hash)
- [x] email único no banco
- [x] Senha armazenada apenas como hash bcrypt (passlib)
- [x] POST /auth/register
- [x] POST /auth/login
- [x] GET /auth/me
- [x] python-jose implementado
- [x] JWT com `sub = email` e `exp = expiração`
- [x] Expiração de 30 minutos
- [x] SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES via env
- [x] Dependência `get_usuario_atual()` com validação Bearer
- [x] Retorna 401 para token ausente, inválido ou expirado

### Etapa 3 — Proteção de Rotas
- [x] GET /filmes — PÚBLICO
- [x] GET /filmes/{id} — PÚBLICO
- [x] POST /filmes — PROTEGIDO
- [x] PUT /filmes/{id} — PROTEGIDO
- [x] DELETE /filmes/{id} — PROTEGIDO

### Etapa 4 — Frontend Auth
- [x] components/Login.jsx criado
- [x] components/Register.jsx criado
- [x] Fluxo: Registro → Login → Tela Principal
- [x] Token salvo em localStorage
- [x] Axios com interceptor de request (Authorization: Bearer)
- [x] Interceptor de response para 401 (remove token + redireciona)
- [x] Botão "Sair" (remove token + volta para login)
- [x] Visitantes não autenticados não acessam a tela principal
- [x] Verificação de token existente ao iniciar a aplicação

### Etapa 5 — Deploy Ready
- [x] VITE_API_URL com import.meta.env
- [x] Nenhum localhost fixo no código
- [x] CORS configurado para localhost:5173 e URL da Vercel (via env)
- [x] frontend/.env.example criado
- [x] Configurado para Render (backend) + Vercel (frontend) + Neon/Supabase (DB)

### Etapa 6 — README
- [x] Descrição do projeto
- [x] Tecnologias
- [x] Como rodar backend
- [x] Como rodar frontend
- [x] Variáveis de ambiente (backend e frontend)
- [x] Deploy Render
- [x] Deploy Vercel
- [x] Deploy PostgreSQL (Neon e Supabase)
- [x] Fluxo de autenticação completo
