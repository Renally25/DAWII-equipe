"use client";

import styles from "./PainelPaciente.module.css";

export default function PainelPaciente({ paciente }) {
  if (!paciente) return null;

  return (
    <div className={styles.card}>
      <div className={styles.topo}>
        <img
          className={styles.avatar}
          src="https://img.magnific.com/premium-vector/man-avatar-profile-picture-isolated-background-avatar-profile-picture-man_1293239-4841.jpg?semt=ais_hybrid&w=740&q=80"
          alt={paciente.nome}
        />

        <div>
          <h2>{paciente.nome}</h2>
          <p>Aluno-Paciente</p>
        </div>
      </div>

      <div className={styles.info}>
        <div className={styles.item}>
          <span className={styles.label}>Código</span>
          <span>{paciente.codusuario}</span>
        </div>

        <div className={styles.item}>
          <span className={styles.label}>CPF</span>
          <span>{paciente.cpf}</span>
        </div>

        <div className={styles.item}>
          <span className={styles.label}>Nascimento</span>

          <span>
            {paciente.dtnascimento
              ? new Date(paciente.dtnascimento).toLocaleDateString("pt-BR")
              : "-"}
          </span>
        </div>

        <div className={styles.item}>
          <span className={styles.label}>Telefone</span>
          <span>{paciente.telefone || "-"}</span>
        </div>

        <div className={styles.item}>
          <span className={styles.label}>Objetivo</span>
          <span>{paciente.objetivo || "Não informado"}</span>
        </div>
      </div>
    </div>
  );
}