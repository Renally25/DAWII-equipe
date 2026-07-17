import styles from "./calendar.module.css";

export default function CelulaDia({ day, events, selected, onClick, isCurrentMonth, isToday}) { // events já contém apenas as consultas deste dia
  
  return (
    <div
      className={`${styles.day} ${
        selected ? styles.selected : ""
      } ${!isCurrentMonth ? styles.outsideMonth : ""} ${isToday ? styles.today : ""}`}
      onClick={onClick}
    >
      <strong>{day.getDate()}</strong>
      {events.map((event) => (
        <p key={event.id}>
          <strong>{event.time}</strong> 
          {" "} 
          {event.patient}
        </p>
      ))}
    </div>
  );
}
