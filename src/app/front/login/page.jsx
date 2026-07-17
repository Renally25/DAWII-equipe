"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Ignora a autenticação e entra direto no id 104 de teste
    router.push("/front/treino/104"); //trrocaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
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
            <label htmlFor="login" className={styles.label}>Login</label>
            <input
              id="login"
              className={styles.input}
              name="login"
              type="text"
              placeholder="Digite seu usuário"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className={styles.camposInput}>
            <label htmlFor="senha" className={styles.label}>Senha</label>
            <input
              id="senha"
              className={styles.input}
              name="senha"
              type="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? "Carregando..." : "Entrar de Teste"}
          </button>
        </form>
      </div>
    </div>
  );
}
