"use client";

import { useState, useEffect } from "react";
import styles from "./ModalExercicio.module.css";

export default function ModalExercicio({
  modo,
  exercicio,
  codtreino,
  fechar,
  atualizar,
}) {
  const [form, setForm] = useState({
    nome: "",
    series: "",
    repeticoes: "",
    peso: "",
    descricao: "",
    descanso: "",
  });
  const [salvando, setSalvando] = useState(false);

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
      setForm({
        nome: "",
        series: "",
        repeticoes: "",
        peso: "",
        descricao: "",
        descanso: "",
      });
    }
  }, [modo, exercicio]);

  function alterarCampo(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function salvar() {
    if (!form.nome.trim()) {
      alert("Por favor, informe o nome do exercício");
      return;
    }
    if (!form.series || parseInt(form.series) < 1) {
      alert("Por favor, informe o número de séries");
      return;
    }
    if (!form.repeticoes || parseInt(form.repeticoes) < 1) {
      alert("Por favor, informe o número de repetições");
      return;
    }

    if (!codtreino) {
      alert("Nenhum treino selecionado");
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

      console.log("Enviando dados:", body);

      let response;

      if (modo === "novo") {
        response = await fetch("http://localhost:3000/api/Exercicio", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
      } else {
        if (!exercicio?.codexercicio) {
          throw new Error("ID do exercício não encontrado");
        }

        response = await fetch(
          `http://localhost:3000/api/Exercicio/${exercicio.codexercicio}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          }
        );
      }

      // Tratamento de erro melhorado
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || response.statusText;
          // Se errorData for um objeto, converte para string legível
          if (typeof errorMessage === 'object') {
            errorMessage = JSON.stringify(errorMessage);
          }
        } catch (e) {
          errorMessage = await response.text() || `Erro ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      await atualizar();
      fechar();
      alert("Exercício salvo com sucesso!");

    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert(`Erro ao salvar exercício: ${err.message}`);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={fechar}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>{modo === "novo" ? "Novo Exercício" : "Editar Exercício"}</h2>

        <label>Nome do Exercício *</label>
        <input
          name="nome"
          value={form.nome}
          onChange={alterarCampo}
          placeholder="Ex: Supino reto"
          disabled={salvando}
        />

        <div className={styles.duplo}>
          <div>
            <label>Séries *</label>
            <input
              name="series"
              type="number"
              min="1"
              value={form.series}
              onChange={alterarCampo}
              placeholder="3"
              disabled={salvando}
            />
          </div>

          <div>
            <label>Repetições *</label>
            <input
              name="repeticoes"
              type="number"
              min="1"
              value={form.repeticoes}
              onChange={alterarCampo}
              placeholder="12"
              disabled={salvando}
            />
          </div>

          <div>
            <label>Descanso (segundos)</label>
            <input
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

        <div>
          <label>Peso (kg)</label>
          <input
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

        <label>Descrição</label>
        <textarea
          rows={3}
          name="descricao"
          value={form.descricao}
          onChange={alterarCampo}
          placeholder="Observações sobre o exercício..."
          disabled={salvando}
        />

        <div className={styles.botoes}>
          <button
            className={styles.cancelar}
            onClick={fechar}
            disabled={salvando}
          >
            Cancelar
          </button>

          <button
            className={styles.salvar}
            onClick={salvar}
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}