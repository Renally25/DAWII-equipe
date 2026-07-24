"use client";

import { useSession } from "next-auth/react";
import { temPermissao } from "@/lib/permissoes";
import { useEffect, useState } from "react";
import Link from "next/link";

import Sidebar from "../sidebar/sidebar";
import { profiles } from "../sidebar/profiles";
import Top from "../top/top";

import styles from "./dashboard.module.css";
import cardsStyles from "./cards.module.css";
import alertasStyles from "./alertas.module.css";
import diariosStyles from "./diariosRecentes.module.css";

function DiariosRecentes() {
  const [diarios, setDiarios] = useState([]);

  useEffect(() => {
    const buscarDiarios = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API}/api/Diario`);
        const data = await response.json();
        const listaDiarios = Array.isArray(data) ? data : data.diarios || [];

        const diariosOrdenados = listaDiarios.sort(
          (a, b) => new Date(b.datadiario) - new Date(a.datadiario),
        );

        setDiarios(diariosOrdenados.slice(0, 4));
      } catch (error) {
        console.error("Erro ao buscar diários:", error);
      }
    };

    buscarDiarios();
  }, []);

  return (
    <div className={diariosStyles.container}>
      <div className={diariosStyles.header}>
        <h2>Diários Recentes</h2>
        {/* Corrigido: usando diariosStyles para manter a coesão */}
        <Link href="./diarios" className={diariosStyles.botaoLink}>
          Ver todos
        </Link>
      </div>

      {diarios.map((diario) => {
        const nomeUsuario = diario.nome_usuario || diario.nome || "Usuário";
        const inicial = nomeUsuario.charAt(0).toUpperCase();

        return (
          <div key={diario.coddiario} className={diariosStyles.card}>
            {/* Corrigido: renderizando apenas a inicial do nome */}
            <div className={diariosStyles.avatar}>{inicial}</div>

            <div className={diariosStyles.conteudo}>
              <div className={diariosStyles.topo}>
                <span className={diariosStyles.nome}>
                  {nomeUsuario}{" "}
                  <small
                    style={{
                      fontSize: "0.8rem",
                      color: "#888",
                      fontWeight: "normal",
                    }}
                  >
                    (#{diario.coddiario})
                  </small>
                </span>

                <span className={diariosStyles.data}>
                  {diario.datadiario
                    ? new Date(diario.datadiario).toLocaleDateString("pt-BR")
                    : ""}
                </span>
              </div>
              <p className={diariosStyles.texto}>{diario.descricao}</p>
              {/* Corrigido: trocado de <a> para <Link> integrado ao Next.js */}
              <Link
                href={`./diarios?id=${diario.coddiario}`}
                className={diariosStyles.linkVerMais}
              >
                Ver mais →
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Cards() {
  const [dados, setDados] = useState({
    totalPacientes: 0,
    consultasHoje: 0,
    diariosNovos: 0,
  });

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API}/api/Consulta`);
        const data = await response.json();

        const hoje = new Date().toISOString().split("T")[0];

        const consultasHoje = (data.consultas || []).filter(
          (consulta) => consulta.dataconsulta?.split("T")[0] === hoje,
        ).length;

        const diariesNovos = (data.diarios || []).filter(
          (diario) => diario.datadiario?.split("T")[0] === hoje,
        ).length;

        setDados({
          totalPacientes: data.pacientes ? data.pacientes.length : 0,
          consultasHoje,
          diariosNovos: diariesNovos,
        });
      } catch (error) {
        console.error("Erro ao buscar dashboard:", error);
      }
    };

    buscarDados();
  }, []);

  return (
    <div className={cardsStyles.container}>
      <div className={cardsStyles.card}>
        <span className={cardsStyles.titulo}>Total de Pacientes</span>
        <span className={cardsStyles.valor}>{dados.totalPacientes}</span>
        <span className={cardsStyles.descricao}>Pacientes cadastrados</span>
      </div>

      <div className={cardsStyles.card}>
        <span className={cardsStyles.titulo}>Consultas Hoje</span>
        <span className={cardsStyles.valor}>{dados.consultasHoje}</span>
        <span className={cardsStyles.descricao}>Agendadas para hoje</span>
      </div>

      <div className={cardsStyles.card}>
        <span className={cardsStyles.titulo}>Diários Novos</span>
        <span className={cardsStyles.valor}>{dados.diariosNovos}</span>
        <span className={cardsStyles.descricao}>Registrados hoje</span>
      </div>
    </div>
  );
}

function Alertas() {
  const [data, setData] = useState({ consultas: [] });

  useEffect(() => {
    const pegarConsults = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API}/api/Consulta`);
        const dataConsults = await response.json();
        setData(dataConsults);
      } catch (error) {
        console.error("Erro ao mostrar consultas:", error);
      }
    };
    pegarConsults();
  }, []);

  return (
    <div className={alertasStyles.alertas}>
      <div className={alertasStyles.title}>
        <h2>Próximas Consultas</h2>
        <Link href="./calendario" className={alertasStyles.botaoLink}>
          Ver todos
        </Link>
      </div>

      <ul className={alertasStyles.lista}>
        {(data.consultas || []).slice(0, 4).map((alerta) => (
          <li key={alerta.codconsulta} className={alertasStyles.listaAlertas}>
            <div className={alertasStyles.avatarInicial}>
              {alerta?.nome?.charAt(0)?.toUpperCase() || "P"}
            </div>

            <div className={alertasStyles.alertaConteudo}>
              <div className={alertasStyles.alertaTopo}>
                <span className={alertasStyles.alertaNome}>Consulta</span>
                <span className={alertasStyles.alertaData}>
                  {alerta.dataconsulta
                    ? new Date(alerta.dataconsulta).toLocaleDateString("pt-BR")
                    : ""}
                </span>
              </div>

              <p className={alertasStyles.alertaTexto}>{alerta.observacoes}</p>

              <span className={alertasStyles.alertaHora}>
                {alerta.horaconsulta?.slice(0, 5)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PsicologaGeral() {
  const { data: session } = useSession();

  if (!session) {
    return <p>Carregando...</p>;
  }

  const podeVer = temPermissao(
    session.user.tipousuario,
    "acessarProntuario",
    "acessarDiarios",
  );
console.log("TIPO:", session.user.tipousuario);

console.log(
  "PERMISSÃO:",
temPermissao(
  "psicologo",
  "acessarProntuario",
  "acessarDiarios"
)
);
  if (!podeVer) {
    return <h1>Acesso negado</h1>;
  }
  return (
    <div className={styles.dashboard}>
      <Sidebar profile={profiles.psicologa} />
      <div className={styles.wrapperPrincipal}>
        <Top />
        <main className={styles.containerPrincipal}>
          <Cards />
          <div className={styles.conteudo}>
            <Alertas />
            <DiariosRecentes />
          </div>
        </main>
      </div>
    </div>
  );
}
