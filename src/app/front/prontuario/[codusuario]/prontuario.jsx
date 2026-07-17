"use client";

import { useParams } from "next/navigation";
import styles from "./prontuario.module.css";
import { useEffect, useState } from "react";
import {
  abrirProntuario,
  calcularIdade,
  pegarDiarios,
  salvarObservacoes,
} from "./utils";

export default function Prontuario() {
  const { codusuario, coddiario } = useParams();
  const [observacoes, setObservacoes] = useState("");
  const [editandoObs, setEditandoObs] = useState(false);
  const [prontuario, setProntuario] = useState(null);
  const [diarios, setDiarios] = useState([]);

  useEffect(() => {
    console.log("codusuario recebido:", codusuario);

    if (!codusuario) return;
    abrirProntuario({
      codusuario,
      setProntuario,
      setObservacoes,
    });
    const carregarDiarios = async () => {
      const dadosDiarios = await pegarDiarios({ codusuario });
      if (dadosDiarios) {
        setDiarios(dadosDiarios); // Salva no estado para usar no HTML
      }
    };
    carregarDiarios();
  }, [codusuario]);

  if (!prontuario) {
    return <p>Carregando prontuário...</p>;
  }

  return (
    <div className={styles.container}>
      <header>
        <div className={styles.basico}>
          <div className={styles.foto}>
            <img
              src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGVyc29ufGVufDB8fDB8fHww"
              alt="aluno_paciente"
            />
          </div>
          <div className={styles.infosBase}>
            <h1>{prontuario.nome}</h1>
            <p>{calcularIdade(prontuario.dtnascimento)} anos</p>
            <p>
              Nascida em{" "}
              {new Date(prontuario.dtnascimento).toLocaleString("pt-BR", {
                dateStyle: "short",
              })}
            </p>
          </div>
        </div>
        <div className={styles.contatos}>
          <p>{prontuario.email}</p>
          <p>{prontuario.telefone}</p>
          <p>
            {prontuario.cidade} - {prontuario.estado}
          </p>
          <p>
            {prontuario.rua}, {prontuario.numero}
          </p>
        </div>
      </header>
      <main>
        <h1 className={styles.titulo}>Histórico de diários</h1>
        <p className={styles.subtitulo}>
          {diarios.length} diarios registrados.
        </p>
        <div className={styles.principalContainer}>
          <div className={styles.cardsContainer}>
            {diarios.length === 0 ? (
              <p>Nenhum diário encontrado</p>
            ) : (
              diarios.map((diario) => {
                return (
                  <div
                    key={diario.coddiario || diario.datadiario}
                    className={styles.cardDiario}
                  >

                    <p>{new Date(diario.datadiario).toLocaleDateString("pt-BR")}</p>
                    <p>{diario.descricao}</p>
                    <p>{diario.humor}</p>
                  </div>
                );
              })
            )}
            </div>
            <div className={styles.observacoes}>
              <h2>Observações sobre o paciente</h2>
              {editandoObs ? (
                <>
                  <textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                  />
                  <button
                    onClick={() =>
                      salvarObservacoes({
                        codusuario,
                        observacoes,
                        setEditandoObs,
                      })
                    }
                  >
                    Salvar
                  </button>
                </>
              ) : (
                <>
                  <p>{observacoes || "Nenhuma observação cadastrada."}</p>
                  <button onClick={() => setEditandoObs(true)}>Editar</button>
                </>
              )}
          </div>
        </div>
      </main>
    </div>
  );
}