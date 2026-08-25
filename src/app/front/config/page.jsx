"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "../sidebar/sidebar";
import { profiles } from "../sidebar/profiles";
import Top from "../top/top";
import styles from "./config.module.css";

export default function TelaConfig() {
  const { data: session, status } = useSession();

  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState("");

  const [data, setData] = useState({
    codusuario: "",
    nome: "",
    email: "",
    telefone: "",
    endereco: "",
    credencial: "",
    tipousuario: "",
    fotoperfil: "",
  });

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      mostrarInformacoes(session.user.id);
    }
  }, [status, session]);

  async function mostrarInformacoes(codusuario) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_API}/api/Usuario/${codusuario}`
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar informações.");
      }

      const usuario = await response.json();

      setData({
        codusuario: usuario.codusuario ?? "",
        nome: usuario.nome ?? "",
        email: usuario.email ?? "",
        telefone: usuario.telefone ?? "",
        endereco:
          usuario.rua && usuario.numero
            ? `${usuario.rua}, ${usuario.numero}`
            : (usuario.rua ?? ""),
        credencial: usuario.credencial ?? "",
        tipousuario: usuario.tipousuario ?? "",
        fotoperfil: usuario.fotoperfil ?? "",
      });

      // Foto que já está salva no banco
      if (usuario.fotoperfil) {
        setFotoPreview(usuario.fotoperfil);
      }

      console.log(usuario);
    } catch (error) {
      console.error(error);
    }
  }

  function handleFotoChange(e) {
    const arquivo = e.target.files?.[0];

    if (!arquivo) return;

    // Verifica se é imagem
    if (!arquivo.type.startsWith("image/")) {
      alert("Selecione uma imagem válida.");
      return;
    }

    // Limite de 5 MB
    if (arquivo.size > 5 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 5 MB.");
      return;
    }

    // Guarda o arquivo REAL
    setFoto(arquivo);

    // Cria apenas o preview
    const url = URL.createObjectURL(arquivo);
    setFotoPreview(url);
  }

  async function atualizarInformacoes() {
    try {

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_API}/api/Usuario`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao atualizar informações.");
      }

      if (foto) {
        const formData = new FormData();

        formData.append("codusuario", data.codusuario);
        formData.append("foto", foto);

        const fotoResponse = await fetch(
          `${process.env.NEXT_PUBLIC_AUTH_API}/api/Usuario`,
          {
            method: "PUT",
            body: formData,
          }
        );

        if (!fotoResponse.ok) {
          throw new Error("Erro ao atualizar foto.");
        }

        const fotoData = await fotoResponse.json();

        setData((prev) => ({
          ...prev,
          fotoperfil: fotoData.fotoperfil,
        }));

        setFoto(null);
      }

      alert("Informações atualizadas com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar informações.");
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const profissao = data.tipousuario;

  return (
    <div className={styles.dashboard}>
      <Sidebar profile={profiles[profissao]} />

      <div className={styles.container}>
        <Top />

        <div className={styles.main}>
          <div className={styles.header}>
            <h1>Configurações</h1>

            <button onClick={atualizarInformacoes}>
              Salvar Alterações
            </button>
          </div>

          <div className={styles.fotoPerfil}>
            <h1>Foto de Perfil</h1>

            <div className={styles.fotoElements}>
              <img
                src={fotoPreview || "/noprofile.svg"}
                alt="Foto de perfil"
              />

              <input
                type="file"
                id="fotoPerfil"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFotoChange}
              />

              <div className={styles.fotoText}>
                <h1>{data.nome || "Usuário"}</h1>

                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("fotoPerfil").click()
                  }
                >
                  Alterar foto
                </button>
              </div>
            </div>
          </div>

          <div className={styles.perfil}>
            <h1>Dados pessoais e profissionais</h1>

            <form>
              <div className={styles.camposInput}>
                <label htmlFor="nome">Nome Completo:</label>

                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={data.nome}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.camposInput}>
                <label htmlFor="email">Email:</label>

                <input
                  type="email"
                  id="email"
                  name="email"
                  value={data.email}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.camposInput}>
                <label htmlFor="telefone">Telefone:</label>

                <input
                  type="text"
                  id="telefone"
                  name="telefone"
                  value={data.telefone}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.camposInput}>
                <label htmlFor="endereco">Endereço:</label>

                <input
                  type="text"
                  id="endereco"
                  name="endereco"
                  value={data.endereco}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.camposInput}>
                <label htmlFor="credencial">Credencial:</label>

                <input
                  type="text"
                  id="credencial"
                  name="credencial"
                  value={data.credencial}
                  onChange={handleChange}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}