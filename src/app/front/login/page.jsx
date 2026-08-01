"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { signIn, getSession } from "next-auth/react";


export default function LoginPage() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
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

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}


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
              onChange={(e)=>setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>


          <div className={styles.camposInput}>
            <label htmlFor="senha" className={styles.label}>
              Senha
            </label>

            <input
              id="senha"
              className={styles.input}
              type="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e)=>setSenha(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>


          <button 
            type="submit"
            className={styles.button}
            disabled={isLoading}
          >
            {isLoading ? "Carregando..." : "Entrar"}
          </button>

        </form>

      </div>
    </div>
  );
}