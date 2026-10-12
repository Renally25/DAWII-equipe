"use client";

import styles from "../../treino/[codusuario]/CardExercicio.module.css";
import { Pencil, Trash2, Dumbbell } from "lucide-react";

export default function CardExercicio({ exercicio, onEditar, onExcluir }) {

  const temCarga =
    exercicio.peso !== null &&
    exercicio.peso !== undefined &&
    Number(exercicio.peso) > 0;

  return (
    <article className={styles.card}>
      <div className={styles.topo}>
        <div>
          <h3>{exercicio.nome}</h3>

          {exercicio.descricao && <p>{exercicio.descricao}</p>}
        </div>

        <div className={styles.acoes}>
          <button
            type="button"
            className={styles.editar}
            onClick={() => onEditar(exercicio)}
            aria-label={`Editar ${exercicio.nome}`}
            title="Editar"
          >
            <Pencil size={18} />
          </button>

          <button
            type="button"
            className={styles.excluir}
            onClick={() => onExcluir(exercicio.codexercicio)}
            aria-label={`Excluir ${exercicio.nome}`}
            title="Excluir"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <dl className={styles.informacoes}>
        <div className={styles.stat}>
          <dt className={styles.label}>Séries</dt>
          <dd className={styles.valor}>
            <Dumbbell size={16} aria-hidden="true" />
            {exercicio.series} x {exercicio.repeticoes}
          </dd>
        </div>

        {temCarga && (
          <div className={styles.stat}>
            <dt className={styles.label}>Carga</dt>
            <dd className={`${styles.valor} ${styles.kg}`}>
              {exercicio.peso} kg
            </dd>
          </div>
        )}
      </dl>
    </article>
  );
}