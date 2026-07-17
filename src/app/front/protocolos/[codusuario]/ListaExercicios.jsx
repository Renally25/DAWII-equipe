"use client";

import styles from "../../treino/[codusuario]/ListaExercicios.module.css";
import CardExercicio from "./CardExercicio";

export default function ListaExercicios({
  protocolo,
  dia,
  onEditar,
  onExcluir,
  onAdicionar,
  temProtocolo,
}) {

  const exercicios =
    protocolo?.[dia]?.exercicios ??
    protocolo?.[dia] ??
    [];

  return (
    <div className={styles.container}>

      <div className={styles.header}>

        <div>
          <h2>{dia || "Protocolo"}</h2>

          <p>
            {exercicios.length} exercício
            {exercicios.length !== 1 && "s"}
          </p>

        </div>

        <button
          className={styles.botaoAdicionar}
          onClick={onAdicionar}
          disabled={!temProtocolo}
          title={!temProtocolo ? "Crie um protocolo primeiro" : ""}
        >
          + Adicionar exercício
        </button>

      </div>

      {!temProtocolo ? (
        <div className={styles.vazio}>
          <h3>Nenhum protocolo selecionado</h3>
          <p>
            Crie um protocolo no painel esquerdo para começar a adicionar exercícios.
          </p>
        </div>
      ) : exercicios.length === 0 ? (
        <div className={styles.vazio}>
          <h3>Nenhum exercício cadastrado.</h3>
          <p>
            Clique em "Adicionar exercício" para criar o treino deste dia.
          </p>
        </div>
      ) : (
        <div className={styles.lista}>
          {exercicios.map((exercicio) => (
            <CardExercicio
              key={exercicio.codexercicio}
              exercicio={exercicio}
              onEditar={onEditar}
              onExcluir={onExcluir}
            />
          ))}
        </div>
      )}

    </div>
  );
}