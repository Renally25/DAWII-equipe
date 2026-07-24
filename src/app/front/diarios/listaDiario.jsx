"use client";

import styles from "./listaDiarios.module.css";

import Busca from "../barraDeBusca/busca";
import Filtros from "../filtros/filtros";

import { useDiariosFiltros } from "./useDiariosFiltros";

import { useEffect, useState } from "react";

export default function ListaDiarios({ abrirDiario, diarioSelecionado }) {
  const [diarios, setDiarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const { busca, setBusca, ordem, setOrdem, onBuscar, resultados } =
    useDiariosFiltros(diarios);

  useEffect(() => {
    async function carregar() {
      const result = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API}/api/Diario`);
      const data = await result.json();

      setDiarios(data);
      setLoading(false);
    }

    carregar();
  }, []);

  if (loading) return <p>Carregando...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.topo}>
        <Busca busca={busca} setBusca={setBusca} onBuscar={onBuscar} className={styles.busca}/>

        <Filtros ordem={ordem} setOrdem={setOrdem} />
      </div>

      <h1>Diários do Paciente</h1>

      <div className={styles.lista}>
        {resultados.map((diario) => (
          <div
            key={diario.coddiario}
            className={`${styles.card} ${
              diarioSelecionado?.coddiario === diario.coddiario
                ? styles.cardSelecionado
                : ""
            }`}
            onClick={() => abrirDiario(diario.coddiario)}
          >
            <div className={styles.header}>
              <div>
                <h3>{diario.nome}</h3>

                <span className={styles.tag}>{diario.humor}</span>
              </div>

              <small>
                {new Date(diario.datadiario).toLocaleString("pt-BR", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </small>
            </div>

            <p>{diario.descricao}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
