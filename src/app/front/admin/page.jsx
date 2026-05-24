"use client";

import { useEffect, useState } from "react";
import Header from "../header/header";
import styles from "./prinicipalBloc.module.css";
import Busca from "../barraDeBusca/busca";
import { Trash2 } from "@deemlol/next-icons";
import { Edit } from "@deemlol/next-icons";
import { UserPlus } from "@deemlol/next-icons"

export default function Front() {
  const [inputBusca, setInputBusca] = useState("");
  const [busca, setBusca] = useState("");

  return (
    <div className={styles.container}>
      <Header />
      <NovoUsuario />
      <Busca busca={inputBusca} setBusca={setInputBusca} onBuscar={setBusca} />


      <div className={styles.principalBloc}>
        <Formulario />
        <Usuarios filtro={busca} />
      </div>
    </div>
  );
}

export function NovoUsuario() {
  return (
    <div className={styles.novoUsuario}>
      <UserPlus size={30} />
      <div className={styles.blocoTexto}>
        <h1 className={styles.titulo}>Novo Usuário</h1>
        <h1>Preencha os dados abaixo</h1>
      </div>
    </div>
  );
}

export function Formulario() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipo, setTipo] = useState("aluno-paciente");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!nome || !email || !cpf || !endereco || !telefone || !tipo) {
      alert("Preencha todos os campos");
      return;
    }

    const result = await fetch("http://localhost:3000/api/Usuario", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", //indicar para a api que o corpo da requisição é um JSON
      },
      body: JSON.stringify({
        nome: nome,
        email: email,
        cpf: cpf,
        endereco: endereco,
        telefone: telefone,
        tipoUsuario: tipo,
      }),
    });

    if (result.ok) {
      //ok vem como resposta de todo fetch.
      alert("Usuário cadastrado com sucesso!");
      setNome("");
      setEmail("");
      setCpf("");
      setEndereco("");
      setTelefone("");
      setTipo("aluno-paciente");
    } else {
      alert("Erro ao cadastrar usuário");
    }
  }

  return (
    <div className={styles.formulario}>
        <form
          action=""
          onSubmit={(e) => {
            handleSubmit(e);
          }}
        >
          <div className={styles.camposInput}>
            <label htmlFor="nome">Tipo: </label>
            <select
              className={styles.input}
              name="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >
              <option value="aluno-paciente">Aluno-paciente</option>
              <option value="treinador">Treinador</option>
              <option value="psicologo">Psicólogo</option>
              <option value="fisioterapeuta">Fisioterapeuta</option>
            </select>
          </div>
          <div className={styles.camposInput}>
            <label htmlFor="nome">nome: </label>
            <input
              className={styles.input}
              name="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <div className={styles.camposInput}>
            <label htmlFor="email">email: </label>
            <input
              className={styles.input}
              name="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className={styles.camposInput}>
            <label htmlFor="cpf">cpf: </label>
            <input
              className={styles.input}
              name="cpf"
              type="text"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
            />
          </div>
          <div className={styles.camposInput}>
            <label htmlFor="endereco">endereço: </label>
            <input
              className={styles.input}
              name="endereco"
              type="text"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
            />
          </div>
          <div className={styles.camposInput}></div>
          <div className={styles.camposInput}>
            <label htmlFor="telefone">telefone: </label>
            <input
              className={styles.input}
              name="telefone"
              type="text"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
          </div>
          <button type="submit" className={styles.button}>
            Enviar
          </button>
        </form>
    </div>
  );
}

export function Usuarios({ filtro }) {
  const [data, setdata] = useState([]);

  const pegarUsers = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/Usuario");
      const dataUser = await response.json();

      setdata(dataUser);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    }
  };
  useEffect(() => {
    pegarUsers();
  }, []); //[] = toda vez que a tela carregar

  const usuariosFiltrados = data.filter(
    (item) =>
      item.nome.toLowerCase().includes(filtro.toLowerCase()) ||
      item.email.toLowerCase().includes(filtro.toLowerCase()) ||
      (item.tipousuario || "") //mudar depois no banco, pois esqueci de criar como not null
        .toLowerCase()
        .includes(filtro.toLowerCase()),
  );

  return (
    <div className={styles.containerUsers}>
      <h1>Usuários Cadastrados</h1>

      <div className={styles.scrollUsers}>
        {usuariosFiltrados.map((item) => (
          <div key={item.codusuario} className={styles.users}>

            <div className={styles.topoCard}>
              <p>{item.tipousuario}</p>
            </div>
            <h1>{item.nome}</h1>
            <h1>{item.email}</h1>

            <div className={styles.areaButtons}>
              <button
                className={styles.editButton}
                onClick={() => editarUsuario(item)}
              >
                <Edit size={20} />
              </button>

              <button
                className={styles.deleteButton}
                onClick={() => deletarUsuario(item.codusuario)}
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

async function deletarUsuario(codusuario) {
  const result = await fetch(
    `http://localhost:3000/api/Usuario?CodUsuario=${codusuario}`,
    {
      method: "DELETE",
    },
  );

  if (result.ok) {
    alert("Usuário deletado!");
  }
}

async function editarUsuario(usuario) { //aqui só tem a opção de editar o nome, mas depois pode ser expandida para os outros campos
  const novoNome = prompt("Digite o novo nome:", usuario.nome);

  if (!novoNome) return;

  const result = await fetch("http://localhost:3000/api/Usuario", {
    method: "PUT",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      codusuario: usuario.codusuario,
      nome: novoNome,
    }),
  });

  if (result.ok) {
    alert("Usuário atualizado!"); //adicionar modal depois

    pegarUsers();
  }
}
}
