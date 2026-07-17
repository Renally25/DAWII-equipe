"use client";

import styles from "./page.module.css";
import Sidebar from "../../sidebar/sidebar";
import { profiles } from "../../sidebar/profiles";

import Top from "../../top/top";
import Prontuario from "./prontuario";

export default function PageProntuario() {
  return (
    <div className={styles.dashboard}>
      <Sidebar profile={profiles.psicologa} />

      <div className={styles.container}>
        <Top />
        <h1 className={styles.titulo}>Prontuário Clínico</h1>
        <Prontuario />
      </div>
    </div>
  );
}
