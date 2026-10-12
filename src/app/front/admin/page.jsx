"use client";

import Modal from "./modal";
import { useEffect, useState } from "react";
import Header from "../header/header";
import styles from "./prinicipalBloc.module.css";
import Busca from "../barraDeBusca/busca";
import { Trash2, Edit, UserPlus } from "@deemlol/next-icons";

const ROTULOS_TIPO = {
  "aluno-paciente": "Aluno-paciente",
  treinador: "Treinador",
  psicologo: "Psicólogo",
  fisioterapeuta: "Fisioterapeuta",
};

// Registro profissional exigido por tipo de usuário
const REGISTROS = {
  treinador: "CREF",
  psicologo: "CRP",
  fisioterapeuta: "CREFITO",
};

const somenteDigitos = (valor) => valor.replace(/\D/g, "");

function mascaraCpf(valor) {
  return somenteDigitos(valor)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function mascaraCep(valor) {
  return somenteDigitos(valor)
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function mascaraTelefone(valor) {
  const d = somenteDigitos(valor).slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export default function Front() {
  const [inputBusca, setInputBusca] = useState("");
  const [busca, setBusca] = useState("");

  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.principalBloc}>
        <section className={styles.colunaFormulario}>
          <NovoUsuario />
          <Formulario />
        </section>

        <section className={styles.colunaUsuarios}>
          <Usuarios
            filtro={busca}
            busca={
              <div className={styles.buscaWrap}>
                <Busca
                  busca={inputBusca}
                  setBusca={setInputBusca}
                  onBuscar={setBusca}
                />
              </div>
            }
          />
        </section>
      </main>
    </div>
  );
}

export function NovoUsuario() {
  return (
    <div className={styles.cabecalho}>
      <div className={styles.iconeCabecalho}>
        <UserPlus size={24} />
      </div>
      <div>
        <h2 className={styles.titulo}>Novo usuário</h2>
        <p className={styles.subtitulo}>Preencha os dados abaixo</p>
      </div>
    </div>
  );
}

function Campo({ id, label, span = "span12", children }) {
  return (
    <div className={`${styles.campo} ${styles[span]}`}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function Formulario() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [cep, setCep] = useState("");
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipo, setTipo] = useState("aluno-paciente");
  // Um único campo para CREF / CRP / CREFITO (o rótulo muda conforme o tipo)
  const [registro, setRegistro] = useState("");

  const [mensagem, setMensagem] = useState(null); // { tipo: "erro" | "sucesso", texto }
  const [enviando, setEnviando] = useState(false);

  const rotuloRegistro = REGISTROS[tipo];

  async function handleSubmit(event) {
    event.preventDefault();
    setMensagem(null);

    if (
      !nome ||
      !email ||
      !cpf ||
      !cep ||
      !estado ||
      !cidade ||
      !bairro ||
      !rua ||
      !numero ||
      !telefone ||
      !tipo
    ) {
      setMensagem({
        tipo: "erro",
        texto: "Preencha todos os campos antes de cadastrar.",
      });
      return;
    }

    setEnviando(true);

    try {
      const result = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_API}/api/Usuario`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // indica à API que o corpo é JSON
          },
          body: JSON.stringify({
            nome: nome,
            email: email,
            cpf: somenteDigitos(cpf),
            cep: somenteDigitos(cep),
            estado: estado,
            cidade: cidade,
            bairro: bairro,
            rua: rua,
            numero: numero,
            telefone: telefone,
            tipousuario: tipo,
          }),
        },
      );

      if (result.ok) {
        setMensagem({
          tipo: "sucesso",
          texto: "Usuário cadastrado com sucesso.",
        });
        setNome("");
        setEmail("");
        setCpf("");
        setCep("");
        setEstado("");
        setCidade("");
        setBairro("");
        setRua("");
        setNumero("");
        setTelefone("");
        setRegistro("");
        setTipo("aluno-paciente");
      } else {
        setMensagem({
          tipo: "erro",
          texto: "Não foi possível cadastrar o usuário. Tente novamente.",
        });
      }
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
      setMensagem({
        tipo: "erro",
        texto: "Sem conexão com o servidor. Verifique sua internet.",
      });
    } finally {
      setEnviando(false);
    }
  }

  async function buscarCep(cepLimpo) {
    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`,
      );
      const dados = await response.json();

      if (dados.erro) {
        setMensagem({ tipo: "erro", texto: "CEP não encontrado." });
        return;
      }

      setMensagem(null);
      setCep(mascaraCep(cepLimpo));
      setEstado(dados.uf);
      setCidade(dados.localidade);
      setBairro(dados.bairro);
      setRua(dados.logradouro);
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  }

  return (
    <form className={styles.formulario} onSubmit={handleSubmit}>
      <div className={styles.grade}>
        <h3 className={styles.secao}>Dados pessoais</h3>

        <Campo
          id="tipo"
          label="Tipo de usuário"
          span={rotuloRegistro ? "span6" : "span12"}
        >
          <select
            id="tipo"
            className={styles.input}
            name="tipo"
            value={tipo}
            onChange={(e) => {
              setTipo(e.target.value);
              setRegistro("");
            }}
          >
            {Object.entries(ROTULOS_TIPO).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </select>
        </Campo>

        {rotuloRegistro && (
          <Campo id="registro" label={rotuloRegistro} span="span6">
            <input
              id="registro"
              className={styles.input}
              name="registro"
              type="text"
              value={registro}
              onChange={(e) => setRegistro(e.target.value)}
            />
          </Campo>
        )}

        <Campo id="nome" label="Nome completo">
          <input
            id="nome"
            className={styles.input}
            name="nome"
            type="text"
            autoComplete="off"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </Campo>

        <Campo id="email" label="E-mail">
          <input
            id="email"
            className={styles.input}
            name="email"
            type="email"
            placeholder="nome@exemplo.com"
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Campo>

        <Campo id="cpf" label="CPF" span="span6">
          <input
            id="cpf"
            className={styles.input}
            name="cpf"
            type="text"
            inputMode="numeric"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => setCpf(mascaraCpf(e.target.value))}
          />
        </Campo>

        <Campo id="telefone" label="Telefone" span="span6">
          <input
            id="telefone"
            className={styles.input}
            name="telefone"
            type="tel"
            inputMode="tel"
            placeholder="(00) 00000-0000"
            value={telefone}
            onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
          />
        </Campo>

        <h3 className={styles.secao}>Endereço</h3>

        <Campo id="cep" label="CEP" span="span4">
          <input
            id="cep"
            className={styles.input}
            name="cep"
            type="text"
            inputMode="numeric"
            placeholder="00000-000"
            value={cep}
            onChange={(e) => {
              const valor = mascaraCep(e.target.value);
              setCep(valor);

              const cepLimpo = somenteDigitos(valor);
              if (cepLimpo.length === 8) {
                buscarCep(cepLimpo);
              }
            }}
          />
        </Campo>

        <Campo id="estado" label="UF" span="span3">
          <input
            id="estado"
            className={styles.input}
            name="estado"
            type="text"
            maxLength={2}
            value={estado}
            onChange={(e) => setEstado(e.target.value.toUpperCase())}
          />
        </Campo>

        <Campo id="cidade" label="Cidade" span="span5">
          <input
            id="cidade"
            className={styles.input}
            name="cidade"
            type="text"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
          />
        </Campo>

        <Campo id="rua" label="Rua" span="span8">
          <input
            id="rua"
            className={styles.input}
            name="rua"
            type="text"
            value={rua}
            onChange={(e) => setRua(e.target.value)}
          />
        </Campo>

        <Campo id="numero" label="Número" span="span4">
          <input
            id="numero"
            className={styles.input}
            name="numero"
            type="text"
            inputMode="numeric"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
          />
        </Campo>

        <Campo id="bairro" label="Bairro">
          <input
            id="bairro"
            className={styles.input}
            name="bairro"
            type="text"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
          />
        </Campo>
      </div>

      <div className={styles.rodapeFormulario}>
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

        <button type="submit" className={styles.button} disabled={enviando}>
          {enviando ? "Cadastrando..." : "Cadastrar usuário"}
        </button>
      </div>
    </form>
  );
}

