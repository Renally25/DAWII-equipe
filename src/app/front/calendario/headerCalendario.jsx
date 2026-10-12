import styles from "./calendar.module.css";

function Chevron({ direcao }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points={direcao === "esquerda" ? "15 18 9 12 15 6" : "9 18 15 12 9 6"} />
    </svg>
  );
}

export default function HeaderCalendario({ currentMonth, setCurrentMonth }) {
  // "agosto de 2026" → "Agosto de 2026" (o text-transform: capitalize gerava "Agosto De 2026")
  const rotulo = currentMonth.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  const rotuloMes = rotulo.charAt(0).toUpperCase() + rotulo.slice(1);

  // Sempre dia 1: evita pular meses quando hoje é dia 29, 30 ou 31
  function mudarMes(delta) {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1),
    );
  }

  return (
    <header className={styles.header}>
      <div className={styles.headerTitle}>
        <h1>Calendário de consultas</h1>
      </div>

      <div className={styles.navigation}>
        <button
          type="button"
          className={styles.todayButton}
          onClick={() => setCurrentMonth(new Date())}
        >
          Hoje
        </button>

        <button
          type="button"
          className={styles.arrowButton}
          onClick={() => mudarMes(-1)}
          aria-label="Mês anterior"
        >
          <Chevron direcao="esquerda" />
        </button>

        <span className={styles.month} aria-live="polite">
          {rotuloMes}
        </span>

        <button
          type="button"
          className={styles.arrowButton}
          onClick={() => mudarMes(1)}
          aria-label="Próximo mês"
        >
          <Chevron direcao="direita" />
        </button>
      </div>
    </header>
  );
}