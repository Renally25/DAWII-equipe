"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

import styles from "../psicologa/dashboard.module.css";
import cardsStyles from "../psicologa/cards.module.css";
import alertasStyles from "../psicologa/alertas.module.css";

import Sidebar from "../sidebar/sidebar";
import { profiles } from "../sidebar/profiles";
import Top from "../top/top";

function Cards({ codfisioterapeuta }) {
  const [dados, setDados] = useState({
    totalPacientes: 0,
    consultasHoje: 0,
  });

  useEffect(() => {
    if (!codfisioterapeuta) {
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

        const consultasFisioterapeuta = todasConsultas.filter(
          (consulta) =>
            Number(consulta.codfisioterapeuta) === Number(codfisioterapeuta) &&
            consulta.status === "agendada",
        );

        const hoje = new Date();

        const ano = hoje.getFullYear();

        const mes = String(hoje.getMonth() + 1).padStart(2, "0");

        const dia = String(hoje.getDate()).padStart(2, "0");

        const dataHoje = `${ano}-${mes}-${dia}`;

        const consultasHoje = consultasFisioterapeuta.filter((consulta) => {
          if (!consulta.dataconsulta) {
            return false;
          }

          const dataConsulta = String(consulta.dataconsulta).split("T")[0];

          return dataConsulta === dataHoje;
        });

        setDados((anterior) => ({
          ...anterior,
          consultasHoje: consultasHoje.length,
        }));
      } catch (error) {
        console.error("Erro ao buscar dashboard:", error);
      }
    };

    buscarDados();
  }, [codfisioterapeuta]);

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
    </div>
  );
}

function Alertas({ codfisioterapeuta }) {
  const [data, setData] = useState({
    consultas: [],
  });

  useEffect(() => {
    if (!codfisioterapeuta) {
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

        const consultasFisioterapeuta = todasConsultas.filter(
          (consulta) =>
            Number(consulta.codfisioterapeuta) === Number(codfisioterapeuta) &&
            consulta.status === "agendada",
        );

        const consultasComPaciente = consultasFisioterapeuta.map((consulta) => {
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
              a.horaconsulta
            }`,
          );

          const dataB = new Date(
            `${String(b.dataconsulta).split("T")[0]}T${
              b.horaconsulta
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
  }, [codfisioterapeuta]);

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


export default function FisioterapeutaPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Carregando...</p>;
  }

  if (!session) {
    return <p>Carregando...</p>;
  }

  const codfisioterapeuta = session.user.id;

  return (
    <div className={styles.dashboard}>
      <Sidebar profile={profiles.fisioterapeuta} />

      <div className={styles.wrapperPrincipal}>
        <Top />

        <main className={styles.containerPrincipal}>
          <Cards codfisioterapeuta={codfisioterapeuta} />

          <div className={styles.conteudo}>
            <Alertas codfisioterapeuta={codfisioterapeuta} />
          </div>
        </main>
      </div>
    </div>
  );
}
