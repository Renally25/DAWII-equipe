"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { signIn, getSession } from "next-auth/react";
import { Eye, EyeOff } from "@deemlol/next-icons";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mensagemSenha, setMensagemSenha] = useState(null);
  const [enviandoRedefinicao, setEnviandoRedefinicao] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setError("");
    setMensagemSenha(null);

    const res = await signIn("credentials", {
      email,
      senha,
      redirect: false,
    });

    if (res?.error) {
      setError("Email ou senha inválidos");
      setIsLoading(false);
      return;
    }

    const session = await getSession();

    const tipo = session?.user?.tipousuario;

    if (session.user.eh_admin === true) {
  router.push("/front/admin");
    } else if (tipo === "psicologo") {
      router.push("/front/psicologa");
    } else if (tipo === "treinador") {
      router.push("/front/treinador");
    } else if (tipo === "fisioterapeuta") {
      router.push("/front/fisioterapeuta");
    } else {
      setError("Tipo de usuário não encontrado");
      setIsLoading(false);
    }
  };

  const solicitarRedefinicao = async () => {
    setError("");

    if (!email.trim()) {
      setMensagemSenha({
        tipo: "erro",
        texto: "Digite seu e-mail para receber o link de redefinição.",
      });
      return;
    }

    setEnviandoRedefinicao(true);
    setMensagemSenha(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_API}/api/Usuario`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            acao: "solicitarRedefinicao",
            email: email.trim(),
          }),
        },
      );

      const resultado = await response.json();

      if (!response.ok) {
        setMensagemSenha({
          tipo: "erro",
          texto: resultado.error || "Não foi possível enviar o e-mail.",
        });
        return;
      }

      setMensagemSenha({
        tipo: "sucesso",
        texto: "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.",
      });
    } catch (error) {
      console.error(error);
      setMensagemSenha({
        tipo: "erro",
        texto: "Erro ao conectar com o servidor. Tente novamente.",
      });
    } finally {
      setEnviandoRedefinicao(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logoWrapper}>
          <img src="/logo.png" alt="Raggio" className={styles.logo} />
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.camposInput}>
            <label htmlFor="login" className={styles.label}>
              Login
            </label>

            <input
              id="login"
              className={styles.input}
              type="text"
              placeholder="Digite seu usuário"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className={styles.camposInput}>
            <label htmlFor="senha" className={styles.label}>
              Senha
            </label>

            <div className={styles.senhaWrapper}>
              <input
                id="senha"
                className={styles.input}
                type={mostrarSenha ? "text" : "password"}
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                disabled={isLoading}
                required
              />

              <button
                type="button"
                className={styles.togglePass}
                onClick={() => setMostrarSenha(!mostrarSenha)}
                disabled={isLoading}
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {mostrarSenha ? (
                  <EyeOff size={16} color="#22202060" strokeWidth={1.5} />
                ) : (
                  <Eye size={16} color="#22202060" strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>

          <button
            type="button"
            className={styles.linkRedefinicao}
            onClick={solicitarRedefinicao}
            disabled={enviandoRedefinicao || isLoading}
          >
            {enviandoRedefinicao ? "Enviando..." : "Esqueceu a senha?"}
          </button>

          {mensagemSenha && (
            <div
              role={mensagemSenha.tipo === "erro" ? "alert" : "status"}
              className={
                mensagemSenha.tipo === "erro"
                  ? styles.errorMessage
                  : styles.successMessage
              }
            >
              {mensagemSenha.texto}
            </div>
          )}

          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? "Carregando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
