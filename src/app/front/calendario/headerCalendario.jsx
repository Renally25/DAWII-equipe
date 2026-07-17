import styles from "./calendar.module.css";

export default function HeaderCalendario({
  currentMonth,
  setCurrentMonth,
}) {
  return (
    <header className={styles.header}>
      <div className={styles.headerTitle}>
        <h1>Calendário de Consultas</h1>
      </div>

      <div className={styles.navigation}>
        <button
          className={styles.todayButton}
          onClick={() => setCurrentMonth(new Date())}
        >
          Hoje
        </button>

        <button
          className={styles.arrowButton}
          onClick={() => {
            const previousMonth = new Date(currentMonth);
            previousMonth.setMonth(previousMonth.getMonth() - 1);
            setCurrentMonth(previousMonth);
          }}
        >
          {"<"}
        </button>

        <span className={styles.month}>
          {currentMonth.toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          })}
        </span>

        <button
          className={styles.arrowButton}
          onClick={() => {
            const nextMonth = new Date(currentMonth);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            setCurrentMonth(nextMonth);
          }}
        >
          {">"}
        </button>
      </div>
    </header>
  );
}