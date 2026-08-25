"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import styles from "./top.module.css";

export default function Top() {
  const { data: session } = useSession();

  const usuario = session?.user;

  const [fotoperfil, setFotoPerfil] = useState("");

  useEffect(() => {
    async function buscarFoto() {
      if (!usuario?.id) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_AUTH_API}/api/Usuario/${usuario.id}`,
        );

        if (!response.ok) {
          throw new Error("Erro ao buscar foto de perfil.");
        }

        const data = await response.json();

        setFotoPerfil(data.fotoperfil || "");
      } catch (error) {
        console.error("Erro ao buscar foto:", error);
      }
    }

    buscarFoto();
  }, [usuario?.id]);

  const profissao = usuario?.tipousuario?.toString() || "";

  const profissaoFormatada = profissao !== "fisioterapeuta"
    ? profissao.charAt(0).toUpperCase() + profissao.slice(1) + " (a)"
    : profissao.charAt(0).toUpperCase() + profissao.slice(1);

  return (
    <div className={styles.top}>
      <p>Visão Geral</p>

      <div className={styles.blocInfos}>
        <img
          src={fotoperfil || "/noprofile.svg"}
          alt="avatar"
          className={styles.avatarInicial}
        />

        <div className={styles.subtopic}>
          <p>{usuario?.nome}</p>

          <p className={styles.prof}>
            {profissaoFormatada}
          </p>
        </div>
      </div>
    </div>
  );
}