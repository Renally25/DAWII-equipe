"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "../sidebar/sidebar";
import Top from "../top/top";
import styles from "./calendar.module.css";
import CelulaDia from "./celulaDia";
import { isSameDay, buildMonthGrid, chaveDia } from "./utils";
import HeaderCalendario from "./headerCalendario";
import { profiles } from "../sidebar/profiles";
import { useSession } from "next-auth/react";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const ROTULO_STATUS = {
  agendada: "Agendada",
  cancelada: "Cancelada",
  realizada: "Realizada",
};

/*
 * Aceita os dois formatos de consulta:
 *  - o que este componente já esperava: { id, date, time, patient }
 *  - o que a API devolve nos dashboards: { codconsulta, dataconsulta,
 *    horaconsulta, observacoes, status }
 * Sem isso, as consultas da API não apareciam nas células do calendário.
 */
function normalizarConsulta(consulta) {
  return {
    id: consulta.id ?? consulta.codconsulta,
    date:
      consulta.date ?? String(consulta.dataconsulta || "").split("T")[0],
    time: consulta.time ?? (consulta.horaconsulta || "").slice(0, 5),
    patient:
      consulta.patient ?? consulta.nome ?? consulta.observacoes ?? "Consulta",
    status: consulta.status,
  };
}

// Só libera "confirmar realizada" depois do horário da consulta
function jaOcorreu(consulta) {
  if (!consulta.date || !consulta.time) return false;

  const [ano, mes, dia] = consulta.date.split("-").map(Number);
  const [hora, minuto] = consulta.time.split(":").map(Number);

  return new Date(ano, mes - 1, dia, hora, minuto) <= new Date();
}

