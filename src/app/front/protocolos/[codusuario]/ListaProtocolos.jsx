"use client";

import styles from "../../treino/[codusuario]/ListaTreinos.module.css";
import { formatarData } from "../../treino/utils";
import { Plus } from "lucide-react";

export default function ListaProtocolos({
  protocolos,
  protocoloSelecionado,
  selecionarProtocolo,
  onCriarProtocolo,
}) {
  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.titulo}>Protocolos</h3>
        <button
          type="button"
          className={styles.botaoAdicionar}
          onClick={onCriarProtocolo}
          title="Adicionar novo protocolo"
          aria-label="Adicionar novo protocolo"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className={styles.listaDias}>
        {protocolos.length === 0 ? (
          <div className={styles.vazio}>
            <p>Nenhum protocolo cadastrado</p>
            <p className={styles.subtle}>Clique no + para criar</p>
          </div>
        ) : (
          protocolos.map((protocolo) => {
            const ativo =
              protocoloSelecionado?.codprotocolo === protocolo.codprotocolo;

            return (
              <button
                key={protocolo.codprotocolo}
                type="button"
                className={`${styles.botaoDia} ${ativo ? styles.ativo : ""}`}
                aria-pressed={ativo}
                onClick={() => selecionarProtocolo(protocolo)}
              >
                <span className={styles.nomeDia}>{protocolo.descricao}</span>
                <span className={styles.data}>
                  {formatarData(protocolo.dataprotocolo)}
                </span>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}