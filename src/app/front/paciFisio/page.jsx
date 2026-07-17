"use client";

import { useState, useEffect } from "react";
import Top from "../top/top";
import Sidebar from "../sidebar/sidebar";
import Busca from "../barraDeBusca/busca";
import styles from "../pacientes/pacientes.module.css"; 
import { useRouter } from "next/navigation";
import { profiles } from "../sidebar/profiles";

export default function Treinos() {
  const [data, setData] = useState([]);
  const router = useRouter();
  const [inputBusca, setInputBusca] = useState("");
  const [busca, setBusca] = useState("");

  const pegarPacientes = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/Aluno_Paciente");
      const dataPacientes = await response.json();

      setData(dataPacientes.pacientes);
    } catch (error) {
      console.log("Erro ao mostrar pacientes:", error);
    }
  };

  useEffect(() => {
    pegarPacientes();
  }, []);

  const pacientesFiltrados = data.filter(
    (paci) =>
      paci.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      paci.cpf?.includes(busca) ||
      String(paci.codusuario).includes(busca)
  );

  return (
    <div className={styles.dashboardLayout}>
      <Sidebar profile={profiles.treinador} />

      <div className={styles.conteudoPrincipal}>
        <Top />

        <div className={styles.container}>
          <div className={styles.headerPacientes}>
            <div>
              <h2>Treinos</h2>

              <p className={styles.contadorPacientes}>
                {pacientesFiltrados.length}{" "}
                {pacientesFiltrados.length === 1
                  ? "paciente encontrado"
                  : "pacientes encontrados"}
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
                  <th>Paciente</th>
                  <th>CPF</th>
                  <th>Código</th>
                </tr>
              </thead>

              <tbody>
                {pacientesFiltrados.map((paci, index) => (
                  <tr
                    key={paci.codusuario || index}
                    onClick={() =>
                      router.push(`/front/protocolos/${paci.codusuario}`)
                    }
                  >
                    <td>
                      <div className={styles.colunaPaciente}>
                        <img
                          src="https://img.magnific.com/premium-vector/man-avatar-profile-picture-isolated-background-avatar-profile-picture-man_1293239-4841.jpg?semt=ais_hybrid&w=740&q=80"
                          alt={paci.nome}
                        />

                        <div className={styles.infoPaciente}>
                          <span className={styles.nomePaciente}>
                            {paci.nome}
                          </span>

                          <span className={styles.detalhesPaciente}>
                            Aluno-Paciente
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>{paci.cpf}</td>

                    <td>
                      <div className={styles.sessaoData}>
                        {paci.codusuario}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>
      </div>
    </div>
  );
}