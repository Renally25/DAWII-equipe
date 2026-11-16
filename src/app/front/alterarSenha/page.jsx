"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./page.module.css";

function AlterarSenhaForm() {
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
    <div className={styles.caixa}>
      <div className={styles.logoWrapper}>
        <img src="/logo.png" alt="Raggio" className={styles.logo} />
      </div>

      <div className={styles.cabecalho}>
        <span className={styles.etiqueta}>Segurança da conta</span>
        <h1>Criar nova senha</h1>
        <p>Escolha uma senha nova para voltar a acessar sua conta.</p>
      </div>

      <form onSubmit={criarSenha} className={styles.form}>
        <div className={styles.camposInput}>
          <label htmlFor="senha" className={styles.label}>Nova senha</label>

          <input
            id="senha"
            className={styles.input}
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Digite sua nova senha"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </div>

        <div className={styles.camposInput}>
          <label htmlFor="confirmarSenha" className={styles.label}>Confirmar senha</label>

          <input
            id="confirmarSenha"
            type="password"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            placeholder="Digite novamente sua senha"
            className={styles.input}
            autoComplete="new-password"
            minLength={6}
            required
          />
        </div>

        <button type="submit" className={styles.button}>
          Criar nova senha
        </button>
      </form>

      {mensagem && (
        <p className={styles.mensagem} role="alert">
          {mensagem}
        </p>
      )}
    </div>
  );
}

export default function AlterarSenha() {
  return (
    <main className={styles.container}>
      <Suspense
        fallback={
          <div className={styles.caixa}>
            <p className={styles.carregando}>Carregando formulário...</p>
          </div>
        }
      >
        <AlterarSenhaForm />
      </Suspense>
    </main>
  );
}
