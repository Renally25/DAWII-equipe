"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Sidebar from "../../sidebar/sidebar";
import Top from "../../top/top";
import PainelPaciente from "./PainelPaciente";
import ListaProtocolos from "./ListaProtocolos";
import ListaExercicios from "./ListaExercicios";
import ModalExercicio from "./ModalExercicio";
import { profiles } from "../../sidebar/profiles";
import styles from "../../treino/[codusuario]/treino.module.css";

export default function TelaProtocolo() {
  const params = useParams();
  const codusuario = params.codusuario;
  const COD_FISIOTERAPEUTA = 103; // Altere para um codusuario existente na tabela Fisioterapeuta
  console.log("Params:", params);
  console.log("Codusuario:", codusuario);

  const [paciente, setPaciente] = useState(null);
  const [protocolo, setProtocolo] = useState({});
  const [protocolos, setProtocolos] = useState([]);
  const [protocoloSelecionado, setProtocoloSelecionado] = useState(null);
  const [diaSelecionado, setDiaSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);

  const [modalAberto, setModalAberto] = useState(false);
  const [modoModal, setModoModal] = useState("novo");
  const [exercicioSelecionado, setExercicioSelecionado] = useState(null);

  const [mostrarNovoProtocolo, setMostrarNovoProtocolo] = useState(false);
  const [novoProtocolo, setNovoProtocolo] = useState({
    descricao: "",
    dataprotocolo: "",
  });

  useEffect(() => {
    if (codusuario) {
      carregarPaciente();
      carregarProtocolos();
    }
  }, [codusuario]);

  async function carregarPaciente() {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_API}/api/Usuario/${codusuario}`,
      );

      if (!response.ok) throw new Error("Erro ao carregar paciente");

      const data = await response.json();
      setPaciente(data);
    } catch (err) {
      console.log("Erro ao carregar paciente:", err);
    }
  }

  async function selecionarProtocolo(protocolo) {
  setProtocoloSelecionado(protocolo);
  setDiaSelecionado(protocolo.descricao);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_API}/api/Exercicio?codprotocolo=${protocolo.codprotocolo}`
    );

    if (!response.ok) {
      throw new Error("Erro ao carregar exercícios");
    }

    const exercicios = await response.json();

    setProtocolo((prev) => ({
      ...prev,
      [protocolo.descricao]: {
        exercicios,
      },
    }));
  } catch (err) {
    console.error("Erro ao carregar exercícios:", err);

    setProtocolo((prev) => ({
      ...prev,
      [protocolo.descricao]: {
        exercicios: [],
      },
    }));
  } finally {
    setLoading(false);
  }
}

  async function carregarProtocolos() {
    try {
const response = await fetch(
  `${process.env.NEXT_PUBLIC_AUTH_API}/api/Protocolo?codfisioterapeuta=${COD_FISIOTERAPEUTA}`,
);

      if (!response.ok) throw new Error("Erro ao carregar protocolos");

      const data = await response.json();
      setProtocolos(data);

      if (data.length > 0) {
        await selecionarProtocolo(data[0]);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.log("Erro ao carregar protocolos:", err);
      setLoading(false);
    }
  }

  async function criarNovoProtocolo() {
    if (!novoProtocolo.descricao.trim()) {
      alert("Por favor, informe a descrição do protocolo");
      return;
    }
    if (!novoProtocolo.dataprotocolo) {
      alert("Por favor, informe a data do protocolo");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API}/api/Protocolo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          descricao: novoProtocolo.descricao.trim(),
          dataprotocolo: novoProtocolo.dataprotocolo,
          codfisioterapeuta: COD_FISIOTERAPEUTA,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || errorData.details || "Erro ao criar protocolo",
        );
      }

      await carregarProtocolos();

      setMostrarNovoProtocolo(false);
      setNovoProtocolo({
        descricao: "",
        dataprotocolo: "",
      });

      alert("Protocolo criado com sucesso!");
    } catch (err) {
      console.log("Erro ao criar protocolo:", err);
      alert(err.message || "Erro ao criar protocolo");
    }
  }

  function abrirNovoExercicio() {
    if (!protocoloSelecionado) {
      alert("Crie um protocolo primeiro antes de adicionar exercícios");
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
        `${process.env.NEXT_PUBLIC_AUTH_API}api/Exercicio/${codexercicio}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) throw new Error("Erro ao excluir exercício");

      if (protocoloSelecionado) {
        await selecionarProtocolo(protocoloSelecionado);
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
            <ListaProtocolos
              protocolos={protocolos}
              protocoloSelecionado={protocoloSelecionado}
              selecionarProtocolo={selecionarProtocolo}
              onCriarProtocolo={() => setMostrarNovoProtocolo(true)}
            />
            {mostrarNovoProtocolo && (
              <div className={styles.novoTreinoCard}>
                <h4>Novo Protocolo</h4>
                <input
                  type="text"
                  placeholder="Descrição (ex: Treino A - Fortalecimento de Lombar)"
                  value={novoProtocolo.descricao}
                  onChange={(e) =>
                    setNovoProtocolo({ ...novoProtocolo, descricao: e.target.value })
                  }
                />
                <input
                  type="date"
                  value={novoProtocolo.dataprotocolo}
                  onChange={(e) =>
                    setNovoProtocolo({ ...novoProtocolo, dataprotocolo: e.target.value })
                  }
                />

                <div className={styles.botoesTreino}>
                  <button
                    className={styles.cancelar}
                    onClick={() => {
                      setMostrarNovoProtocolo(false);
                      setNovoProtocolo({
                        descricao: "",
                        dataprotocolo: "",
                      });
                    }}
                  >
                    Cancelar
                  </button>
                  <button className={styles.salvar} onClick={criarNovoProtocolo}> 
                    Criar Protocolo
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className={styles.right}>
            <ListaExercicios
              dia={diaSelecionado}
              protocolo={protocolo}
              onEditar={editarExercicio}
              onExcluir={excluirExercicio}
              onAdicionar={abrirNovoExercicio}
              temProtocolo={!!protocoloSelecionado}
            />
          </div>
        </div>
      </div>

      {modalAberto && (
        <ModalExercicio
          modo={modoModal}
          exercicio={exercicioSelecionado}
          codprotocolo={protocoloSelecionado?.codprotocolo}
          fechar={() => setModalAberto(false)}
          atualizar={() => {
            if (protocoloSelecionado) {
              selecionarProtocolo(protocoloSelecionado);
            }
          }}
        />
      )}
    </div>
  );
}