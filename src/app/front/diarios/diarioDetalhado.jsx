import styles from "./diarioDetalhado.module.css";

export default function DiarioDetalhado({ diario }) {

  if (!diario) {
    return (
      <div className={styles.container}>
        <h2>Detalhes</h2>

        <p>Selecione um diário.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>

      <div className={styles.header}>

        <div>

          <h2>{diario.nome}</h2>

          <span className={styles.humor}>
            {diario.humor}
          </span>

        </div>

        <small>

          {new Date(diario.datadiario).toLocaleString("pt-BR", {
            dateStyle: "full",
            timeStyle: "short",
          })}

        </small>

      </div>

      <hr />

      <h3>Entrada do Diário</h3>

      <p className={styles.texto}>
        {diario.descricao}
      </p>

    </div>
  );
}