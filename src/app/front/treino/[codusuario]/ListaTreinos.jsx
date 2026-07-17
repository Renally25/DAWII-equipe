"use client";

import styles from "./ListaTreinos.module.css";
import { Plus } from "lucide-react";

export default function ListaTreinos({
  treinos,
  treinoSelecionado,
  selecionarTreino,
  onCriarTreino,
}) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.titulo}>Treinos</h3>
        <button
          className={styles.botaoAdicionar}
          onClick={onCriarTreino}
          title="Adicionar novo treino"
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
          treinos.map((treino) => (
            <button
              key={treino.codtreino}
              className={
                treinoSelecionado?.codtreino === treino.codtreino
                  ? styles.ativo
                  : styles.botaoDia
              }
              onClick={() => selecionarTreino(treino)}
            >
              <span className={styles.nomeDia}>
                {treino.descricao}
              </span>
              <span className={styles.data}>
                {new Date(treino.datatreino).toLocaleDateString("pt-BR")}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}