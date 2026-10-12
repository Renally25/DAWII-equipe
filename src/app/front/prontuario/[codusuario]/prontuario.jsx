"use client";

import { useParams } from "next/navigation";
import styles from "./prontuario.module.css";
import { useEffect, useState } from "react";
import {
  abrirProntuario,
  calcularIdade,
  lerDataLocal,
  pegarDiarios,
  salvarObservacoes,
} from "./utils";


function capitalizar(texto) {
  const t = String(texto || "");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export default function Prontuario() {
  const { codusuario } = useParams();
  const [observacoes, setObservacoes] = useState("");
  const [obsSalvas, setObsSalvas] = useState(""); 
  const [editandoObs, setEditandoObs] = useState(false);
  const [salvandoObs, setSalvandoObs] = useState(false);
  const [erroObs, setErroObs] = useState("");
  const [prontuario, setProntuario] = useState(null);
  const [diarios, setDiarios] = useState([]);

  useEffect(() => {
    if (!codusuario) return;

    abrirProntuario({
      codusuario,
      setProntuario,
      setObservacoes,
    });

    const carregarDiarios = async () => {
      const dadosDiarios = await pegarDiarios({ codusuario });
      if (dadosDiarios) {
        setDiarios(dadosDiarios); 
      }
    };
    carregarDiarios();
  }, [codusuario]);

  useEffect(() => {
    if (prontuario) {
      setObsSalvas(prontuario.observacoes || "");
    }
  }, [prontuario]);

  if (!prontuario) {
    return (
      <p className={styles.carregando} role="status">
        Carregando prontuário...
      </p>
    );
  }

  const nascimento = lerDataLocal(prontuario.dtnascimento);
  const idade = calcularIdade(prontuario.dtnascimento);

  const contatos = [
    prontuario.email,
    prontuario.telefone,
    [prontuario.cidade, prontuario.estado].filter(Boolean).join(" - "),
    [prontuario.rua, prontuario.numero].filter(Boolean).join(", "),
  ].filter(Boolean);

  async function handleSalvar() {
    setErroObs("");
    setSalvandoObs(true);

    const ok = await salvarObservacoes({
      codusuario,
      observacoes,
      setEditandoObs,
    });

    setSalvandoObs(false);

    if (ok) {
      setObsSalvas(observacoes);
    } else {
      setErroObs("Não foi possível salvar. Tente novamente.");
    }
  }

  function handleCancelar() {
    setObservacoes(obsSalvas);
    setErroObs("");
    setEditandoObs(false);
  }

  return (
    <div className={styles.container}>
      <header className={styles.cabecalho}>
        <div className={styles.basico}>
          <div className={styles.foto} aria-hidden="true">
            {prontuario.fotoperfil ? (
              <img src={prontuario.fotoperfil} alt="" />
            ) : (
              (prontuario.nome || "?").charAt(0).toUpperCase()
            )}
          </div>

          <div className={styles.infosBase}>
            <h2>{prontuario.nome}</h2>
            {idade !== null && <p>{idade} anos</p>}
            {nascimento && (
              <p>
                Nascimento:{" "}
                {nascimento.toLocaleDateString("pt-BR", {
                  dateStyle: "short",
                })}
              </p>
            )}
          </div>
        </div>

        {contatos.length > 0 && (
          <ul className={styles.contatos} aria-label="Contatos">
            {contatos.map((contato) => (
              <li key={contato}>{contato}</li>
            ))}
          </ul>
        )}
      </header>

      <main>
        <h2 className={styles.secaoTitulo}>Histórico de diários</h2>
        <p className={styles.subtitulo}>
          {diarios.length === 1
            ? "1 diário registrado"
            : `${diarios.length} diários registrados`}
        </p>

        <div className={styles.principalContainer}>
          <div className={styles.cardsContainer}>
            {diarios.length === 0 ? (
              <p className={styles.vazio}>
                Nenhum diário encontrado para este paciente.
              </p>
            ) : (
              diarios.map((diario) => {
                return (
                  <article
                    key={diario.coddiario || diario.datadiario}
                    className={styles.cardDiario}
                  >
                    <div className={styles.diarioTopo}>
                      <span className={styles.diarioData}>
                        {new Date(diario.datadiario).toLocaleDateString(
                          "pt-BR",
                        )}
                      </span>
                    </div>

                    <p className={styles.diarioTexto}>{diario.descricao}</p>
                  </article>
                );
              })
            )}
          </div>

          <aside className={styles.observacoes}>
            <h3>Observações sobre o paciente</h3>

            {editandoObs ? (
              <>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  aria-label="Observações sobre o paciente"
                />

                {erroObs && (
                  <p role="alert" className={styles.mensagemErro}>
                    {erroObs}
                  </p>
                )}

                <div className={styles.acoes}>
                  <button
                    type="button"
                    className={styles.botaoPrimario}
                    onClick={handleSalvar}
                    disabled={salvandoObs}
                  >
                    {salvandoObs ? "Salvando..." : "Salvar"}
                  </button>

                  <button
                    type="button"
                    className={styles.botaoSecundario}
                    onClick={handleCancelar}
                    disabled={salvandoObs}
                  >
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className={styles.textoObs}>
                  {observacoes || "Nenhuma observação cadastrada."}
                </p>

                <div className={styles.acoes}>
                  <button
                    type="button"
                    className={styles.botaoSecundario}
                    onClick={() => setEditandoObs(true)}
                  >
                    Editar
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}