// Renomeado de "pagCalendario": componentes React começam com maiúscula
export default function PagCalendario() {
  const { data: session, status } = useSession();

  const [data, setData] = useState({
    tipousuario: "",
  });

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      mostrarInformacoes(session.user.id);
    }
  }, [status, session]);

  async function mostrarInformacoes(codusuario) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_API}/api/Usuario/${codusuario}`,
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar informações.");
      }

      const usuario = await response.json();

      setData({
        tipousuario: usuario.tipousuario,
      });
    } catch (error) {
      console.error(error);
    }
  }

  const profissao = data.tipousuario;

  return (
    <div className={styles.container}>
      <Sidebar profile={profiles[profissao]} />

      <div className={styles.conteudo}>
        <Top />

        <main className={styles.pagina}>
          <Calendario />
        </main>
      </div>
    </div>
  );
}

export function Calendario() {
  const { data: session, status } = useSession();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [atualizandoId, setAtualizandoId] = useState(null);
  const [erroAcao, setErroAcao] = useState("");

  const days = buildMonthGrid(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
  );

  const hoje = new Date();

  const eventsByDate = useMemo(() => {
    const indice = {};

    events.forEach((event) => {
      const key = event.date;

      if (!indice[key]) {
        indice[key] = [];
      }

      indice[key].push(event);
    });

    // Ordena cada dia por horário
    Object.values(indice).forEach((lista) =>
      lista.sort((a, b) => String(a.time).localeCompare(String(b.time))),
    );

    return indice;
  }, [events]);

  async function buscarConsultas() {
    if (!session?.user?.id) {
      return;
    }

    try {
      setLoading(true);

      const result = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_API}/api/Consulta?codusuario=${session.user.id}`,
      );

      if (!result.ok) {
        throw new Error("Erro ao buscar consultas");
      }

      const resposta = await result.json();

      // A rota pode devolver um array ou { consultas: [...] }
      const lista = Array.isArray(resposta)
        ? resposta
        : resposta.consultas || [];

      setEvents(lista.map(normalizarConsulta));
    } catch (error) {
      console.error(error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  async function atualizarStatus(consulta, novoStatus) {
    if (
      novoStatus === "cancelada" &&
      !window.confirm("Tem certeza que deseja cancelar esta consulta?")
    ) {
      return;
    }

    try {
      setErroAcao("");
      setAtualizandoId(consulta.id);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_API}/api/Consulta`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            codconsulta: consulta.id,
            codusuario: session.user.id,
            status: novoStatus,
          }),
        },
      );

      const resposta = await response.json();

      if (!response.ok) {
        throw new Error(resposta.error || "Erro ao atualizar consulta.");
      }

      setEvents((anteriores) =>
        anteriores.map((e) =>
          e.id === consulta.id ? { ...e, status: novoStatus } : e,
        ),
      );
    } catch (error) {
      console.error(error);
      setErroAcao(error.message);
    } finally {
      setAtualizandoId(null);
    }
  }

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      buscarConsultas();
    }
  }, [status, session]);

  if (status === "loading" || loading) {
    return (
      <p className={styles.mensagem} role="status">
        Carregando consultas...
      </p>
    );
  }

  // Painel lateral com as consultas do dia selecionado
  const consultasDoDia = eventsByDate[chaveDia(selectedDate)] || [];

  const tituloDia = selectedDate.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const tituloDiaCapitalizado =
    tituloDia.charAt(0).toUpperCase() + tituloDia.slice(1);

  return (
    <>
      <HeaderCalendario
        currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth}
      />

      <div className={styles.corpo}>
        <section className={styles.calendar} aria-label="Calendário do mês">
          {DIAS_SEMANA.map((dia) => (
            <div key={dia} className={styles.diaSemana}>
              {dia}
            </div>
          ))}

          {days.map((day) => {
            const isSelected = isSameDay(day, selectedDate);

            // chaveDia usa o fuso local (toISOString podia cair no dia errado)
            const key = chaveDia(day);

            // Consultas canceladas não aparecem nas células do calendário
            const dayEvents = (eventsByDate[key] || []).filter(
              (e) => e.status !== "cancelada",
            );

            const isCurrentMonth =
              day.getMonth() === currentMonth.getMonth() &&
              day.getFullYear() === currentMonth.getFullYear();

            const isToday = isSameDay(day, hoje);

            return (
              <CelulaDia
                key={day.toISOString()}
                day={day}
                events={dayEvents}
                selected={isSelected}
                onClick={() => setSelectedDate(day)}
                isCurrentMonth={isCurrentMonth}
                isToday={isToday}
              />
            );
          })}
        </section>

        <aside className={styles.painelDia} aria-live="polite">
          <h2 className={styles.painelTitulo}>{tituloDiaCapitalizado}</h2>
          <p className={styles.painelSub}>
            {consultasDoDia.length === 0
              ? "Sem consultas neste dia"
              : consultasDoDia.length === 1
                ? "1 consulta"
                : `${consultasDoDia.length} consultas`}
          </p>

          {erroAcao && (
            <p className={styles.erroAcao} role="alert">
              {erroAcao}
            </p>
          )}

          {consultasDoDia.length === 0 ? (
            <p className={styles.vazio}>Nenhuma consulta agendada.</p>
          ) : (
            <ul className={styles.listaDia}>
              {consultasDoDia.map((consulta, i) => {
                const agendada = consulta.status === "agendada";
                const ocupada = atualizandoId === consulta.id;
                const podeConfirmar = jaOcorreu(consulta);

                return (
                  <li key={consulta.id ?? i} className={styles.itemDia}>
                    <span className={styles.itemHora}>{consulta.time}</span>

                    <div className={styles.itemConteudo}>
                      <p
                        className={`${styles.itemTexto} ${
                          consulta.status === "cancelada"
                            ? styles.itemCancelado
                            : ""
                        }`}
                      >
                        {consulta.patient}
                      </p>

                      <span
                        className={`${styles.badge} ${
                          styles[`badge_${consulta.status}`] || ""
                        }`}
                      >
                        {ROTULO_STATUS[consulta.status] || consulta.status}
                      </span>

                      {agendada && (
                        <div className={styles.acoes}>
                          <button
                            type="button"
                            className={styles.botaoConfirmar}
                            disabled={ocupada || !podeConfirmar}
                            title={
                              podeConfirmar
                                ? "Confirmar que a consulta ocorreu"
                                : "Disponível após o horário da consulta"
                            }
                            onClick={() =>
                              atualizarStatus(consulta, "realizada")
                            }
                          >
                            Confirmar realizada
                          </button>

                          <button
                            type="button"
                            className={styles.botaoCancelar}
                            disabled={ocupada}
                            onClick={() =>
                              atualizarStatus(consulta, "cancelada")
                            }
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
      </div>
    </>
  );
}