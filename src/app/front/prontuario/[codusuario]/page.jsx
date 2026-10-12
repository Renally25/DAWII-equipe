"use client";

import Link from "next/link";
import styles from "./page.module.css";
import Sidebar from "../../sidebar/sidebar";
import { profiles } from "../../sidebar/profiles";

import Top from "../../top/top";
import Prontuario from "./prontuario";

export default function PageProntuario() {
  return (
    <div className={styles.dashboard}>
      <Sidebar profile={profiles.psicologo} />

      <div className={styles.container}>
        <Top />

        <div className={styles.topoPagina}>
          <Link href="/front/pacientes" className={styles.voltar}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Voltar para pacientes
          </Link>

          <h1 className={styles.titulo}>Prontuário clínico</h1>
        </div>

        <Prontuario />
      </div>
    </div>
  );
}