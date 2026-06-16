import { useState, useEffect } from 'react'
import Login from './components/Login'
import Register from './components/Register'
import FilmeForm from './components/FilmeForm'
import FilmeTabela from './components/FilmeTabela'
import {
  listarFilmes,
  criarFilme,
  atualizarFilme,
  deletarFilme,
  getMe,
} from './services/api'

/**
 * App — componente raiz da aplicação CineLog V2.
 *
 * Fluxo de autenticação:
 *   1. Ao montar, verifica se há token no localStorage.
 *   2. Se sim, valida o token chamando GET /auth/me.
 *   3. Se o token for válido → exibe a tela principal.
 *   4. Se não houver token ou for inválido → exibe Login.
 *   5. O usuário pode navegar entre Login e Register.
 *   6. Ao clicar em Sair → remove o token e volta ao Login.
 */
function App() {
  // ── Estado de autenticação ──────────────────────────────────
  const [tela, setTela] = useState('login')          // 'login' | 'register' | 'app'
  const [usuario, setUsuario] = useState(null)        // dados do usuário logado
  const [verificando, setVerificando] = useState(true) // checando token na inicialização

  // ── Estado dos filmes ────────────────────────────────────────
  const [filmes, setFilmes] = useState([])
  const [filmeEditando, setFilmeEditando] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [alerta, setAlerta] = useState(null)

  // ── Verifica token salvo ao iniciar ─────────────────────────
  useEffect(() => {
    const verificarToken = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setVerificando(false)
        return
      }
      try {
        const { data } = await getMe()
        setUsuario(data)
        setTela('app')
      } catch {
        // Token inválido ou expirado
        localStorage.removeItem('token')
      } finally {
        setVerificando(false)
      }
    }
    verificarToken()
  }, [])

  // ── Carrega filmes ao entrar na tela principal ───────────────
  useEffect(() => {
    if (tela === 'app') fetchFilmes()
  }, [tela])

  // ── Helpers ──────────────────────────────────────────────────

  const mostrarAlerta = (tipo, msg) => {
    setAlerta({ tipo, msg })
    setTimeout(() => setAlerta(null), 4000)
  }

  const fetchFilmes = async () => {
    setCarregando(true)
    try {
      const { data } = await listarFilmes()
      setFilmes(data)
    } catch {
      mostrarAlerta('erro', 'Não foi possível carregar os filmes.')
    } finally {
      setCarregando(false)
    }
  }

  // ── Handlers de autenticação ─────────────────────────────────

  const handleLoginSucesso = async (token) => {
    try {
      const { data } = await getMe()
      setUsuario(data)
      setTela('app')
    } catch {
      localStorage.removeItem('token')
    }
  }

  const handleRegistroSucesso = () => {
    mostrarAlerta && null // alerta só aparece na tela de login
    setTela('login')
  }

  const handleSair = () => {
    localStorage.removeItem('token')
    setUsuario(null)
    setFilmes([])
    setFilmeEditando(null)
    setTela('login')
  }

  // ── CRUD de filmes ───────────────────────────────────────────

  const handleSubmit = async (dados) => {
    setSalvando(true)
    try {
      if (filmeEditando) {
        await atualizarFilme(filmeEditando.id, dados)
        mostrarAlerta('sucesso', `"${dados.titulo}" atualizado com sucesso!`)
        setFilmeEditando(null)
      } else {
        await criarFilme(dados)
        mostrarAlerta('sucesso', `"${dados.titulo}" cadastrado com sucesso!`)
      }
      await fetchFilmes()
    } catch (err) {
      const msg =
        err.response?.data?.detail || 'Erro ao salvar o filme. Verifique os dados.'
      mostrarAlerta('erro', msg)
    } finally {
      setSalvando(false)
    }
  }

  const handleDeletar = async (id, titulo) => {
    const confirmado = window.confirm(
      `Tem certeza que deseja remover o filme "${titulo}"?\n\nEssa ação não pode ser desfeita.`
    )
    if (!confirmado) return
    try {
      await deletarFilme(id)
      mostrarAlerta('sucesso', `"${titulo}" removido com sucesso!`)
      if (filmeEditando?.id === id) setFilmeEditando(null)
      await fetchFilmes()
    } catch (err) {
      mostrarAlerta('erro', err.response?.data?.detail || 'Erro ao remover o filme.')
    }
  }

  const handleEditar = (filme) => {
    setFilmeEditando(filme)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelar = () => setFilmeEditando(null)

  // ── Render de inicialização ──────────────────────────────────

  if (verificando) {
    return (
      <div className="auth-page">
        <div className="estado-vazio">
          <span className="estado-icone">⏳</span>
          <p>Verificando sessão...</p>
        </div>
      </div>
    )
  }

  // ── Telas de autenticação ────────────────────────────────────

  if (tela === 'login') {
    return (
      <Login
        onLoginSucesso={handleLoginSucesso}
        onIrParaRegister={() => setTela('register')}
      />
    )
  }

  if (tela === 'register') {
    return (
      <Register
        onRegistroSucesso={handleRegistroSucesso}
        onIrParaLogin={() => setTela('login')}
      />
    )
  }

  // ── Tela principal (autenticado) ─────────────────────────────

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="header-top">
            <div className="logo">
              <span className="logo-icon">🎬</span>
              <span className="logo-text">CineLog</span>
            </div>
            <div className="header-usuario">
              <span className="usuario-email">👤 {usuario?.email}</span>
              <button className="btn btn-sair" onClick={handleSair}>
                Sair
              </button>
            </div>
          </div>
          <p className="header-sub">Sua lista pessoal de filmes assistidos</p>
        </div>
      </header>

      <main className="main">
        {alerta && (
          <div className={`alerta alerta-${alerta.tipo}`} role="alert">
            <span>{alerta.tipo === 'sucesso' ? '✅' : '❌'}</span>
            {alerta.msg}
          </div>
        )}

        <FilmeForm
          filmeEditando={filmeEditando}
          onSubmit={handleSubmit}
          onCancelar={handleCancelar}
          carregando={salvando}
        />
 
        <FilmeTabela
          filmes={filmes}
          onEditar={handleEditar}
          onDeletar={handleDeletar}
          carregando={carregando}
        />
      </main>

      <footer className="footer">
        <p>CineLog &copy; {new Date().getFullYear()} — Trabalho Acadêmico · Ciência da Computação</p>
      </footer>
    </div>
  )
}

export default App
