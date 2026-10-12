"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import styles from "./top.module.css";

const TITULOS = {
  pacientes: "Pacientes",
  pacientesTreinador: "Pacientes",
  paciFisio: "Pacientes",
  alunos: "Alunos",
  calendario: "Calendário",
  diarios: "Diários",
  config: "Configurações",
  configuracoes: "Configurações",
  prontuario: "Prontuário clínico",
  treino: "Treino do aluno",
  treinos: "Treino do aluno",
};

function tituloDaRota(pathname) {
  const trechos = String(pathname || "")
    .split("/")
    .filter((t) => t && !/^\d+$/.test(t));

  const ultimo = trechos[trechos.length - 1];
  return TITULOS[ultimo] || "Visão geral";
}

const CARGOS = {
  "aluno-paciente": "Aluno-paciente",
  treinador: "Treinadora",
  psicologo: "Psicóloga",
  fisioterapeuta: "Fisioterapeuta",
};

function formatarCargo(tipo) {
  if (!tipo) return "";
  return CARGOS[tipo] || tipo.charAt(0).toUpperCase() + tipo.slice(1);
}

export default function Top() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const usuario = session?.user;

  const [fotoperfil, setFotoPerfil] = useState("");

  useEffect(() => {
    async function buscarFoto() {
      const id = usuario?.id;
      if (!id) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_AUTH_API}/api/Usuario/${id}`,
        );

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        setFotoPerfil(data.fotoperfil || "");
      } catch (error) {
        console.error("Erro ao buscar foto:", error);
      }
    }

    buscarFoto();
    window.addEventListener("foto-atualizada", buscarFoto);
    return () => window.removeEventListener("foto-atualizada", buscarFoto);
  }, [usuario?.id]);

  const profissaoFormatada = formatarCargo(usuario?.tipousuario?.toString());

  return (
    <header className={styles.top}>
      <p className={styles.titulo}>{tituloDaRota(pathname)}</p>

      <div className={styles.blocInfos}>
        <img
          src={fotoperfil || "/noprofile.svg"}
          alt=""
          width={44}
          height={44}
          className={styles.avatarInicial}
        />

        <div className={styles.subtopic}>
          <p className={styles.nome}>{usuario?.nome}</p>
          <p className={styles.prof}>{profissaoFormatada}</p>
        </div>

        <button
          type="button"
          className={styles.sair}
          onClick={() => signOut()}
        >
          Sair
        </button>
      </div>
    </header>
  );
}