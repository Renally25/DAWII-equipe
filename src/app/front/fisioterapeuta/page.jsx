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
  }, [codfisioterapeuta]);

  const itens = [
    {
      href: "./paciFisio",
      classe: cardsStyles.pacientes,
      titulo: "Total de pacientes",
      valor: dados.totalPacientes,
      descricao:
        dados.totalPacientes === 0
          ? "Nenhum paciente cadastrado"
          : dados.totalPacientes === 1
            ? "Paciente cadastrado"
            : "Pacientes cadastrados",
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

    const proximas = data.consultas.slice(0, 4);

  return (
    <section className={alertasStyles.alertas}>
      <div className={alertasStyles.title}>
        <h2>Próximas Consultas</h2>

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


export default function FisioterapeutaPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p className={styles.mensagemTela} role="status">
  Carregando...
</p>
  }

  if (!session) {
    return <p className={styles.mensagemTela} role="status">
  Carregando...
</p>
  }

  const codfisioterapeuta = session.user.id;

  return (
    <div className={styles.dashboard}>
      <Sidebar profile={profiles.fisioterapeuta} />

      <div className={styles.wrapperPrincipal}>
        <Top />

        <main className={styles.containerPrincipal}>
          <Cards codfisioterapeuta={codfisioterapeuta} />

          <div className={`${styles.conteudo} ${styles.conteudoUnico}`}>
            <Alertas codfisioterapeuta={codfisioterapeuta} />
          </div>
        </main>
      </div>
    </div>
  );
}
