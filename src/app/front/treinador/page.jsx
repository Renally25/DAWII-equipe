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


/* =========================================================
   CARDS
   ========================================================= */

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
        /* =====================================================
           1. BUSCAR TODOS OS ALUNOS
           ===================================================== */

        const responseAlunos = await fetch(
          `${process.env.NEXT_PUBLIC_AUTH_API}/api/Aluno_Paciente`
        );

        if (!responseAlunos.ok) {
          throw new Error("Erro ao buscar alunos.");
        }

        const dataAlunos = await responseAlunos.json();

        const alunos = dataAlunos.pacientes || [];

        /* =====================================================
           2. ATUALIZAR TOTAL DE ALUNOS
           ===================================================== */

        setDados((anterior) => ({
          ...anterior,
          totalPacientes: alunos.length,
        }));

        /* =====================================================
           3. BUSCAR AS CONSULTAS DE CADA ALUNO
           ===================================================== */

        const consultasPorAluno = await Promise.all(
          alunos.map(async (aluno) => {
            try {
              const responseConsulta = await fetch(
                `${process.env.NEXT_PUBLIC_AUTH_API}/api/Consulta?codusuario=${aluno.codusuario}`
              );

              if (!responseConsulta.ok) {
                return [];
              }

              const dataConsulta =
                await responseConsulta.json();

              /*
               * Sua rota atual retorna um ARRAY:
               *
               * [
               *   {
               *     codconsulta: 1,
               *     codusuario: 10,
               *     codtreinador: 101
               *   }
               * ]
               */

              if (Array.isArray(dataConsulta)) {
                return dataConsulta;
              }

              /*
               * Mantém compatibilidade caso a API
               * eventualmente retorne { consultas: [...] }
               */

              return dataConsulta.consultas || [];
            } catch (error) {
              console.error(
                `Erro ao buscar consultas do aluno ${aluno.codusuario}:`,
                error
              );

              return [];
            }
          })
        );

        /* =====================================================
           4. JUNTAR TODAS AS CONSULTAS
           ===================================================== */

        const todasConsultas =
          consultasPorAluno.flat();

        /* =====================================================
           5. FILTRAR SOMENTE AS CONSULTAS DO TREINADOR LOGADO
           ===================================================== */

        const consultasTreinador =
          todasConsultas.filter(
            (consulta) =>
              Number(consulta.codtreinador) ===
              Number(codtreinador)
          );

        /* =====================================================
           6. PEGAR A DATA DE HOJE
           ===================================================== */

        const hoje = new Date();

        const ano = hoje.getFullYear();

        const mes = String(
          hoje.getMonth() + 1
        ).padStart(2, "0");

        const dia = String(
          hoje.getDate()
        ).padStart(2, "0");

        const dataHoje =
          `${ano}-${mes}-${dia}`;

        /* =====================================================
           7. FILTRAR CONSULTAS DO TREINADOR PARA HOJE
           ===================================================== */

        const consultasHoje =
          consultasTreinador.filter(
            (consulta) => {
              if (!consulta.dataconsulta) {
                return false;
              }

              const dataConsulta =
                String(
                  consulta.dataconsulta
                ).split("T")[0];

              return (
                dataConsulta === dataHoje &&
                consulta.status === "agendada"
              );
            }
          );

        /* =====================================================
           8. ATUALIZAR CARD
           ===================================================== */

        setDados((anterior) => ({
          ...anterior,
          consultasHoje:
            consultasHoje.length,
        }));
      } catch (error) {
        console.error(
          "Erro ao buscar dashboard:",
          error
        );
      }
    };

    buscarDados();
  }, [codtreinador]);

  return (
    <div className={cardsStyles.container}>

      <div className={cardsStyles.card}>
        <span className={cardsStyles.titulo}>
          Total de Alunos
        </span>

        <span className={cardsStyles.valor}>
          {dados.totalPacientes}
        </span>

        <span className={cardsStyles.descricao}>
          Alunos cadastrados
        </span>
      </div>


      <div className={cardsStyles.card}>
        <span className={cardsStyles.titulo}>
          Consultas Hoje
        </span>

        <span className={cardsStyles.valor}>
          {dados.consultasHoje}
        </span>

        <span className={cardsStyles.descricao}>
          Agendadas para hoje
        </span>
      </div>

    </div>
  );
}


