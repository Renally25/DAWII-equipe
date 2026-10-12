"use client";

import { signOut } from "next-auth/react";
import styles from "./header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.conteudo}>
        <div className={styles.marca}>
          <img
            className={styles.img}
            src="/logo.png"
            alt="Raggio Academia"
            width={64}
            height={64}
          />
          <h1 className={styles.titulo}>Página do administrador</h1>
        </div>

        <button
          type="button"
          className={styles.sair}
          onClick={() => signOut({ callbackUrl: "/front/login" })}
        >
          Sair
        </button>
      </div>
    </header>
  );
}
