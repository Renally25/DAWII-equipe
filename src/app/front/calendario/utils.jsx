export function buildMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const start = new Date(firstDay);

  start.setDate(
    firstDay.getDate() - firstDay.getDay(), //dia do mes - dia da semana
  );

  const days = [];

  for (let i = 0; i < 42; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    days.push(day);
  }

  return days;
}

export function isSameDay(date1, date2) {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

/*
 * Chave "AAAA-MM-DD" no fuso LOCAL.
 * (day.toISOString() converte para UTC e pode cair no dia errado,
 * dependendo do fuso do navegador.)
 */
export function chaveDia(date) {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const dia = String(date.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}