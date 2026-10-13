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

// Lê "2026-06-26" ou "2026-06-26T00:00:00" como data LOCAL.
// (new Date("2026-06-26") interpreta como UTC e pode mostrar o dia anterior.)
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
    <section className={diariosStyles.container}>
      <div className={diariosStyles.header}>
        <h2>Diários recentes</h2>

        <Link href="./diarios" className={diariosStyles.botaoLink}>
          Ver todos
        </Link>
      </div>

      {diarios.length === 0 && (
        <p className={diariosStyles.vazio}>
          Nenhum diário registrado ainda. Os novos aparecem aqui.
        </p>
      )}

      {diarios.map((diario) => {
        const nomeUsuario = diario.nome_usuario || diario.nome || "Usuário";

        const inicial = nomeUsuario.charAt(0).toUpperCase();

        return (
          <div key={diario.coddiario} className={diariosStyles.card}>
            <div className={diariosStyles.avatar} aria-hidden="true">
              {inicial}
            </div>

            <div className={diariosStyles.conteudo}>
              <div className={diariosStyles.topo}>
                <span className={diariosStyles.nome}>
                  {nomeUsuario}{" "}
                  <span className={diariosStyles.codigo}>
                    (#{diario.coddiario})
                  </span>
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
                Ver mais
              </Link>
            </div>
          </div>
        );
      })}
    </section>
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

  // Cada indicador leva para a tela do assunto; o zero ganha um texto útil
  const itens = [
    {
      href: "./pacientes",
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
    {
      href: "./diarios",
      classe: cardsStyles.diarios,
      titulo: "Diários novos",
      valor: dados.diariosNovos,
      descricao:
        dados.diariosNovos === 0
          ? "Nenhum diário registrado hoje"
          : "Registrados hoje",
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
    const responseConsulta = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_API}/api/Consulta?codusuario=${codpsicologo}`
    );

    if (!responseConsulta.ok) {
      throw new Error("Erro ao buscar consultas.");
    }

    const dataConsulta = await responseConsulta.json();

    console.log("RESPOSTA DA API:", dataConsulta);

    const consultas = dataConsulta.consultas || [];

    const consultasFisioterapeuta = consultas
      .filter(
        (consulta) =>
          Number(consulta.codpsicologo) ===
            Number(codpsicologo) &&
          consulta.status === "agendada"
      )
      .map((consulta) => ({
        ...consulta,
        codconsulta: consulta.id,
        dataconsulta: consulta.date,
        horaconsulta: consulta.time,
        nome: consulta.patient || "Paciente",
      }));

    console.log(
      "CONSULTAS DA FISIOTERAPEUTA:",
      consultasFisioterapeuta
    );

    consultasFisioterapeuta.sort((a, b) => {
      const dataA = new Date(
        `${a.dataconsulta}T${a.horaconsulta}`
      );

      const dataB = new Date(
        `${b.dataconsulta}T${b.horaconsulta}`
      );

      return dataA - dataB;
    });

    setData({
      consultas: consultasFisioterapeuta,
    });
  } catch (error) {
    console.error("Erro ao mostrar consultas:", error);
  }
};

    pegarConsultas();
  }, [codpsicologo]);

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


export default function PsicologaGeral() {
  const { data: session, status } = useSession();

  if (status === "loading" || !session) {
    return (
      <p className={styles.mensagemTela} role="status">
        Carregando...
      </p>
    );
  }

  const podeVer = temPermissao(
    session.user.tipousuario,
    "acessarProntuario",
    "acessarDiarios",
  );

  if (!podeVer) {
    return <h1 className={styles.mensagemTela}>Acesso negado</h1>;
  }


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