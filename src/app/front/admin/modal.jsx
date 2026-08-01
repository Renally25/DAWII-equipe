"use client";

import { useEffect, useState } from "react";
import styles from "./modal.module.css";

export default function Modal({ usuario, fechar, atualizar }) {
  const [etapa, setEtapa] = useState(1);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    cpf: "",
    tipousuario: "",
    telefone: "",
    cep: "",
    estado: "",
    cidade: "",
    bairro: "",
    rua: "",
    numero: "",
  });

  useEffect(() => {
    if (!usuario) return;

    setForm({
      nome: usuario.nome || "",
      email: usuario.email || "",
      cpf: usuario.cpf || "",
      tipousuario: usuario.tipousuario || "",
      telefone: usuario.telefone || "",
      cep: usuario.cep || "",
      estado: usuario.estado || "",
      cidade: usuario.cidade || "",
      bairro: usuario.bairro || "",
      rua: usuario.rua || "",
      numero: usuario.numero || "",
    });

    setEtapa(1);
  }, [usuario]);

  // Se não houver usuário, não renderiza nada de forma segura
  if (!usuario) return null;

  function alterarCampo(e) {
    setForm((old) => ({
      ...old,
      [e.target.name]: e.target.value,
    }));
  }

  function proximaEtapa() {
    if (etapa < 4) {
      setEtapa(etapa + 1);
    }
  }

  function etapaAnterior() {
    if (etapa > 1) {
      setEtapa(etapa - 1);
    }
  }

  async function finalizarEdicao() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_API}/api/Usuario`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codusuario: usuario.codusuario,
          ...form,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Erro ao atualizar usuário.");
      return;
    }

    alert("Usuário atualizado com sucesso!");

    atualizar();
    fechar();

  } catch (error) {
    console.error(error);
    alert("Erro ao atualizar usuário.");
  }
}

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Editar Usuário</h2>

        {/* Barra de Progresso */}
        <div className={styles.progresso}>
          <span className={etapa === 1 ? styles.ativo : ""}>Dados</span>
          <span className={etapa === 2 ? styles.ativo : ""}>Contato</span>
          <span className={etapa === 3 ? styles.ativo : ""}>Endereço</span>
          <span className={etapa === 4 ? styles.ativo : ""}>Confirmar</span>
        </div>

        {/* Etapa 1: Dados */}
        {etapa === 1 && (
          <section className={styles.section}>
            <h3>Dados Pessoais</h3>
            <label>Nome</label>
            <input name="nome" value={form.nome} onChange={alterarCampo} />

            <label>Email</label>
            <input name="email" value={form.email} onChange={alterarCampo} />

            <label>CPF</label>
            <input name="cpf" value={form.cpf} onChange={alterarCampo} />

            <label>Tipo</label>
            <select name="tipousuario" value={form.tipousuario} onChange={alterarCampo}>
              <option value="aluno-paciente">Aluno-paciente</option>
              <option value="treinador">Treinador</option>
              <option value="psicologo">Psicólogo</option>
              <option value="fisioterapeuta">Fisioterapeuta</option>
            </select>
          </section>
        )}

        {etapa === 2 && (
          <section className={styles.section}>
            <h3>Contato</h3>
            <label>Telefone</label>
            <input name="telefone" value={form.telefone} onChange={alterarCampo} />
          </section>
        )}

        {etapa === 3 && (
          <section className={styles.section}>
            <h3>Endereço</h3>
            <div className={styles.grid}>
              <div>
                <label>CEP</label>
                <input name="cep" value={form.cep} onChange={alterarCampo} />
              </div>
              <div>
                <label>Estado</label>
                <input name="estado" value={form.estado} onChange={alterarCampo} />
              </div>
              <div>
                <label>Cidade</label>
                <input name="cidade" value={form.cidade} onChange={alterarCampo} />
              </div>
              <div>
                <label>Bairro</label>
                <input name="bairro" value={form.bairro} onChange={alterarCampo} />
              </div>
              <div>
                <label>Rua</label>
                <input name="rua" value={form.rua} onChange={alterarCampo} />
              </div>
              <div>
                <label>Número</label>
                <input name="numero" value={form.numero} onChange={alterarCampo} />
              </div>
            </div>
          </section>
        )}

        {/* Etapa 4: Confirmar */}
        {etapa === 4 && (
          <section className={styles.section}>
            <h3>Confirmar Alterações</h3>
            <p>Confira se todos os dados do formulário estão corretos antes de salvar.</p>
            <ul>
              <li><strong>Nome:</strong> {form.nome}</li>
              <li><strong>Email:</strong> {form.email}</li>
              <li><strong>Cidade/UF:</strong> {form.cidade} - {form.estado}</li>
            </ul>
          </section>
        )}

        {/* Rodapé de Ações */}
        <div className={styles.footer}>
          <button
            className={styles.cancelar}
            onClick={etapa === 1 ? fechar : etapaAnterior}
          >
            {etapa === 1 ? "Cancelar" : "← Anterior"}
          </button>

          {etapa < 4 ? (
            <button className={styles.salvar} onClick={proximaEtapa}>
              Próximo →
            </button>
          ) : (
            <button className={styles.salvarPronto} onClick={finalizarEdicao}>
              Salvar Alterações ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
