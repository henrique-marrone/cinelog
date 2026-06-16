import { useState, useEffect } from 'react'

/**
 * FilmeForm — componente reutilizável para cadastro e edição de filmes.
 *
 * Props:
 *  - filmeEditando: objeto com dados do filme (modo edição) ou null (modo criação)
 *  - onSubmit: função chamada ao enviar o formulário
 *  - onCancelar: função chamada ao clicar em Cancelar
 *  - carregando: boolean para desabilitar o botão durante requisição
 */
function FilmeForm({ filmeEditando, onSubmit, onCancelar, carregando }) {
  // Estado interno do formulário
  const [form, setForm] = useState({
    titulo: '',
    diretor: '',
    ano_lancamento: '',
    nota: '',
  })

  // Preenche o formulário quando entrar em modo de edição
  useEffect(() => {
    if (filmeEditando) {
      setForm({
        titulo: filmeEditando.titulo,
        diretor: filmeEditando.diretor,
        ano_lancamento: filmeEditando.ano_lancamento,
        nota: filmeEditando.nota,
      })
    } else {
      // Limpa o formulário ao sair do modo de edição
      setForm({ titulo: '', diretor: '', ano_lancamento: '', nota: '' })
    }
  }, [filmeEditando])

  // Atualiza o campo correspondente no estado ao digitar
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // Envia os dados ao componente pai
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      titulo: form.titulo.trim(),
      diretor: form.diretor.trim(),
      ano_lancamento: parseInt(form.ano_lancamento),
      nota: parseFloat(form.nota),
    })
  }

  const modoEdicao = !!filmeEditando

  return (
    <div className="form-card">
      <h2 className="form-title">
        {modoEdicao ? '✏️ Editar Filme' : '➕ Cadastrar Filme'}
      </h2>

      <form onSubmit={handleSubmit} className="form">
        {/* Título */}
        <div className="form-group">
          <label htmlFor="titulo">Título do Filme</label>
          <input
            id="titulo"
            name="titulo"
            type="text"
            placeholder="Ex.: O Poderoso Chefão"
            value={form.titulo}
            onChange={handleChange}
            required
            maxLength={200}
          />
        </div>

        {/* Diretor */}
        <div className="form-group">
          <label htmlFor="diretor">Diretor</label>
          <input
            id="diretor"
            name="diretor"
            type="text"
            placeholder="Ex.: Francis Ford Coppola"
            value={form.diretor}
            onChange={handleChange}
            required
            maxLength={200}
          />
        </div>

        {/* Ano e Nota na mesma linha */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="ano_lancamento">Ano de Lançamento</label>
            <input
              id="ano_lancamento"
              name="ano_lancamento"
              type="number"
              placeholder="Ex.: 1972"
              value={form.ano_lancamento}
              onChange={handleChange}
              required
              min={1888}
              max={2100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="nota">Nota (0 – 10)</label>
            <input
              id="nota"
              name="nota"
              type="number"
              placeholder="Ex.: 9.5"
              value={form.nota}
              onChange={handleChange}
              required
              min={0}
              max={10}
              step={0.1}
            />
          </div>
        </div>

        {/* Botões */}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={carregando}>
            {carregando
              ? 'Salvando...'
              : modoEdicao
              ? 'Salvar Alterações'
              : 'Cadastrar Filme'}
          </button>

          {modoEdicao && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancelar}
              disabled={carregando}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default FilmeForm