export function Usuarios({ filtro, busca }) {
  const [data, setdata] = useState([]);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [aviso, setAviso] = useState(null);

  const pegarUsers = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_API}/api/Usuario`,
      );
      const dataUser = await response.json();

      setdata(Array.isArray(dataUser) ? dataUser : []);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    }
  };

  useEffect(() => {
    pegarUsers();
  }, []); // [] = executa quando a tela carrega

  const termo = filtro.toLowerCase();

  const usuariosFiltrados = data.filter(
    (item) =>
      (item.nome || "").toLowerCase().includes(termo) ||
      (item.email || "").toLowerCase().includes(termo) ||
      (item.tipousuario || "")
        .toLowerCase()
        .includes(termo),
  );

  async function deletarUsuario(item) {
    const confirmou = window.confirm(
      `Excluir ${item.nome}? Esta ação não pode ser desfeita.`,
    );
    if (!confirmou) return;

    setAviso(null);

    const result = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_API}/api/Usuario?CodUsuario=${item.codusuario}`,
      {
        method: "DELETE",
      },
    );

    if (result.ok) {
      pegarUsers();
    } else {
      setAviso("Não foi possível excluir o usuário. Tente novamente.");
    }
  }

  return (
    <>
      <div className={styles.cabecalho}>
        <div>
          <h2 className={styles.titulo}>Usuários cadastrados</h2>
          <p className={styles.subtitulo}>
            Busque por nome, e-mail ou tipo de usuário
          </p>
        </div>
      </div>

      {busca}

      <p className={styles.contagem}>
        {usuariosFiltrados.length === 1
          ? "1 usuário encontrado"
          : `${usuariosFiltrados.length} usuários encontrados`}
      </p>

      {aviso && (
        <p
          role="alert"
          className={`${styles.mensagem} ${styles.mensagemErro}`}
          style={{ marginBottom: 12 }}
        >
          {aviso}
        </p>
      )}

      <div className={styles.scrollUsers}>
        {usuariosFiltrados.length === 0 && (
          <p className={styles.vazio}>
            Nenhum usuário encontrado. Tente outro termo de busca.
          </p>
        )}

        {usuariosFiltrados.map((item) => (
          <div key={item.codusuario} className={styles.users}>
            <div className={styles.avatar} aria-hidden="true">
              {(item.nome || "?").charAt(0).toUpperCase()}
            </div>

            <div className={styles.info}>
              <h3 className={styles.nome}>{item.nome}</h3>
              <p className={styles.email}>{item.email}</p>
            </div>

            <div className={styles.lateral}>
              <span className={styles.topoCard}>
                {ROTULOS_TIPO[item.tipousuario] || item.tipousuario || "Sem tipo"}
              </span>

              <div className={styles.areaButtons}>
                <button
                  type="button"
                  className={styles.editButton}
                  onClick={() => setUsuarioEditando(item)}
                  aria-label={`Editar ${item.nome}`}
                  title="Editar"
                >
                  <Edit size={20} />
                </button>

                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => deletarUsuario(item)}
                  aria-label={`Excluir ${item.nome}`}
                  title="Excluir"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        usuario={usuarioEditando}
        fechar={() => setUsuarioEditando(null)}
        atualizar={pegarUsers}
      />
    </>
  );
}