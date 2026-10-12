"use client";

import styles from "./ListaExercicios.module.css";
import CardExercicio from "./CardExercicio";
import { Plus } from "lucide-react";

export default function ListaExercicios({
  treino,
  dia,
  onEditar,
  onExcluir,
  onAdicionar,
  temTreino,
}) {
  const exercicios = treino?.[dia]?.exercicios ?? treino?.[dia] ?? [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>{dia || "Treino"}</h2>

          <p>
            {exercicios.length}{" "}
            {exercicios.length === 1 ? "exercício" : "exercícios"}
          </p>
        </div>

        <button
          type="button"
          className={styles.botaoAdicionar}
          onClick={onAdicionar}
          disabled={!temTreino}
          title={!temTreino ? "Crie um treino primeiro" : ""}
        >
          <Plus size={18} aria-hidden="true" />
          Adicionar exercício
        </button>
      </div>

      {!temTreino ? (
        <div className={styles.vazio}>
          <h3>Nenhum treino selecionado</h3>
          <p>
            Crie um treino no painel ao lado para começar a adicionar
            exercícios.
          </p>
        </div>
      ) : exercicios.length === 0 ? (
        <div className={styles.vazio}>
          <h3>Nenhum exercício cadastrado</h3>
          <p>
            Clique em &quot;Adicionar exercício&quot; para montar o treino
            deste dia.
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