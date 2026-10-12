"use client";

import { useState, useEffect } from "react";
import styles from "./ModalExercicio.module.css";

const FORM_VAZIO = {
  nome: "",
  series: "",
  repeticoes: "",
  peso: "",
  descricao: "",
  descanso: "",
};

export default function ModalExercicio({
  modo,
  exercicio,
  codtreino,
  fechar,
  atualizar,
}) {
  const [form, setForm] = useState(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(""); // substitui os alert()

  useEffect(() => {
    if (modo === "editar" && exercicio) {
      setForm({
        nome: exercicio.nome || "",
        series: exercicio.series || "",
        repeticoes: exercicio.repeticoes || "",
        peso: exercicio.peso || "",
        descricao: exercicio.descricao || "",
        descanso: exercicio.descanso || "",
      });
    } else {
      setForm(FORM_VAZIO);
    }
    setErro("");
  }, [modo, exercicio]);

  // Esc fecha o modal (padrão esperado em diálogos)
  useEffect(() => {
    function aoPressionar(e) {
      if (e.key === "Escape" && !salvando) fechar();
    }
    document.addEventListener("keydown", aoPressionar);
    return () => document.removeEventListener("keydown", aoPressionar);
  }, [fechar, salvando]);

  function alterarCampo(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function salvar() {
    setErro("");

    if (!form.nome.trim()) {
      setErro("Por favor, informe o nome do exercício.");
      return;
    }
    if (!form.series || parseInt(form.series) < 1) {
      setErro("Por favor, informe o número de séries.");
      return;
    }
    if (!form.repeticoes || parseInt(form.repeticoes) < 1) {
      setErro("Por favor, informe o número de repetições.");
      return;
    }

    if (!codtreino) {
      setErro("Nenhum treino selecionado.");
      return;
    }

    setSalvando(true);

    try {
      const body = {
        nome: form.nome.trim(),
        series: parseInt(form.series),
        repeticoes: parseInt(form.repeticoes),
        descanso: form.descanso ? parseFloat(form.descanso) : null, // Pode vir null
        peso: form.peso ? parseFloat(form.peso) : null,
        descricao: form.descricao.trim() || null,
        codtreino: parseInt(codtreino),
      };

      let response;

      if (modo === "novo") {
        response = await fetch(
          `${process.env.NEXT_PUBLIC_AUTH_API}/api/Exercicio`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          },
        );
      } else {
        if (!exercicio?.codexercicio) {
          throw new Error("ID do exercício não encontrado");
        }

        response = await fetch(
          `${process.env.NEXT_PUBLIC_AUTH_API}/api/Exercicio/${exercicio.codexercicio}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          },
        );
      }

      // Tratamento de erro melhorado
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage =
            errorData.error || errorData.details || response.statusText;
          // Se errorData for um objeto, converte para string legível
          if (typeof errorMessage === "object") {
            errorMessage = JSON.stringify(errorMessage);
          }
        } catch (e) {
          errorMessage = (await response.text()) || `Erro ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      await atualizar();
      fechar(); // o card novo/atualizado aparecendo na lista já confirma o salvamento
    } catch (err) {
      console.error("Erro ao salvar:", err);
      setErro(`Erro ao salvar exercício: ${err.message}`);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={salvando ? undefined : fechar}>
      <form
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-exercicio-titulo"
        noValidate
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          salvar();
        }}
      >
        <h2 id="modal-exercicio-titulo">
          {modo === "novo" ? "Novo exercício" : "Editar exercício"}
        </h2>
        <p className={styles.legenda}>Campos com * são obrigatórios.</p>

        <div className={styles.campo}>
          <label htmlFor="ex-nome">Nome do exercício *</label>
          <input
            id="ex-nome"
            name="nome"
            value={form.nome}
            onChange={alterarCampo}
            placeholder="Ex.: Supino reto"
            disabled={salvando}
            aria-required="true"
            autoFocus
          />
        </div>

        <div className={styles.trio}>
          <div className={styles.campo}>
            <label htmlFor="ex-series">Séries *</label>
            <input
              id="ex-series"
              name="series"
              type="number"
              inputMode="numeric"
              min="1"
              value={form.series}
              onChange={alterarCampo}
              placeholder="3"
              disabled={salvando}
              aria-required="true"
            />
          </div>

          <div className={styles.campo}>
            <label htmlFor="ex-repeticoes">Repetições *</label>
            <input
              id="ex-repeticoes"
              name="repeticoes"
              type="number"
              inputMode="numeric"
              min="1"
              value={form.repeticoes}
              onChange={alterarCampo}
              placeholder="12"
              disabled={salvando}
              aria-required="true"
            />
          </div>

          <div className={styles.campo}>
            <label htmlFor="ex-descanso">Descanso (s)</label>
            <input
              id="ex-descanso"
              name="descanso"
              type="number"
              step="0.5"
              min="0"
              value={form.descanso}
              onChange={alterarCampo}
              placeholder="60"
              disabled={salvando}
            />
          </div>
        </div>

        <div className={styles.campo}>
          <label htmlFor="ex-peso">Peso (kg)</label>
          <input
            id="ex-peso"
            name="peso"
            type="number"
            step="0.5"
            min="0"
            value={form.peso}
            onChange={alterarCampo}
            placeholder="20"
            disabled={salvando}
          />
        </div>

        <div className={styles.campo}>
          <label htmlFor="ex-descricao">Descrição</label>
          <textarea
            id="ex-descricao"
            rows={3}
            name="descricao"
            value={form.descricao}
            onChange={alterarCampo}
            placeholder="Observações sobre o exercício..."
            disabled={salvando}
          />
        </div>

        {erro && (
          <p role="alert" className={styles.erro}>
            {erro}
          </p>
        )}

        <div className={styles.botoes}>
          <button
            type="button"
            className={styles.cancelar}
            onClick={fechar}
            disabled={salvando}
          >
            Cancelar
          </button>

          <button type="submit" className={styles.salvar} disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}