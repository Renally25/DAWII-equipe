"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function AlterarSenha() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mensagem, setMensagem] = useState("");

  const criarSenha = async (e) => {
    e.preventDefault();

    if (!token) {
      setMensagem("Link inválido.");
      return;
    }

    if (senha.length < 6) {
      setMensagem("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      setMensagem("As senhas não são iguais.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_API}/api/Usuario`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            acao: "redefinirSenha",
            token: token,
            senha: senha,
          }),
        }
      );

      const resultado = await response.json();

      if (!response.ok) {
        setMensagem(resultado.error || "Não foi possível alterar a senha.");
        return;
      }

      alert("Senha alterada com sucesso!");

      router.push("/login");
    } catch (error) {
      console.error(error);
      setMensagem("Erro ao conectar com o servidor.");
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.caixa}>
        <h1>Criar nova senha</h1>

        <p>
          Digite sua nova senha abaixo.
        </p>

        <form onSubmit={criarSenha} className={styles.form}>
          <label className={styles.label}>Nova senha</label>

          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Digite sua nova senha"
          />

          <label className={styles.label}>Confirmar senha</label>

          <input
            type="password"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            placeholder="Digite novamente sua senha"
            className={styles.input}
          />

          <button type="submit" className={styles.button}>
            Criar nova senha
          </button>
        </form>

        {mensagem && (
          <p className={styles.mensagem}>
            {mensagem}
          </p>
        )}
      </div>
    </main>
  );
}