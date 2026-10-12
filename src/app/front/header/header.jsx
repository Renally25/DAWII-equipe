"use client";

import { signOut } from "next-auth/react";
import styles from "./header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      {/* .conteudo tem a mesma largura máxima da página, então tudo alinha */}
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

        {/* Se o seu fluxo de logout for outro, troque o onClick */}
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
