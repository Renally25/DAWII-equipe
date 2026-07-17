"use client";

import { useMemo, useState } from "react";

export function useDiariosFiltros(diarios) {
  const [busca, setBusca] = useState("");
  const [query, setQuery] = useState("");

  const [ordem, setOrdem] = useState("az");

  const onBuscar = (valor) => {
    setQuery(valor);
  };

  const resultados = useMemo(() => {
    let lista = [...diarios];

    // Busca
    if (query.trim()) {
      const termo = query.toLowerCase();

      lista = lista.filter(
        (d) =>
          d.nome?.toLowerCase().includes(termo) ||
          d.descricao?.toLowerCase().includes(termo) ||
          d.humor?.toLowerCase().includes(termo)
      );
    }

    // Ordenação por tempo
    if (ordem === "recentes") {
      lista.sort(
        (a, b) =>
          new Date(b.datadiario).getTime() -
          new Date(a.datadiario).getTime()
      );
    }

    if (ordem === "antigos") {
      lista.sort(
        (a, b) =>
          new Date(a.datadiario).getTime() -
          new Date(b.datadiario).getTime()
      );
    }

    // Ordem alfabética
    if (!ordem) {
      lista.sort((a, b) =>
        ordem === "az"
          ? a.nome.localeCompare(b.nome)
          : b.nome.localeCompare(a.nome)
      );
    }

    return lista;
  }, [diarios, query, ordem]);

  return {
    busca,
    setBusca,

    ordem,
    setOrdem,

    onBuscar,

    resultados,
  };
}