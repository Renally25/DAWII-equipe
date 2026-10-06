"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "../sidebar/sidebar";
import Top from "../top/top";
import styles from "./calendar.module.css";
import CelulaDia from "./celulaDia";
import { isSameDay, buildMonthGrid } from "./utils";
import HeaderCalendario from "./headerCalendario";
import { profiles } from "../sidebar/profiles";
import { useSession } from "next-auth/react";

export default function pagCalendario() {
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
        `${process.env.NEXT_PUBLIC_AUTH_API}/api/Usuario/${codusuario}`
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

      <div>
        <Top />

        <main>
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

  const days = buildMonthGrid(
    currentMonth.getFullYear(),
    currentMonth.getMonth()
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

    return indice;
  }, [events]);

  async function buscarConsultas() {
    if (!session?.user?.id) {
      return;
    }

    try {
      setLoading(true);

      const result = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_API}/api/Consulta?codusuario=${session.user.id}`
      );

      if (!result.ok) {
        throw new Error("Erro ao buscar consultas");
      }

      const resposta = await result.json();

      setEvents(resposta.consultas || []);
    } catch (error) {
      console.error(error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      buscarConsultas();
    }
  }, [status, session]);

  if (status === "loading" || loading) {
    return <p>Carregando consultas...</p>;
  }

  return (
    <div>
      <HeaderCalendario
        currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth}
      />

      <section className={styles.calendar}>
        <div>DOM</div>
        <div>SEG</div>
        <div>TER</div>
        <div>QUA</div>
        <div>QUI</div>
        <div>SEX</div>
        <div>SÁB</div>

        {days.map((day) => {
          const isSelected = isSameDay(day, selectedDate);

          const key = day.toISOString().split("T")[0];

          const dayEvents = eventsByDate[key] || [];

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
    </div>
  );
}