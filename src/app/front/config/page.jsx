"use client";

import Sidebar from "../sidebar/sidebar";
import { profiles } from "../sidebar/profiles";
import { useState } from "react";
import styles from "./config.module.css";
import Top from "../top/top";

export default function TelaConfig({ profile }) {
  const [data, setData] = useState({});
  //rotas get e put serão mexidas
  //post colocado pelo admin
  //função para calcular idade

  return (
    <div className={styles.dashboard}>
      <Sidebar profile={profiles.fisioterapeuta} />
      {/* tornar dinamico */}

      <div className={styles.container}>
        <Top />
        <div className={styles.main}>
          <div className={styles.header}>
            <h1>Configurações</h1>
            <button>Salvar Alterações</button>
          </div>
          <div className={styles.fotoPerfil}>
            <h1>Foto de Perfil</h1>
            <div className={styles.fotoElements}>
              <img
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGVyc29ufGVufDB8fDB8fHww"
                alt="aluno_paciente"
              />
                <div className={styles.fotoText}>
                <h1>Dr.Coisinha</h1>
                <button>Alterar foto</button>
              </div>
            </div>
          </div>
          <div className={styles.perfil}>
            <h1>Dados pessoais e Profissionais</h1>
            <form action="dadosBase" method="post">
              <div className={styles.camposInput}>
                <label htmlFor="nome">Nome Completo:</label>
                <input type="text" id="nome" name="nome" value="Dr.Coisinha" />
              </div>
              <div className={styles.camposInput}>
                <label htmlFor="nome">Email:</label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  value="coisinha@gmail.com"
                />
              </div>
              <div className={styles.camposInput}>
                <label htmlFor="nome">Telefone:</label>
                <input
                  type="text"
                  id="telefone"
                  name="telefone"
                  value="(83) 9xxxx-xxxx"
                />
              </div>
              <div className={styles.camposInput}>
                <label htmlFor="nome">Endereço:</label>
                <input
                  type="text"
                  id="endereco"
                  name="endereco"
                  value="Rua das Pedras, 244"
                />
              </div>
              <div className={styles.camposInput}>
                <label htmlFor="nome">Credencial:</label>
                <input
                  type="text"
                  id="credencial"
                  name="credencial"
                  value="cre123"
                />
              </div>
            </form>
          </div>
          <div className={styles.notificacoes}>
            <h1>notificacoes</h1>
          </div>
        </div>
      </div>
    </div>
  );
}
