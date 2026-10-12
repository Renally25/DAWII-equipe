"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "../sidebar/sidebar";
import { profiles } from "../sidebar/profiles";
import Top from "../top/top";
import styles from "./config.module.css";

function mascaraTelefone(valor) {
  const d = String(valor).replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export default function TelaConfig() {
  const { data: session, status } = useSession();

  const inputFotoRef = useRef(null);

  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState("");

  const [alterado, setAlterado] = useState(false); // habilita o botão Salvar
  const [salvando, setSalvando] = useState(false);
  const [enviandoSenha, setEnviandoSenha] = useState(false);
  const [mensagem, setMensagem] = useState(null); // { tipo: "erro" | "sucesso", texto }

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
        `${process.env.NEXT_PUBLIC_AUTH_API}/api/Usuario/${codusuario}`,
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
    } catch (error) {
      console.error(error);
    }
  }

  function handleFotoChange(e) {
    const arquivo = e.target.files?.[0];

    if (!arquivo) return;

    // Verifica se é imagem
    if (!arquivo.type.startsWith("image/")) {
      setMensagem({ tipo: "erro", texto: "Selecione uma imagem válida." });
      return;
    }

    // Limite de 5 MB
    if (arquivo.size > 5 * 1024 * 1024) {
      setMensagem({
        tipo: "erro",
        texto: "A imagem deve ter no máximo 5 MB.",
      });
      return;
    }

    setMensagem(null);

    // Guarda o arquivo REAL
    setFoto(arquivo);
    setAlterado(true);

    // Cria apenas o preview
    const url = URL.createObjectURL(arquivo);
    setFotoPreview(url);
  }

  async function atualizarInformacoes() {
    setMensagem(null);
    setSalvando(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_API}/api/Usuario`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
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
          },
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

        // O componente Top escuta este evento para atualizar o avatar do topo
        window.dispatchEvent(new Event("foto-atualizada"));
      }

      setAlterado(false);
      setMensagem({
        tipo: "sucesso",
        texto: "Informações atualizadas com sucesso.",
      });
    } catch (error) {
      console.error(error);
      setMensagem({
        tipo: "erro",
        texto: "Não foi possível atualizar as informações. Tente novamente.",
      });
    } finally {
      setSalvando(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setAlterado(true);
    setMensagem(null);

    setData((prev) => ({
      ...prev,
      [name]: name === "telefone" ? mascaraTelefone(value) : value,
    }));
  }

  const profissao = data.tipousuario;

  const alterarSenha = async () => {
    setMensagem(null);

    if (!data.email) {
      setMensagem({ tipo: "erro", texto: "Digite seu e-mail primeiro." });
      return;
    }

    setEnviandoSenha(true);

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
            email: data.email,
          }),
        },
      );

      const resultado = await response.json();

      if (!response.ok) {
        setMensagem({
          tipo: "erro",
          texto: resultado.error || "Não foi possível enviar o e-mail.",
        });
        return;
      }

      setMensagem({
        tipo: "sucesso",
        texto: "Enviamos um link de redefinição para o seu e-mail.",
      });
    } catch (error) {
      console.error(error);
      setMensagem({
        tipo: "erro",
        texto: "Erro ao conectar com o servidor.",
      });
    } finally {
      setEnviandoSenha(false);
    }
  };

  return (
    <div className={styles.dashboard}>
      <Sidebar profile={profiles[profissao]} />

      <div className={styles.container}>
        <Top />

        <form
          className={styles.main}
          onSubmit={(e) => {
            e.preventDefault();
            atualizarInformacoes();
          }}
        >

          <section className={styles.card}>
            <h2 className={styles.cardTitulo}>Foto de perfil</h2>

            <div className={styles.fotoElements}>
              <img
                className={styles.avatarGrande}
                src={fotoPreview || "/noprofile.svg"}
                alt={`Foto de perfil de ${data.nome || "usuário"}`}
              />

              <input
                type="file"
                id="fotoPerfil"
                ref={inputFotoRef}
                accept="image/*"
                hidden
                onChange={handleFotoChange}
              />

              <div className={styles.fotoText}>
                <p className={styles.nomeUsuario}>{data.nome || "Usuário"}</p>
                <p className={styles.dicaFoto}>Imagem de até 5 MB.</p>

                <button
                  type="button"
                  className={styles.botaoSecundario}
                  onClick={() => inputFotoRef.current?.click()}
                >
                  Alterar foto
                </button>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitulo}>Dados pessoais e profissionais</h2>

            <div className={styles.formGrid}>
              <div className={styles.camposInput}>
                <label htmlFor="nome">Nome completo</label>

                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={data.nome}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.camposInput}>
                <label htmlFor="email">E-mail</label>

                <input
                  type="email"
                  id="email"
                  name="email"
                  value={data.email}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.camposInput}>
                <label htmlFor="telefone">Telefone</label>

                <input
                  type="tel"
                  id="telefone"
                  name="telefone"
                  inputMode="tel"
                  placeholder="(00) 00000-0000"
                  value={data.telefone}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.camposInput}>
                <label htmlFor="endereco">Endereço</label>

                <input
                  type="text"
                  id="endereco"
                  name="endereco"
                  placeholder="Rua, número"
                  value={data.endereco}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.camposInput}>
                <label htmlFor="credencial">Credencial profissional</label>

                <input
                  type="text"
                  id="credencial"
                  name="credencial"
                  value={data.credencial}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitulo}>Senha</h2>
            <p className={styles.descricao}>
              Enviaremos um link de redefinição para o e-mail cadastrado.
            </p>

            <button
              type="button"
              className={styles.botaoSecundario}
              onClick={alterarSenha}
              disabled={enviandoSenha}
            >
              {enviandoSenha ? "Enviando..." : "Alterar senha"}
            </button>
          </section>

          <div className={styles.barraAcoes}>
            {mensagem && (
              <p
                role={mensagem.tipo === "erro" ? "alert" : "status"}
                className={`${styles.mensagem} ${
                  mensagem.tipo === "erro"
                    ? styles.mensagemErro
                    : styles.mensagemSucesso
                }`}
              >
                {mensagem.texto}
              </p>
            )}

            <button
              type="submit"
              className={styles.botaoPrimario}
              disabled={!alterado || salvando}
            >
              {salvando ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}