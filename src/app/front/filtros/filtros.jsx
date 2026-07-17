"use client";

import styles from "./filtros.module.css";

export default function FiltrosDiarios({
  ordem,
  setOrdem,
}) {
  return (
    <div className={styles.filtros}>
      <select value={ordem} onChange={(e) => setOrdem(e.target.value)}>
        <option value="az">A-Z</option>
        <option value="za">Z-A</option>
        <option value="recentes">Mais recentes</option>
        <option value="antigos">Mais antigos</option>
      </select>
    </div>
  );
}