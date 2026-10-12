"use client";

import styles from "../../treino/[codusuario]/ListaExercicios.module.css";
import CardExercicio from "./CardExercicio";
import { Plus } from "lucide-react";

export default function ListaExercicios({
  protocolo,
  dia,
  onEditar,
  onExcluir,
  onAdicionar,
  temProtocolo,
}) {
  const exercicios = protocolo?.[dia]?.exercicios ?? protocolo?.[dia] ?? [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>{dia || "Protocolo"}</h2>

          <p>
            {exercicios.length}{" "}
            {exercicios.length === 1 ? "exercício" : "exercícios"}
          </p>
        </div>

        <button
          type="button"
          className={styles.botaoAdicionar}
          onClick={onAdicionar}
          disabled={!temProtocolo}
          title={!temProtocolo ? "Crie um protocolo primeiro" : ""}
        >
          <Plus size={18} aria-hidden="true" />
          Adicionar exercício
        </button>
      </div>

      {!temProtocolo ? (
        <div className={styles.vazio}>
          <h3>Nenhum protocolo selecionado</h3>
          <p>
            Crie um protocolo no painel ao lado para começar a adicionar
            exercícios.
          </p>
        </div>
      ) : exercicios.length === 0 ? (
        <div className={styles.vazio}>
          <h3>Nenhum exercício cadastrado</h3>
          <p>
            Clique em &quot;Adicionar exercício&quot; para montar este
            protocolo.
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