import { useState } from 'react'
import { login } from '../services/api'

/**
 * Login — formulário de autenticação.
 *
 * Props:
 *  - onLoginSucesso: callback chamado após login bem-sucedido (recebe o token)
 *  - onIrParaRegister: callback para navegar para a tela de cadastro
 */
function Login({ onLoginSucesso, onIrParaRegister }) {
  const [form, setForm] = useState({ email: '', senha: '' })
  const [erro, setErro] = useState(null)
  const [carregando, setCarregando] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro(null)
    setCarregando(true)
    try {
      const { data } = await login(form)
      // Persiste o token no localStorage
      localStorage.setItem('token', data.access_token)
      onLoginSucesso(data.access_token)
    } catch (err) {
      setErro(err.response?.data?.detail || 'Erro ao fazer login. Verifique suas credenciais.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <span className="logo-icon">🎬</span>
          <span className="logo-text">CineLog</span>
        </div>
        <p className="auth-subtitle">Sua lista pessoal de filmes assistidos</p>

        <h2 className="auth-title">Entrar na conta</h2>

        {erro && (
          <div className="alerta alerta-erro" role="alert">
            <span>❌</span> {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              name="senha"
              type="password"
              placeholder="Sua senha"
              value={form.senha}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={carregando}
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="auth-link">
          Não tem uma conta?{' '}
          <button className="link-btn" onClick={onIrParaRegister}>
            Criar conta
          </button>
        </p>
      </div>
    </div>
  )
}

export default Login
