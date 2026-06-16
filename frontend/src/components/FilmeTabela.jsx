/**
 * FilmeTabela — componente responsável por exibir a lista de filmes.
 *
 * Props:
 *  - filmes: array de objetos com os filmes a exibir
 *  - onEditar: função chamada ao clicar em Editar (recebe o objeto filme)
 *  - onDeletar: função chamada ao clicar em Remover (recebe o id do filme)
 *  - carregando: boolean indicando se os dados ainda estão sendo buscados
 */
function FilmeTabela({ filmes, onEditar, onDeletar, carregando }) {
  // Converte a nota numérica em estrelas visuais
  const renderEstrelas = (nota) => {
    const cheia = Math.floor(nota / 2)
    const meia = nota / 2 - cheia >= 0.5 ? 1 : 0
    const vazia = 5 - cheia - meia
    return (
      <span className="estrelas" title={`${nota}/10`}>
        {'★'.repeat(cheia)}
        {meia ? '½' : ''}
        {'☆'.repeat(vazia)}
      </span>
    )
  }

  // Retorna a classe CSS de cor da nota
  const corNota = (nota) => {
    if (nota >= 8) return 'nota-alta'
    if (nota >= 6) return 'nota-media'
    return 'nota-baixa'
  }

  // ── Estados de carregamento e lista vazia ───────────────
  if (carregando) {
    return (
      <div className="estado-vazio">
        <span className="estado-icone">⏳</span>
        <p>Carregando filmes...</p>
      </div>
    )
  }

  if (filmes.length === 0) {
    return (
      <div className="estado-vazio">
        <span className="estado-icone">🎬</span>
        <p className="estado-titulo">Nenhum filme cadastrado ainda</p>
        <p className="estado-subtitulo">
          Use o formulário acima para adicionar seu primeiro filme!
        </p>
      </div>
    )
  }

  // ── Tabela principal ────────────────────────────────────
  return (
    <div className="tabela-wrapper">
      <div className="tabela-header">
        <h2 className="tabela-titulo">🎞️ Minha Filmoteca</h2>
        <span className="tabela-contador">
          {filmes.length} {filmes.length === 1 ? 'filme' : 'filmes'}
        </span>
      </div>

      <div className="tabela-scroll">
        <table className="tabela">
          <thead>
            <tr>
              <th>#</th>
              <th>Título</th>
              <th>Diretor</th>
              <th>Ano</th>
              <th>Nota</th>
              <th>Avaliação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filmes.map((filme, index) => (
              <tr key={filme.id} className="tabela-linha">
                <td className="col-index">{index + 1}</td>
                <td className="col-titulo">{filme.titulo}</td>
                <td className="col-diretor">{filme.diretor}</td>
                <td className="col-ano">{filme.ano_lancamento}</td>
                <td className="col-nota">
                  <span className={`badge-nota ${corNota(filme.nota)}`}>
                    {filme.nota.toFixed(1)}
                  </span>
                </td>
                <td className="col-estrelas">{renderEstrelas(filme.nota)}</td>
                <td className="col-acoes">
                  <button
                    className="btn-acao btn-editar"
                    onClick={() => onEditar(filme)}
                    title="Editar filme"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    className="btn-acao btn-remover"
                    onClick={() => onDeletar(filme.id, filme.titulo)}
                    title="Remover filme"
                  >
                    🗑️ Remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default FilmeTabela
