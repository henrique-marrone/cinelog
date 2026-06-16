import { useState } from 'react'
import { registrar } from '../services/api'

/**
 * Register — formulário de criação de conta.
 *
 * Props:
 *  - onRegistroSucesso: callback chamado após cadastro bem-sucedido
 *  - onIrParaLogin: callback para navegar de volta para a tela de login
 */
function Register({ onRegistroSucesso, onIrParaLogin }) {
  const [form, setForm] = useState({ email: '', senha: '', confirmar: '' })
  const [erro, setErro] = useState(null)
  const [carregando, setCarregando] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro(null)

    if (form.senha !== form.confirmar) {
      setErro('As senhas não coincidem.')
      return
    }

    if (form.senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setCarregando(true)
    try {
      await registrar({ email: form.email, senha: form.senha })
      onRegistroSucesso()
    } catch (err) {
      setErro(err.response?.data?.detail || 'Erro ao criar a conta. Tente novamente.')
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

        <h2 className="auth-title">Criar conta</h2>

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
              placeholder="Mínimo 6 caracteres"
              value={form.senha}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmar">Confirmar Senha</label>
            <input
              id="confirmar"
              name="confirmar"
              type="password"
              placeholder="Repita a senha"
              value={form.confirmar}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={carregando}
          >
            {carregando ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="auth-link">
          Já tem uma conta?{' '}
          <button className="link-btn" onClick={onIrParaLogin}>
            Fazer login
          </button>
        </p>
      </div>
    </div>
  )
}

export default Register
