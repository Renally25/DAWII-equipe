import styles from "./calendar.module.css";

const MAX_VISIVEIS = 3;

export default function CelulaDia({
  day,
  events,
  selected,
  onClick,
  isCurrentMonth,
  isToday,
}) {
  // events já contém apenas as consultas deste dia
  const dataExtenso = day.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
  });

  const resumo =
    events.length === 0
      ? "sem consultas"
      : events.length === 1
        ? "1 consulta"
        : `${events.length} consultas`;

  const classes = [
    styles.day,
    selected ? styles.selected : "",
    !isCurrentMonth ? styles.outsideMonth : "",
    isToday ? styles.today : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    // <button> em vez de <div onClick>: foco por teclado e leitores de tela funcionam
    <button
      type="button"
      className={classes}
      onClick={onClick}
      aria-pressed={selected}
      aria-current={isToday ? "date" : undefined}
      aria-label={`${dataExtenso}, ${resumo}`}
    >
      <span className={styles.numero}>{day.getDate()}</span>

      {events.slice(0, MAX_VISIVEIS).map((event, i) => (
        <span key={event.id ?? i} className={styles.chip}>
          <strong>{event.time}</strong> {event.patient}
        </span>
      ))}

      {events.length > MAX_VISIVEIS && (
        <span className={styles.mais}>+{events.length - MAX_VISIVEIS} mais</span>
      )}

      {/* Em telas estreitas os chips somem e ficam só o número de consultas */}
      {events.length > 0 && (
        <span className={styles.contadorMobile} aria-hidden="true">
          {events.length}
        </span>
      )}
    </button>
  );
}