"use client";

import styles from "./ListaTreinos.module.css";
import { Plus } from "lucide-react";
import { formatarData } from "../utils";

export default function ListaTreinos({
  treinos,
  treinoSelecionado,
  selecionarTreino,
  onCriarTreino,
}) {
  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.titulo}>Treinos</h3>
        <button
          type="button"
          className={styles.botaoAdicionar}
          onClick={onCriarTreino}
          title="Adicionar novo treino"
          aria-label="Adicionar novo treino"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className={styles.listaDias}>
        {treinos.length === 0 ? (
          <div className={styles.vazio}>
            <p>Nenhum treino cadastrado</p>
            <p className={styles.subtle}>Clique no + para criar</p>
          </div>
        ) : (
          treinos.map((treino) => {
            const ativo = treinoSelecionado?.codtreino === treino.codtreino;

            return (
              <button
                key={treino.codtreino}
                type="button"
                className={`${styles.botaoDia} ${ativo ? styles.ativo : ""}`}
                aria-pressed={ativo}
                onClick={() => selecionarTreino(treino)}
              >
                <span className={styles.nomeDia}>{treino.descricao}</span>
                <span className={styles.data}>
                  {formatarData(treino.datatreino)}
                </span>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}