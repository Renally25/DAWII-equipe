"use client";

import { useEffect, useState } from "react";
import styles from "../psicologa/dashboard.module.css";
import cardsStyles from "../psicologa/cards.module.css";
import alertasStyles from "../psicologa/alertas.module.css";
import Link from "next/link";
import Sidebar from "../sidebar/sidebar";
import { profiles } from "../sidebar/profiles";

import Top from "../top/top";

function Cards() {
  const [dados, setDados] = useState({
    totalPacientes: 0,
    consultasHoje: 0,
  });

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/Consulta?codusuario");

        const data = await response.json();

        const hoje = new Date().toISOString().split("T")[0];

        const consultasHoje = (data.consultas || []).filter(
          (consulta) => consulta.dataconsulta?.split("T")[0] === hoje,
        ).length;

        setDados({
          totalPacientes: data.pacientes ? data.pacientes.length : 0,
          consultasHoje,
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
        <span className={cardsStyles.titulo}>Total de Alunos</span>

        <span className={cardsStyles.valor}>{dados.totalPacientes}</span>

        <span className={cardsStyles.descricao}>Alunos cadastrados</span>
      </div>

      <div className={cardsStyles.card}>
        <span className={cardsStyles.titulo}>Consultas Hoje</span>

        <span className={cardsStyles.valor}>{dados.consultasHoje}</span>

        <span className={cardsStyles.descricao}>Agendadas para hoje</span>
      </div>

    </div>
  );
}

function Alertas() {
  const [data, setData] = useState({ consultas: [] });

  const pegarConsults = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/Consulta");
      const dataConsults = await response.json();

      setData(dataConsults);
    } catch (error) {
      console.log("Erro ao mostrar consultas:", error);
    }
  };

  useEffect(() => {
    const carregar = async () => {
      await pegarConsults();
    };
    carregar();
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
              {String(alerta?.nome || alerta?.paciente || "Paciente").charAt(0).toUpperCase()}
            </div>

            <div className={alertasStyles.alertaConteudo}>
              <div className={alertasStyles.alertaTopo}>
                <span className={alertasStyles.alertaNome}>Consulta</span>

                <span className={alertasStyles.alertaData}>
                  {new Date(alerta.dataconsulta).toLocaleDateString("pt-BR")}
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

export default function TreinadorPage() {
  return (
    <div className={styles.dashboard}>
      <Sidebar profile={profiles.treinador} />

      <div>
        <Top />
        <div className={styles.containerPrincipal}>
          <Cards />
          <div className={styles.conteudo}>
            <Alertas />
          </div>
        </div>
      </div>
    </div>
  );
}
