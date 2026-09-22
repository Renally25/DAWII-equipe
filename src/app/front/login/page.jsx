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

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setError("");

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

    if (tipo === "psicologo") {
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

          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? "Carregando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
