"use client";

import styles from "../../treino/[codusuario]/PainelPaciente.module.css";
import { formatarData, mascararCpf } from "../../treino/utils";

export default function PainelPaciente({ paciente }) {
  if (!paciente) return null;

  return (
    <section className={styles.card}>
      <div className={styles.topo}>
        {/* Foto real, se existir, ou a inicial (antes: imagem externa fixa) */}
        <div className={styles.avatar} aria-hidden="true">
          {paciente.fotoperfil ? (
            <img src={paciente.fotoperfil} alt="" />
          ) : (
            (paciente.nome || "?").charAt(0).toUpperCase()
          )}
        </div>

        <div>
          <h2>{paciente.nome}</h2>
          <p>Aluno-paciente</p>
        </div>
      </div>

      <dl className={styles.info}>
        <div className={styles.item}>
          <dt className={styles.label}>Código</dt>
          <dd className={styles.valor}>{paciente.codusuario}</dd>
        </div>

        <div className={styles.item}>
          <dt className={styles.label}>CPF</dt>
          <dd className={styles.valor}>{mascararCpf(paciente.cpf)}</dd>
        </div>

        <div className={styles.item}>
          <dt className={styles.label}>Nascimento</dt>
          <dd className={styles.valor}>
            {formatarData(paciente.dtnascimento) || "—"}
          </dd>
        </div>

        <div className={styles.item}>
          <dt className={styles.label}>Telefone</dt>
          <dd className={styles.valor}>{paciente.telefone || "—"}</dd>
        </div>

        <div className={styles.item}>
          <dt className={styles.label}>Objetivo</dt>
          <dd className={styles.valor}>
            {paciente.objetivo || "Não informado"}
          </dd>
        </div>
      </dl>
    </section>
  );
}