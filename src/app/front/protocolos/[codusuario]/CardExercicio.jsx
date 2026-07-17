"use client";

import styles from "../../treino/[codusuario]/CardExercicio.module.css";
import { Pencil, Trash2, Dumbbell } from "lucide-react";

export default function CardExercicio({
  exercicio,
  onEditar,
  onExcluir,
}) {
  return (
    <div className={styles.card}>

      <div className={styles.topo}>

        <div>

          <h3>{exercicio.nome}</h3>

          {exercicio.descricao && (
            <p>{exercicio.descricao}</p>
          )}

        </div>

        <div className={styles.acoes}>

          <button
            className={styles.editar}
            onClick={() => onEditar(exercicio)}
          >
            <Pencil size={18}/>
          </button>

          <button
            className={styles.excluir}
            onClick={() => onExcluir(exercicio.codexercicio)}
          >
            <Trash2 size={18}/>
          </button>

        </div>

      </div>

      <div className={styles.informacoes}>

        <div className={styles.info}>

          <Dumbbell size={18}/>

          <div>

            <span className={styles.valor}>
              {exercicio.series} x {exercicio.repeticoes}
            </span>

            <span className={styles.label}>
              Séries
            </span>

          </div>

        </div>

        <div className={styles.info}>

          <div className={styles.kg}>
            {exercicio.peso} kg
          </div>

          <span className={styles.label}>
            Carga
          </span>

        </div>

        {/* 🔥 REMOVIDO O BLOCO DO DESCANSO */}

      </div>

    </div>
  );
}