/* =========================================================
   PRÓXIMAS CONSULTAS
   ========================================================= */

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

        /* ===================================================
           1. BUSCAR TODOS OS ALUNOS
           =================================================== */

        const responseAlunos = await fetch(
          `${process.env.NEXT_PUBLIC_AUTH_API}/api/Aluno_Paciente`
        );

        if (!responseAlunos.ok) {
          throw new Error(
            "Erro ao buscar alunos."
          );
        }

        const dataAlunos =
          await responseAlunos.json();

        const alunos =
          dataAlunos.pacientes || [];


        /* ===================================================
           2. BUSCAR CONSULTAS DE CADA ALUNO
           =================================================== */

        const consultasPorAluno =
          await Promise.all(
            alunos.map(async (aluno) => {
              try {

                const responseConsulta =
                  await fetch(
                    `${process.env.NEXT_PUBLIC_AUTH_API}/api/Consulta?codusuario=${aluno.codusuario}`
                  );

                if (!responseConsulta.ok) {
                  return [];
                }

                const dataConsulta =
                  await responseConsulta.json();

                if (
                  Array.isArray(
                    dataConsulta
                  )
                ) {
                  return dataConsulta;
                }

                return (
                  dataConsulta.consultas ||
                  []
                );

              } catch (error) {

                console.error(
                  `Erro ao buscar consultas do aluno ${aluno.codusuario}:`,
                  error
                );

                return [];
              }
            })
          );


        /* ===================================================
           3. JUNTAR TODAS AS CONSULTAS
           =================================================== */

        const todasConsultas =
          consultasPorAluno.flat();


        /* ===================================================
           4. FILTRAR SOMENTE CONSULTAS DO TREINADOR
           =================================================== */

        const consultasTreinador =
          todasConsultas.filter(
            (consulta) =>
              Number(
                consulta.codtreinador
              ) === Number(
                codtreinador
              ) &&
              consulta.status ===
                "agendada"
          );


        /* ===================================================
           5. COLOCAR O NOME DO ALUNO
           =================================================== */

        const consultasComAluno =
          consultasTreinador.map(
            (consulta) => {

              const aluno =
                alunos.find(
                  (item) =>
                    Number(
                      item.codusuario
                    ) ===
                    Number(
                      consulta.codusuario
                    )
                );

              return {
                ...consulta,
                nome:
                  aluno?.nome ||
                  "Paciente",
              };
            }
          );


        /* ===================================================
           6. ORDENAR POR DATA E HORA
           =================================================== */

        consultasComAluno.sort(
          (a, b) => {

            const dataA =
              new Date(
                `${String(
                  a.dataconsulta
                ).split("T")[0]}T${
                  a.horaconsulta ||
                  "00:00:00"
                }`
              );

            const dataB =
              new Date(
                `${String(
                  b.dataconsulta
                ).split("T")[0]}T${
                  b.horaconsulta ||
                  "00:00:00"
                }`
              );

            return dataA - dataB;
          }
        );


        /* ===================================================
           7. SALVAR CONSULTAS
           =================================================== */

        setData({
          consultas:
            consultasComAluno,
        });

      } catch (error) {

        console.error(
          "Erro ao mostrar consultas:",
          error
        );

      }
    };

    pegarConsultas();

  }, [codtreinador]);


  return (
    <div className={alertasStyles.alertas}>

      <div className={alertasStyles.title}>

        <h2>
          Próximas Consultas
        </h2>

        <Link
          href="./calendario"
          className={
            alertasStyles.botaoLink
          }
        >
          Ver todos
        </Link>

      </div>


      <ul className={alertasStyles.lista}>

        {data.consultas
          .slice(0, 4)
          .map((alerta) => (

            <li
              key={
                alerta.codconsulta
              }
              className={
                alertasStyles.listaAlertas
              }
            >

              <div
                className={
                  alertasStyles.avatarInicial
                }
              >
                {String(
                  alerta.nome ||
                    "Paciente"
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>


              <div
                className={
                  alertasStyles.alertaConteudo
                }
              >

                <div
                  className={
                    alertasStyles.alertaTopo
                  }
                >

                  <span
                    className={
                      alertasStyles.alertaNome
                    }
                  >
                    {alerta.nome}
                  </span>


                  <span
                    className={
                      alertasStyles.alertaData
                    }
                  >
                    {new Date(
                      alerta.dataconsulta
                    ).toLocaleDateString(
                      "pt-BR"
                    )}
                  </span>

                </div>


                <p
                  className={
                    alertasStyles.alertaTexto
                  }
                >
                  {alerta.observacoes ||
                    "Consulta agendada"}
                </p>


                <span
                  className={
                    alertasStyles.alertaHora
                  }
                >
                  {alerta.horaconsulta?.slice(
                    0,
                    5
                  )}
                </span>

              </div>

            </li>

          ))}

      </ul>

    </div>
  );
}


/* =========================================================
   PÁGINA DO TREINADOR
   ========================================================= */

export default function TreinadorPage() {

  const {
    data: session,
    status,
  } = useSession();


  /*
   * No seu NextAuth, o ID do usuário
   * está em session.user.id.
   *
   * Exemplo:
   *
   * id: 101
   */

  const codtreinador =
    session?.user?.id;


  if (status === "loading") {
    return (
      <div>
        Carregando...
      </div>
    );
  }


  return (
    <div
      className={
        styles.dashboard
      }
    >

      <Sidebar
        profile={
          profiles.treinador
        }
      />


      <div>

        <Top />


        <div
          className={
            styles.containerPrincipal
          }
        >

          <Cards
            codtreinador={
              codtreinador
            }
          />


          <div
            className={
              styles.conteudo
            }
          >

            <Alertas
              codtreinador={
                codtreinador
              }
            />

          </div>

        </div>

      </div>

    </div>
  );
}