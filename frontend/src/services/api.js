import axios from 'axios'

// ─────────────────────────────────────────────────────────────
// BASE URL — lida da variável de ambiente Vite.
// Em desenvolvimento: defina VITE_API_URL=http://localhost:8000 no .env
// Em produção (Vercel): defina VITE_API_URL=https://sua-api.onrender.com
// NUNCA use localhost fixo aqui.
// ─────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ── Interceptor de REQUEST ────────────────────────────────────
// Adiciona automaticamente o token JWT em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Interceptor de RESPONSE ───────────────────────────────────
// Ao receber 401 (não autorizado / token expirado):
//   1. Remove o token do localStorage
//   2. Redireciona para a tela de login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || ''

    if (
      error.response?.status === 401 &&
      !url.includes('/auth/login')
    ) {
      localStorage.removeItem('token')
      window.location.href = '/'
    }

    return Promise.reject(error)
  }
)

// ── AUTENTICAÇÃO ──────────────────────────────────────────────

export const registrar = (dados) => api.post('/auth/register', dados)
export const login = (dados) => api.post('/auth/login', dados)
export const getMe = () => api.get('/auth/me')

// ── FILMES ────────────────────────────────────────────────────

export const listarFilmes = () => api.get('/filmes')
export const buscarFilme = (id) => api.get(`/filmes/${id}`)
export const criarFilme = (dados) => api.post('/filmes', dados)
export const atualizarFilme = (id, dados) => api.put(`/filmes/${id}`, dados)
export const deletarFilme = (id) => api.delete(`/filmes/${id}`)

export default api
