"use client";

import styles from "../../treino/[codusuario]/ListaTreinos.module.css";
import { Plus } from "lucide-react";

export default function ListaProtocolos({
  protocolos,
  protocoloSelecionado,
  selecionarProtocolo,
  onCriarProtocolo,
}) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.titulo}>Protocolos</h3>
        <button
          className={styles.botaoAdicionar}
          onClick={onCriarProtocolo}
          title="Adicionar novo protocolo"
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
          protocolos.map((protocolo) => (
            <button
              key={protocolo.codprotocolo}
              className={
                protocoloSelecionado?.codprotocolo === protocolo.codprotocolo
                  ? styles.ativo
                  : styles.botaoDia
              }
              onClick={() => selecionarProtocolo(protocolo)}
            >
              <span className={styles.nomeDia}>
                {protocolo.descricao}
              </span>
              <span className={styles.data}>
                {protocolo.dataprotocolo
                  ? new Date(protocolo.dataprotocolo).toLocaleDateString("pt-BR")
                  : ""}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}