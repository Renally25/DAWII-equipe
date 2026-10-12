"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Top from "../top/top";
import Sidebar from "../sidebar/sidebar";
import Busca from "../barraDeBusca/busca";
import styles from "../pacientes/pacientes.module.css";
import { useRouter } from "next/navigation";
import { profiles } from "../sidebar/profiles";

function mascararCpf(cpf) {
  const digitos = String(cpf || "").replace(/\D/g, "");
  if (digitos.length !== 11) return cpf || "—";
  return `***.***.***-${digitos.slice(9)}`;
}

function Seta() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export default function Pacientes() {
  const [data, setData] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();
  const [inputBusca, setInputBusca] = useState("");
  const [busca, setBusca] = useState("");

  const pegarPacientes = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_API}/api/Aluno_Paciente`,
      );
      const dataPacientes = await response.json();

      setData(dataPacientes.pacientes || []);
    } catch (error) {
      console.log("Erro ao mostrar consultas:", error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    const carregar = async () => {
      await pegarPacientes();
    };
    carregar();
  }, []);

  const pacientesFiltrados = data.filter(
    (paci) =>
      paci.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      paci.cpf?.includes(busca) ||
      String(paci.codusuario).includes(busca),
  );

  return (
    <div className={styles.dashboardLayout}>
      <Sidebar profile={profiles.fisioterapeuta} />
      <div className={styles.conteudoPrincipal}>
        <Top />

        <main className={styles.container}>
          <div className={styles.headerPacientes}>
            <div>
              <h1 className={styles.titulo}>Pacientes</h1>
              <p className={styles.contadorPacientes} aria-live="polite">
                {carregando
                  ? "Carregando pacientes..."
                  : `${pacientesFiltrados.length} ${
                      pacientesFiltrados.length === 1
                        ? "paciente encontrado"
                        : "pacientes encontrados"
                    }`}
              </p>
            </div>
          </div>

          <Busca
            busca={inputBusca}
            setBusca={setInputBusca}
            onBuscar={setBusca}
          />

          <div className={styles.tabelaContainer}>
            <table className={styles.tabelaPacientes}>
              <thead>
                <tr>
                  <th scope="col">Paciente</th>
                  <th scope="col">CPF</th>
                  <th scope="col">Código</th>
                  <th scope="col" aria-label="Abrir Protocolo" />
                </tr>
              </thead>
              <tbody>
                {!carregando && pacientesFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={4} className={styles.vazio}>
                      Nenhum paciente encontrado. Tente outro nome, CPF ou
                      código.
                    </td>
                  </tr>
                )}

                {pacientesFiltrados.map((paci, index) => (
                  <tr
                    key={paci.codusuario || index}
                    className={styles.linha}
                    onClick={() =>
                      router.push(`./protocolos/${paci.codusuario}`)
                    }
                  >
                    <td>
                      <div className={styles.colunaPaciente}>
    
                        <div className={styles.avatar} aria-hidden="true">
                          {paci.fotoperfil ? (
                            <img src={paci.fotoperfil} alt="" />
                          ) : (
                            (paci.nome || "?").charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className={styles.infoPaciente}>
                          <Link
                            href={`./protocolos/${paci.codusuario}`}
                            className={styles.nomePaciente}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {paci.nome}
                          </Link>
                          <span className={styles.detalhesPaciente}>
                            Aluno-paciente
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className={styles.cpf}>{mascararCpf(paci.cpf)}</td>
                    <td>
                      <div className={styles.sessaoData}>{paci.codusuario}</div>
                    </td>
                    <td className={styles.colunaSeta}>
                      <Seta />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}