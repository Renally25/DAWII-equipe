import styles from "./top.module.css";

export default function Top() {
  return (
    <div className={styles.top}>
      <p>Visão Geral</p> 
      <div className={styles.blocInfos}>
          <img
            src="https://img.magnific.com/premium-vector/man-avatar-profile-picture-isolated-background-avatar-profile-picture-man_1293239-4841.jpg?semt=ais_hybrid&w=740&q=80"
            alt="avatar"
            className={styles.avatarInicial}
          />
          <div className={styles.subtopic}>
              <p>Dr. Coisinha</p> 
              <p>Profissão Médica</p>
          </div>
      </div>
    </div>
  );
}