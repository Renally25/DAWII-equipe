"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "../sidebar/sidebar";
import Top from "../top/top";
import styles from "./calendar.module.css";
import CelulaDia from "./celulaDia";
import { isSameDay, buildMonthGrid } from "./utils";
import HeaderCalendario from "./headerCalendario";
import { profiles } from "../sidebar/profiles";

export default function pagCalendarioPsico() {
  return (
    <div className={styles.container}>
      <Sidebar profile={profiles.psicologa} />
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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date()); // mês que o calendário mostra
  const days = buildMonthGrid(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
  ); // célula na grade
  const hoje = new Date();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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
  }, [events]); //só renderiza se houver mudança em events

  async function buscarConsultas() {
    try {
      const result = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API}/api/Consulta`);

      if (!result.ok) {
        throw new Error("Erro ao buscar consultas"); //vai automaticamente para o catch
      }

      const data = await result.json();
      setEvents(data.consultas);

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }

  useEffect(() => {
    // async dentro do effect para evitar setState direto no corpo do useEffect
    const carregar = async () => {
      await buscarConsultas();
    };
    carregar();
  }, []);

  if (loading) {
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

        {days.map(
          (
            day, //.map params: elementoAtual(obrigatorio), indice(opcional), arrayCompleto(opcional)
          ) => {
            const isSelected = isSameDay(day, selectedDate);
            const key = day.toISOString().split("T")[0];
            const dayEvents = eventsByDate[key] || [];
            const isCurrentMonth =
              day.getMonth() === currentMonth.getMonth() &&
              day.getFullYear() === currentMonth.getFullYear(); //compara o mes selecionado e o mes da célula
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
          },
        )}
      </section>
    </div>
  );
}
