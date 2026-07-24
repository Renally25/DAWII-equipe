"use client";

import { useState } from "react";

import Sidebar from "../sidebar/sidebar";
import Top from "../top/top";
import { profiles } from "../sidebar/profiles";

import ListaDiarios from "./listaDiario";
import DiarioDetalhado from "./diarioDetalhado";

import styles from "./diario.module.css";

export default function DiarioPage() {
  const [diarioSelecionado, setDiarioSelecionado] = useState(null);

  async function abrirDiario(coddiario) {
    // Se clicou no diário que já está aberto, fecha o painel
    if (diarioSelecionado?.coddiario === coddiario) {
      setDiarioSelecionado(null);
      return;
    }

    try {
      const result = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_API}/api/Diario/${coddiario}`,
      );

      if (!result.ok) {
        throw new Error("Erro ao carregar diário.");
      }

      const diario = await result.json();

      setDiarioSelecionado(diario);
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <div className={styles.dashboard}>
      <Sidebar profile={profiles.psicologa} />
      <div className={styles.main}>
        <Top />

        <div
          className={
            diarioSelecionado
              ? styles.conteudoComDetalhes
              : styles.conteudoSemDetalhes
          }
        >
          <ListaDiarios
            abrirDiario={abrirDiario}
            diarioSelecionado={diarioSelecionado}
          />

          {diarioSelecionado && <DiarioDetalhado diario={diarioSelecionado} />}
        </div>
      </div>
    </div>
  );
}
