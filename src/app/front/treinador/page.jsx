"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import styles from "../psicologa/dashboard.module.css";
import cardsStyles from "../psicologa/cards.module.css";
import alertasStyles from "../psicologa/alertas.module.css";

import Link from "next/link";
import Sidebar from "../sidebar/sidebar";
import { profiles } from "../sidebar/profiles";
import Top from "../top/top";

function lerData(valor) {
  if (!valor) return null;
  const [ano, mes, dia] = String(valor).split("T")[0].split("-").map(Number);
  if (!ano || !mes || !dia) return null;
  return new Date(ano, mes - 1, dia);
}

function ehHoje(data) {
  const agora = new Date();
  return (
    data.getFullYear() === agora.getFullYear() &&
    data.getMonth() === agora.getMonth() &&
    data.getDate() === agora.getDate()
  );
}

function mesAbreviado(data) {
  return data
    .toLocaleDateString("pt-BR", { month: "short" })
    .replace(".", "");
}

function Cards({ codtreinador }) {
  const [dados, setDados] = useState({
    totalPacientes: 0,
    consultasHoje: 0,
  });

  useEffect(() => {
    if (!codtreinador) {
      return;
    }

    const buscarDados = async () => {
      try {
        const responseAlunos = await fetch(
          `${process.env.NEXT_PUBLIC_AUTH_API}/api/Aluno_Paciente`,
        );

        if (!responseAlunos.ok) {
          throw new Error("Erro ao buscar alunos.");
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
                `Erro ao buscar consultas do aluno ${aluno.codusuario}:`,
                error,
              );

              return [];
            }
          }),
        );

        const todasConsultas = consultasPorAluno.flat();

        const consultasTreinador = todasConsultas.filter(
          (consulta) => Number(consulta.codtreinador) === Number(codtreinador),
        );

        const hoje = new Date();

        const ano = hoje.getFullYear();

        const mes = String(hoje.getMonth() + 1).padStart(2, "0");

        const dia = String(hoje.getDate()).padStart(2, "0");

        const dataHoje = `${ano}-${mes}-${dia}`;

        const consultasHoje = consultasTreinador.filter((consulta) => {
          if (!consulta.dataconsulta) {
            return false;
          }

          const dataConsulta = String(consulta.dataconsulta).split("T")[0];

          return dataConsulta === dataHoje && consulta.status === "agendada"; 
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
  }, [codtreinador]);

  const itens = [
    {
      href: "./pacientesTreinador",
      classe: cardsStyles.pacientes,
      titulo: "Total de alunos",
      valor: dados.totalPacientes,
      descricao:
        dados.totalPacientes === 0
          ? "Nenhum aluno cadastrado"
          : dados.totalPacientes === 1
            ? "Aluno cadastrado"
            : "Alunos cadastrados",
    },
    {
      href: "./calendario",
      classe: cardsStyles.consultas,
      titulo: "Consultas hoje",
      valor: dados.consultasHoje,
      descricao:
        dados.consultasHoje === 0
          ? "Nenhuma consulta agendada para hoje"
          : "Agendadas para hoje",
    },
  ];

  return (
    <div className={cardsStyles.container}>
      {itens.map((item) => (
        <Link
          key={item.titulo}
          href={item.href}
          className={`${cardsStyles.card} ${item.classe}`}
        >
          <span className={cardsStyles.titulo}>{item.titulo}</span>

          <span
            className={`${cardsStyles.valor} ${
              item.valor === 0 ? cardsStyles.valorZero : ""
            }`}
          >
            {item.valor}
          </span>

          <span className={cardsStyles.descricao}>{item.descricao}</span>
        </Link>
      ))}
    </div>
  );
}


function Alertas({ codtreinador }) {
  const [data, setData] = useState({
    consultas: [],
  });

  useEffect(() => {
    if (!codtreinador) {
      return;
    }

    const pegarConsultas = async () => {
      try {
        const responseAlunos = await fetch(
          `${process.env.NEXT_PUBLIC_AUTH_API}/api/Aluno_Paciente`,
        );

        if (!responseAlunos.ok) {
          throw new Error("Erro ao buscar alunos.");
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
                `Erro ao buscar consultas do aluno ${aluno.codusuario}:`,
                error,
              );

              return [];
            }
          }),
        );

        const todasConsultas = consultasPorAluno.flat();

        const consultasTreinador = todasConsultas.filter(
          (consulta) =>
            Number(consulta.codtreinador) === Number(codtreinador) &&
            consulta.status === "agendada",
        );

        const consultasComAluno = consultasTreinador.map((consulta) => {
          const aluno = alunos.find(
            (item) => Number(item.codusuario) === Number(consulta.codusuario),
          );

          return {
            ...consulta,
            nome: aluno?.nome || "Aluno",
          };
        });

        consultasComAluno.sort((a, b) => {
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
          consultas: consultasComAluno,
        });
      } catch (error) {
        console.error("Erro ao mostrar consultas:", error);
      }
    };

    pegarConsultas();
  }, [codtreinador]);

  const proximas = data.consultas.slice(0, 4);

  return (
    <section className={alertasStyles.alertas}>
      <div className={alertasStyles.title}>
        <h2>Próximas consultas</h2>

        <Link href="./calendario" className={alertasStyles.botaoLink}>
          Ver todos
        </Link>
      </div>

      {proximas.length === 0 && (
        <p className={alertasStyles.vazio}>
          Nenhuma consulta agendada.
        </p>
      )}

      <ul className={alertasStyles.lista}>
        {proximas.map((alerta) => {
          const dataConsulta = lerData(alerta.dataconsulta);
          const hoje = dataConsulta ? ehHoje(dataConsulta) : false;

          return (
            <li key={alerta.codconsulta} className={alertasStyles.listaAlertas}>
              {dataConsulta && (
                <time
                  dateTime={String(alerta.dataconsulta).split("T")[0]}
                  className={`${alertasStyles.dataBloco} ${
                    hoje ? alertasStyles.dataHoje : ""
                  }`}
                >
                  <span className={alertasStyles.dataMes}>
                    {hoje ? "Hoje" : mesAbreviado(dataConsulta)}
                  </span>
                  <span className={alertasStyles.dataDia}>
                    {dataConsulta.getDate()}
                  </span>
                </time>
              )}

              <div className={alertasStyles.alertaConteudo}>
                <div className={alertasStyles.alertaTopo}>
                  <span className={alertasStyles.alertaNome}>
                    {alerta.nome}
                  </span>

                  <span className={alertasStyles.alertaHora}>
                    {alerta.horaconsulta?.slice(0, 5)}
                  </span>
                </div>

                <p className={alertasStyles.alertaTexto}>
                  {alerta.observacoes || "Consulta agendada"}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}



export default function TreinadorPage() {
  const { data: session, status } = useSession();

  const codtreinador = session?.user?.id;

  if (status === "loading") {
    return (
      <p className={styles.mensagemTela} role="status">
        Carregando...
      </p>
    );
  }

  return (
    <div className={styles.dashboard}>
      <Sidebar profile={profiles.treinador} />

      <div className={styles.wrapperPrincipal}>
        <Top />

        <main className={styles.containerPrincipal}>
          <Cards codtreinador={codtreinador} />

          <div className={`${styles.conteudo} ${styles.conteudoUnico}`}>
            <Alertas codtreinador={codtreinador} />
          </div>
        </main>
      </div>
    </div>
  );
}