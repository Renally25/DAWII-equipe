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
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_AUTH_API}/api/Diario`,
        );

        if (!response.ok) {
          throw new Error("Erro ao buscar diários.");
        }

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

        <Link href="./diarios" className={diariosStyles.botaoLink}>
          Ver todos
        </Link>
      </div>

      {diarios.map((diario) => {
        const nomeUsuario = diario.nome_usuario || diario.nome || "Usuário";

        const inicial = nomeUsuario.charAt(0).toUpperCase();

        return (
          <div key={diario.coddiario} className={diariosStyles.card}>
            <div className={diariosStyles.avatar}>{inicial}</div>

            <div className={diariosStyles.conteudo}>
              <div className={diariosStyles.topo}>
                <span className={diariosStyles.nome}>
                  {nomeUsuario}

                  <small
                    style={{
                      fontSize: "0.8rem",
                      color: "#888",
                      fontWeight: "normal",
                    }}
                  >
                    {" "}
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

function Cards({ codpsicologo }) {
  const [dados, setDados] = useState({
    totalPacientes: 0,
    consultasHoje: 0,
    diariosNovos: 0,
  });

  useEffect(() => {
    if (!codpsicologo) {
      return;
    }

    const buscarDados = async () => {
      try {
        const responseAlunos = await fetch(
          `${process.env.NEXT_PUBLIC_AUTH_API}/api/Aluno_Paciente`,
        );

        if (!responseAlunos.ok) {
          throw new Error("Erro ao buscar pacientes.");
        }

        const dataAlunos = await responseAlunos.json();

        const alunos = dataAlunos.pacientes || [];

        setDados((anterior) => ({
          ...anterior,
          totalPacientes: alunos.length,
        }));

        const consultasPorAluno = await Promise.all(
          alunos.map(async (aluno) => {
            try {
              const responseConsulta = await fetch(
                `${process.env.NEXT_PUBLIC_AUTH_API}/api/Consulta?codusuario=${aluno.codusuario}`,
              );

              if (!responseConsulta.ok) {
                return [];
              }

              const dataConsulta = await responseConsulta.json();

              if (Array.isArray(dataConsulta)) {
                return dataConsulta;
              }

              return dataConsulta.consultas || [];
            } catch (error) {
              console.error(
                `Erro ao buscar consultas do paciente ${aluno.codusuario}:`,
                error,
              );

              return [];
            }
          }),
        );

        const todasConsultas = consultasPorAluno.flat();

        const consultasPsicologo = todasConsultas.filter(
          (consulta) =>
            Number(consulta.codpsicologo) === Number(codpsicologo) &&
            consulta.status === "agendada",
        );

        const hoje = new Date();

        const ano = hoje.getFullYear();

        const mes = String(hoje.getMonth() + 1).padStart(2, "0");

        const dia = String(hoje.getDate()).padStart(2, "0");

        const dataHoje = `${ano}-${mes}-${dia}`;

        const consultasHoje = consultasPsicologo.filter((consulta) => {
          if (!consulta.dataconsulta) {
            return false;
          }

          const dataConsulta = String(consulta.dataconsulta).split("T")[0];

          return dataConsulta === dataHoje;
        });

        let diariosNovos = 0;

        try {
          const responseDiarios = await fetch(
            `${process.env.NEXT_PUBLIC_AUTH_API}/api/Diario`,
          );

          if (responseDiarios.ok) {
            const dataDiarios = await responseDiarios.json();

            const listaDiarios = Array.isArray(dataDiarios)
              ? dataDiarios
              : dataDiarios.diarios || [];

            diariosNovos = listaDiarios.filter((diario) => {
              if (!diario.datadiario) {
                return false;
              }

              const dataDiario = String(diario.datadiario).split("T")[0];

              return dataDiario === dataHoje;
            }).length;
          }
        } catch (error) {
          console.error("Erro ao buscar diários:", error);
        }

        setDados((anterior) => ({
          ...anterior,
          consultasHoje: consultasHoje.length,
          diariosNovos,
        }));
      } catch (error) {
        console.error("Erro ao buscar dashboard:", error);
      }
    };

    buscarDados();
  }, [codpsicologo]);

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

function Alertas({ codpsicologo }) {
  const [data, setData] = useState({
    consultas: [],
  });

  useEffect(() => {
    if (!codpsicologo) {
      return;
    }

    const pegarConsultas = async () => {
      try {
        const responseAlunos = await fetch(
          `${process.env.NEXT_PUBLIC_AUTH_API}/api/Aluno_Paciente`,
        );

        if (!responseAlunos.ok) {
          throw new Error("Erro ao buscar pacientes.");
        }

        const dataAlunos = await responseAlunos.json();

        const alunos = dataAlunos.pacientes || [];

        const consultasPorAluno = await Promise.all(
          alunos.map(async (aluno) => {
            try {
              const responseConsulta = await fetch(
                `${process.env.NEXT_PUBLIC_AUTH_API}/api/Consulta?codusuario=${aluno.codusuario}`,
              );

              if (!responseConsulta.ok) {
                return [];
              }

              const dataConsulta = await responseConsulta.json();

              if (Array.isArray(dataConsulta)) {
                return dataConsulta;
              }

              return dataConsulta.consultas || [];
            } catch (error) {
              console.error(
                `Erro ao buscar consultas do paciente ${aluno.codusuario}:`,
                error,
              );

              return [];
            }
          }),
        );

        const todasConsultas = consultasPorAluno.flat();

        const consultasPsicologo = todasConsultas.filter(
          (consulta) =>
            Number(consulta.codpsicologo) === Number(codpsicologo) &&
            consulta.status === "agendada",
        );

        const consultasComPaciente = consultasPsicologo.map((consulta) => {
          const paciente = alunos.find(
            (aluno) => Number(aluno.codusuario) === Number(consulta.codusuario),
          );

          return {
            ...consulta,
            nome: paciente?.nome || "Paciente",
          };
        });

        consultasComPaciente.sort((a, b) => {
          const dataA = new Date(
            `${String(a.dataconsulta).split("T")[0]}T${
              a.horaconsulta || "00:00:00"
            }`,
          );

          const dataB = new Date(
            `${String(b.dataconsulta).split("T")[0]}T${
              b.horaconsulta || "00:00:00"
            }`,
          );

          return dataA - dataB;
        });

        setData({
          consultas: consultasComPaciente,
        });
      } catch (error) {
        console.error("Erro ao mostrar consultas:", error);
      }
    };

    pegarConsultas();
  }, [codpsicologo]);

  return (
    <div className={alertasStyles.alertas}>
      <div className={alertasStyles.title}>
        <h2>Próximas Consultas</h2>

        <Link href="./calendario" className={alertasStyles.botaoLink}>
          Ver todos
        </Link>
      </div>

      <ul className={alertasStyles.lista}>
        {data.consultas.slice(0, 4).map((alerta) => (
          <li key={alerta.codconsulta} className={alertasStyles.listaAlertas}>
            <div className={alertasStyles.avatarInicial}>
              {String(alerta.nome || "Paciente")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className={alertasStyles.alertaConteudo}>
              <div className={alertasStyles.alertaTopo}>
                <span className={alertasStyles.alertaNome}>{alerta.nome}</span>

                <span className={alertasStyles.alertaData}>
                  {alerta.dataconsulta
                    ? new Date(alerta.dataconsulta).toLocaleDateString("pt-BR")
                    : ""}
                </span>
              </div>

              <p className={alertasStyles.alertaTexto}>
                {alerta.observacoes || "Consulta agendada"}
              </p>

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
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Carregando...</p>;
  }

  if (!session) {
    return <p>Carregando...</p>;
  }

  const podeVer = temPermissao(
    session.user.tipousuario,
    "acessarProntuario",
    "acessarDiarios",
  );

  if (!podeVer) {
    return <h1>Acesso negado</h1>;
  }

  /*
   * O NextAuth coloca o código do usuário
   * em session.user.id.
   *
   * Portanto, para a psicóloga:
   * session.user.id = codpsicologo
   */

  const codpsicologo = session.user.id;

  return (
    <div className={styles.dashboard}>
      <Sidebar profile={profiles.psicologo} />

      <div className={styles.wrapperPrincipal}>
        <Top />

        <main className={styles.containerPrincipal}>
          <Cards codpsicologo={codpsicologo} />

          <div className={styles.conteudo}>
            <Alertas codpsicologo={codpsicologo} />

            <DiariosRecentes />
          </div>
        </main>
      </div>
    </div>
  );
}