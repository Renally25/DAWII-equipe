"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Sidebar from "../../sidebar/sidebar";
import Top from "../../top/top";
import PainelPaciente from "./PainelPaciente";
import ListaTreinos from "./ListaTreinos";
import ListaExercicios from "./ListaExercicios";
import ModalExercicio from "./ModalExercicio";
import { profiles } from "../../sidebar/profiles";
import styles from "./treino.module.css";

export default function TelaTreino() {
  const params = useParams();
  const codusuario = params.codusuario;
  const [paciente, setPaciente] = useState(null);
  const [treino, setTreino] = useState({});
  const [treinos, setTreinos] = useState([]);
  const [treinoSelecionado, setTreinoSelecionado] = useState(null);
  const [diaSelecionado, setDiaSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);

  const [modalAberto, setModalAberto] = useState(false);
  const [modoModal, setModoModal] = useState("novo");
  const [exercicioSelecionado, setExercicioSelecionado] = useState(null);

  const [mostrarNovoTreino, setMostrarNovoTreino] = useState(false);
  const [novoTreino, setNovoTreino] = useState({
    descricao: "",
    datatreino: "",
    duracao: "",
  });

  useEffect(() => {
    if (codusuario) {
      carregarPaciente();
      carregarTreinos();
    }
  }, [codusuario]);

  async function carregarPaciente() {
    try {
      const response = await fetch(
        `http://localhost:3000/api/Usuario/${codusuario}`,
      );

      if (!response.ok) throw new Error("Erro ao carregar paciente");

      const data = await response.json();
      setPaciente(data);
    } catch (err) {
      console.log("Erro ao carregar paciente:", err);
    }
  }

  async function selecionarTreino(treino) {
    setTreinoSelecionado(treino);
    setDiaSelecionado(treino.descricao);

    try {
      const response = await fetch(
        `http://localhost:3000/api/Exercicio?codtreino=${treino.codtreino}`,
      );

      if (!response.ok) throw new Error("Erro ao carregar exercícios");

      const exercicios = await response.json();

      setTreino((prev) => ({
        ...prev,
        [treino.descricao]: { exercicios: exercicios }, //exercicios dentro do treino
      }));
    } catch (err) {
      console.log("Erro ao carregar exercícios:", err);
      setTreino((prev) => ({
        ...prev,
        [treino.descricao]: { exercicios: [] },
      }));
    } finally {
      setLoading(false);
    }
  }

  async function carregarTreinos() {
    try {
      const response = await fetch(
        `http://localhost:3000/api/Treino?codusuario=${codusuario}`,
      );

      if (!response.ok) throw new Error("Erro ao carregar treinos");

      const data = await response.json();
      setTreinos(data);

      if (data.length > 0) {
        await selecionarTreino(data[0]);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.log("Erro ao carregar treinos:", err);
      setLoading(false);
    }
  }

  async function criarNovoTreino() {
    if (!novoTreino.descricao.trim()) {
      alert("Por favor, informe a descrição do treino");
      return;
    }
    if (!novoTreino.datatreino) {
      alert("Por favor, informe a data do treino");
      return;
    }
    if (!novoTreino.duracao || parseFloat(novoTreino.duracao) <= 0) {
      alert("Por favor, informe a duração do treino");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/Treino", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          descricao: novoTreino.descricao.trim(),
          datatreino: novoTreino.datatreino,
          duracao: parseFloat(novoTreino.duracao),
          codusuario: parseInt(codusuario),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao criar treino");
      }

      await carregarTreinos();

      setMostrarNovoTreino(false);
      setNovoTreino({
        descricao: "",
        datatreino: "",
        duracao: "",
      });

      alert("Treino criado com sucesso!");
    } catch (err) {
      console.log("Erro ao criar treino:", err);
      alert(err.message || "Erro ao criar treino");
    }
  }

  function abrirNovoExercicio() {
    if (!treinoSelecionado) {
      alert("Crie um treino primeiro antes de adicionar exercícios");
      return;
    }
    setModoModal("novo");
    setExercicioSelecionado(null);
    setModalAberto(true);
  }

  function editarExercicio(exercicio) {
    setModoModal("editar");
    setExercicioSelecionado(exercicio);
    setModalAberto(true);
  }

  async function excluirExercicio(codexercicio) {
    const confirmar = confirm("Tem certeza que deseja excluir este exercício?");

    if (!confirmar) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/Exercicio/${codexercicio}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) throw new Error("Erro ao excluir exercício");

      if (treinoSelecionado) {
        await selecionarTreino(treinoSelecionado);
      }

      alert("Exercício excluído com sucesso!");
    } catch (err) {
      console.log("Erro ao excluir exercício:", err);
      alert("Erro ao excluir exercício");
    }
  }

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <Sidebar profile={profiles.treinador} />
        <div className={styles.main}>
          <Top />
          <div className={styles.container}>
            <div className={styles.loading}>Carregando...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <Sidebar profile={profiles.treinador} />

      <div className={styles.main}>
        <Top />

        <div className={styles.container}>
          <div className={styles.left}>
            <PainelPaciente paciente={paciente} />
            <ListaTreinos
              treinos={treinos}
              treinoSelecionado={treinoSelecionado}
              selecionarTreino={selecionarTreino}
              onCriarTreino={() => setMostrarNovoTreino(true)}
            />
            {mostrarNovoTreino && (
              <div className={styles.novoTreinoCard}>
                <h4>Novo Treino</h4>
                <input
                  type="text"
                  placeholder="Descrição (ex: Treino A - Superiores)"
                  value={novoTreino.descricao}
                  onChange={(e) =>
                    setNovoTreino({ ...novoTreino, descricao: e.target.value })
                  }
                />
                <input
                  type="date"
                  value={novoTreino.datatreino}
                  onChange={(e) =>
                    setNovoTreino({ ...novoTreino, datatreino: e.target.value })
                  }
                />
                <input
                  type="number"
                  step="0.5"
                  placeholder="Duração (horas)"
                  value={novoTreino.duracao}
                  onChange={(e) =>
                    setNovoTreino({ ...novoTreino, duracao: e.target.value })
                  }
                />
                <div className={styles.botoesTreino}>
                  <button
                    className={styles.cancelar}
                    onClick={() => {
                      setMostrarNovoTreino(false);
                      setNovoTreino({
                        descricao: "",
                        datatreino: "",
                        duracao: "",
                      });
                    }}
                  >
                    Cancelar
                  </button>
                  <button className={styles.salvar} onClick={criarNovoTreino}>
                    Criar Treino
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className={styles.right}>
            <ListaExercicios
              dia={diaSelecionado}
              treino={treino}
              onEditar={editarExercicio}
              onExcluir={excluirExercicio}
              onAdicionar={abrirNovoExercicio}
              temTreino={!!treinoSelecionado}
            />
          </div>
        </div>
      </div>

      {modalAberto && (
        <ModalExercicio
          modo={modoModal}
          exercicio={exercicioSelecionado}
          codtreino={treinoSelecionado?.codtreino}
          fechar={() => setModalAberto(false)}
          atualizar={() => {
            if (treinoSelecionado) {
              selecionarTreino(treinoSelecionado);
            }
          }}
        />
      )}
    </div>
  );
}