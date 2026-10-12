"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
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

  const { data: session } = useSession();

  const codfisioterapeuta = session?.user?.id;

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

  const [aviso, setAviso] = useState(null); // { tipo: "erro" | "sucesso", texto }
  const [erroProtocolo, setErroProtocolo] = useState("");

  useEffect(() => {
    if (codusuario && codfisioterapeuta) {
      carregarPaciente();
      carregarProtocolos();
    }
  }, [codusuario, codfisioterapeuta]);

  async function carregarPaciente() {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_API}/api/Usuario/${codusuario}`,
      );

      if (!response.ok) {
        throw new Error("Erro ao carregar paciente");
      }

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
        `${process.env.NEXT_PUBLIC_AUTH_API}/api/Exercicio?codprotocolo=${protocolo.codprotocolo}`,
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
        `${process.env.NEXT_PUBLIC_AUTH_API}/api/Protocolo?codusuario=${codusuario}`,
      );

      if (!response.ok) {
        throw new Error("Erro ao carregar protocolos");
      }

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

  function fecharNovoProtocolo() {
    setMostrarNovoProtocolo(false);
    setErroProtocolo("");
    setNovoProtocolo({
      descricao: "",
      dataprotocolo: "",
    });
  }

  async function criarNovoProtocolo() {
    setErroProtocolo("");

    if (!novoProtocolo.descricao.trim()) {
      setErroProtocolo("Por favor, informe a descrição do protocolo.");
      return;
    }

    if (!novoProtocolo.dataprotocolo) {
      setErroProtocolo("Por favor, informe a data do protocolo.");
      return;
    }

    if (!codfisioterapeuta) {
      setErroProtocolo("Fisioterapeuta não identificado.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_API}/api/Protocolo`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            descricao: novoProtocolo.descricao.trim(),
            dataprotocolo: novoProtocolo.dataprotocolo,
            codfisioterapeuta: codfisioterapeuta,
            codusuario: codusuario,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
          errorData.error || errorData.details || "Erro ao criar protocolo",
        );
      }

      await carregarProtocolos();

      fecharNovoProtocolo();
      setAviso({ tipo: "sucesso", texto: "Protocolo criado com sucesso." });
    } catch (err) {
      console.log("Erro ao criar protocolo:", err);

      setErroProtocolo(err.message || "Erro ao criar protocolo.");
    }
  }

  function abrirNovoExercicio() {
    if (!protocoloSelecionado) {
      setAviso({
        tipo: "erro",
        texto: "Crie um protocolo primeiro antes de adicionar exercícios.",
      });
      return;
    }

    setAviso(null);
    setModoModal("novo");
    setExercicioSelecionado(null);
    setModalAberto(true);
  }

  function editarExercicio(exercicio) {
    setAviso(null);
    setModoModal("editar");
    setExercicioSelecionado(exercicio);
    setModalAberto(true);
  }

  async function excluirExercicio(codexercicio) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este exercício?",
    );

    if (!confirmar) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_API}/api/Exercicio/${codexercicio}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao excluir exercício");
      }

      if (protocoloSelecionado) {
        await selecionarProtocolo(protocoloSelecionado);
      }

      setAviso({ tipo: "sucesso", texto: "Exercício excluído com sucesso." });
    } catch (err) {
      console.log("Erro ao excluir exercício:", err);

      setAviso({ tipo: "erro", texto: "Não foi possível excluir o exercício." });
    }
  }

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <Sidebar profile={profiles.fisioterapeuta} />

        <div className={styles.main}>
          <Top />

          <div className={styles.container}>
            <div className={styles.loading} role="status">
              Carregando...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <Sidebar profile={profiles.fisioterapeuta} />

      <div className={styles.main}>
        <Top />

        {aviso && (
          <p
            role={aviso.tipo === "erro" ? "alert" : "status"}
            className={`${styles.aviso} ${
              aviso.tipo === "erro" ? styles.avisoErro : styles.avisoSucesso
            }`}
          >
            {aviso.texto}
          </p>
        )}

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
              <form
                className={styles.novoTreinoCard}
                onSubmit={(e) => {
                  e.preventDefault();
                  criarNovoProtocolo();
                }}
              >
                <h4>Novo protocolo</h4>

                <div className={styles.campo}>
                  <label htmlFor="protocolo-descricao" className={styles.label}>
                    Descrição
                  </label>
                  <input
                    id="protocolo-descricao"
                    type="text"
                    placeholder="Ex.: Fortalecimento de lombar"
                    autoFocus
                    value={novoProtocolo.descricao}
                    onChange={(e) =>
                      setNovoProtocolo({
                        ...novoProtocolo,
                        descricao: e.target.value,
                      })
                    }
                  />
                </div>

                <div className={styles.campo}>
                  <label htmlFor="protocolo-data" className={styles.label}>
                    Data
                  </label>
                  <input
                    id="protocolo-data"
                    type="date"
                    value={novoProtocolo.dataprotocolo}
                    onChange={(e) =>
                      setNovoProtocolo({
                        ...novoProtocolo,
                        dataprotocolo: e.target.value,
                      })
                    }
                  />
                </div>

                {erroProtocolo && (
                  <p role="alert" className={styles.erroCampo}>
                    {erroProtocolo}
                  </p>
                )}

                <div className={styles.botoesTreino}>
                  <button
                    type="button"
                    className={styles.cancelar}
                    onClick={fecharNovoProtocolo}
                  >
                    Cancelar
                  </button>

                  <button type="submit" className={styles.salvar}>
                    Criar protocolo
                  </button>
                </div>
              </form>
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