"use client";

import Modal from "./modal";
import { useEffect, useState } from "react";
import Header from "../header/header";
import styles from "./prinicipalBloc.module.css";
import Busca from "../barraDeBusca/busca";
import { Trash2 } from "@deemlol/next-icons";
import { Edit } from "@deemlol/next-icons";
import { UserPlus } from "@deemlol/next-icons";

export default function Front() {
  const [inputBusca, setInputBusca] = useState("");
  const [busca, setBusca] = useState("");

  return (
    <div className={styles.container}>
      <Header />

      <div className={styles.principalBloc}>
        <div className={styles.principalBloc}>
          <div className={styles.colunaFormulario}>
            <NovoUsuario />
            <Formulario />
          </div>

          <div className={styles.colunaUsuarios}>
            <Busca
              busca={inputBusca}
              setBusca={setInputBusca}
              onBuscar={setBusca}
            />
            <Usuarios filtro={busca} />
          </div>
        </div>
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
  const [cep, setCep] = useState("");
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipo, setTipo] = useState("aluno-paciente");
  const [crefito, setCrefito] = useState("");
  const [crp, setCrp] = useState("");
  const [cref, setCref] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
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
      alert("Preencha todos os campos");
      return;
    }

    const result = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_API}/api/Usuario`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json", //indicar para a api que o corpo da requisição é um JSON
        },
        body: JSON.stringify({
          nome: nome,
          email: email,
          cpf: cpf,
          cep: cep,
          estado: estado,
          cidade: cidade,
          bairro: bairro,
          rua: rua,
          numero: numero,
          telefone: telefone,
          tipoUsuario: tipo,
        }),
      },
    );

    if (result.ok) {
      //ok vem como resposta de todo fetch.
      alert("Usuário cadastrado com sucesso!");
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
      setTipo("aluno-paciente");
    } else {
      alert("Erro ao cadastrar usuário");
    }
  }

  async function buscarCep(cepDigitado) {
    const cepLimpo = cepDigitado.replace(/\D/g, "");

    if (cepLimpo.length !== 8) return;

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`,
      );

      const dados = await response.json();

      if (dados.erro) {
        alert("CEP não encontrado");
        return;
      }

      setCep(cepLimpo);
      setEstado(dados.uf);
      setCidade(dados.localidade);
      setBairro(dados.bairro);
      setRua(dados.logradouro);
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
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
          <label htmlFor="nome">Nome: </label>
          <input
            className={styles.input}
            name="nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>
        <div className={styles.camposInput}>
          <label htmlFor="email">Email: </label>
          <input
            className={styles.input}
            name="email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className={styles.camposInput}>
          <label htmlFor="cpf">CPF: </label>
          <input
            className={styles.input}
            name="cpf"
            type="text"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
          />
        </div>
        <div className={styles.camposInput}>
          <label htmlFor="cep">CEP: </label>
          <input
            className={styles.input}
            name="cep"
            type="text"
            value={cep}
            onChange={(e) => {
              const valor = e.target.value;

              setCep(valor);

              const cepLimpo = valor.replace(/\D/g, "");

              if (cepLimpo.length === 8) {
                buscarCep(cepLimpo);
              }
            }}
          />
        </div>
        <div className={styles.camposInput}>
          <label htmlFor="estado">Estado: </label>
          <input
            className={styles.input}
            name="estado"
            type="text"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          />
        </div>
        <div className={styles.camposInput}>
          <label htmlFor="cidade">Cidade: </label>
          <input
            className={styles.input}
            name="cidade"
            type="text"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
          />
        </div>
        <div className={styles.camposInput}>
          <label htmlFor="bairro">Bairro: </label>
          <input
            className={styles.input}
            name="bairro"
            type="text"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
          />
        </div>
        <div className={styles.camposInput}>
          <label htmlFor="rua">Rua: </label>
          <input
            className={styles.input}
            name="rua"
            type="text"
            value={rua}
            onChange={(e) => setRua(e.target.value)}
          />
        </div>
        <div className={styles.camposInput}>
          <label htmlFor="numero">Número: </label>
          <input
            className={styles.input}
            name="numero"
            type="text"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
          />
        </div>

        <div className={styles.camposInput}>
          <label htmlFor="telefone">Telefone: </label>
          <input
            className={styles.input}
            name="telefone"
            type="text"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />
        </div>

        {tipo === "treinador" && (
          <div className={styles.camposInput}>
            <label>CREF:</label>
            <input
              className={styles.input}
              type="text"
              value={cref}
              onChange={(e) => setCref(e.target.value)}
            />
          </div>
        )}

        {tipo === "psicologo" && (
          <div className={styles.camposInput}>
            <label>CRP:</label>
            <input
              className={styles.input}
              type="text"
              value={crp}
              onChange={(e) => setCrp(e.target.value)}
            />
          </div>
        )}

        {tipo === "fisioterapeuta" && (
          <div className={styles.camposInput}>
            <label>CREFITO:</label>
            <input
              className={styles.input}
              type="text"
              value={crefito}
              onChange={(e) => setCrefito(e.target.value)}
            />
          </div>
        )}

        <button type="submit" className={styles.button}>
          Enviar
        </button>
      </form>
    </div>
  );
}

export function Usuarios({ filtro }) {
  const [data, setdata] = useState([]);
  const [usuarioEditando, setUsuarioEditando] = useState(null);

  const pegarUsers = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_API}/api/Usuario`,
      );
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
                onClick={() => setUsuarioEditando(item)}
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
      <Modal
        usuario={usuarioEditando}
        fechar={() => setUsuarioEditando(null)}
        atualizar={pegarUsers}
      />
    </div>
  );

  async function deletarUsuario(codusuario) {
    const result = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_API}/api/Usuario?CodUsuario=${codusuario}`,
      {
        method: "DELETE",
      },
    );

    if (result.ok) {
      alert("Usuário deletado!");
      pegarUsers();
    }
  }
}
