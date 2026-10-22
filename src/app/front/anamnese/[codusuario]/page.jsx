"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Top from "../../top/top";
import Sidebar from "../../sidebar/sidebar";
import { profiles } from "../../sidebar/profiles";
import styles from "./anamnese.module.css";
import { useSession } from "next-auth/react";

const SECOES = [
  {
    titulo: "Medidas e atividade física",
    campos: [
      { label: "Peso (kg)", key: "peso" },
      { label: "Altura", key: "altura" },
      { label: "Atividade praticada", key: "atividade" },
      { label: "Já fez musculação antes?", key: "musculacao_antes", tipo: "bool" },
      { label: "Tempo de treino", key: "tempo_treino" },
      { label: "Fisicamente ativo?", key: "fisicamente_ativo", tipo: "bool" },
      { label: "Frequência", key: "frequencia" },
    ],
  },
  {
    titulo: "Saúde e exercício",
    campos: [
      { label: "Lesão por exercício?", key: "tem_lesao_exercicio", tipo: "bool", detalhe: "lesao_exercicio" },
      { label: "Já fez fisioterapia?", key: "fez_fisio", tipo: "bool", detalhe: "motivo_fez_fisio" },
      { label: "Dor durante o exercício?", key: "tem_dor_dur_exercicio", tipo: "bool", detalhe: "onde_dor_dur_exercicio" },
      { label: "Desvio postural?", key: "tem_desvio_post", tipo: "bool", detalhe: "desvio_post" },
      { label: "Limitação de força?", key: "tem_limit_forca", tipo: "bool", detalhe: "limit_forca" },
    ],
  },
  {
    titulo: "Histórico de saúde",
    campos: [
      { label: "Possui doença?", key: "tem_doenca", tipo: "bool", detalhe: "doenca" },
      { label: "Usa medicamento?", key: "usa_medicamento", tipo: "bool", detalhe: "medicamento" },
      { label: "Possui lesão?", key: "tem_lesao", tipo: "bool", detalhe: "lesao" },
      { label: "Possui restrição?", key: "tem_restricao", tipo: "bool", detalhe: "restricao" },
    ],
  },
  {
    titulo: "Saúde da mulher",
    campos: [
      { label: "Usa método contraceptivo?", key: "usa_metodo_contraceptivo", tipo: "bool", detalhe: "metodo_contraceptivo" },
      { label: "Ciclo menstrual", key: "ciclo_menstrual" },
      { label: "Tem TPM?", key: "tem_tpm", tipo: "bool", detalhe: "sintomas_tpm" },
      { label: "Disfunção do assoalho pélvico?", key: "tem_disfuncao_assoalho_pelvico", tipo: "bool", detalhe: "disfuncao_assoalho_pelvico" },
    ],
  },
  {
    titulo: "Saúde emocional",
    campos: [
      { label: "Dificuldade emocional?", key: "tem_dificul_emocional", tipo: "bool", detalhe: "dificul_emocional" },
      { label: "Atendimento psicológico?", key: "tem_atend_psico", tipo: "bool", detalhe: "tempo_atend_psico" },
    ],
  },
  {
    titulo: "Expectativas e objetivos",
    campos: [
      { label: "Expectativa", key: "expectativa", tipo: "longo" },
      { label: "Objetivo", key: "objetivo", tipo: "longo" },
      { label: "O que motivou", key: "o_que_motivou", tipo: "longo" },
      { label: "Comprometimento", key: "comprometimento" },
    ],
  },
];

const vazio = (v) => v === null || v === undefined || v === "";

const ETAPAS = ["fisicos", "fisioterapica", "motivacao", "mulher", "psicologica"];

function Campo({ campo, anamnese }) {
  const valor = anamnese[campo.key];
  const ocupaLinha = campo.tipo === "longo";

  return (
    <div className={`${styles.campo} ${ocupaLinha ? styles.campoLongo : ""}`}>
      <dt className={styles.rotulo}>{campo.label}</dt>
      <dd className={styles.valor}>
        {campo.tipo === "bool" ? (
          <>
            {typeof valor === "boolean" ? (
              <span className={valor ? styles.badgeSim : styles.badgeNao}>
                {valor ? "Sim" : "Não"}
              </span>
            ) : (
              "—"
            )}
            {valor && campo.detalhe && !vazio(anamnese[campo.detalhe]) && (
              <p className={styles.detalhe}>{anamnese[campo.detalhe]}</p>
            )}
          </>
        ) : vazio(valor) ? (
          "—"
        ) : (
          String(valor)
        )}
      </dd>
    </div>
  );
}

export default function Anamnese() {
  const { codusuario } = useParams();
  const router = useRouter();
  const [anamnese, setAnamnese] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const { data: session, status } = useSession();
  const tipoUsuario = session?.user?.tipousuario;

  useEffect(() => {
    const carregar = async () => {
      try {
        const respostas = await Promise.all(
          ETAPAS.map((etapa) =>
            fetch(
              `${process.env.NEXT_PUBLIC_AUTH_API}/api/Anamnese?codusuario=${codusuario}&etapa=${etapa}`,
            ),
          ),
        );

        if (respostas.every((r) => r.status === 404)) {
          setErro("Este paciente ainda não preencheu a anamnese.");
          return;
        }
        if (respostas.some((r) => !r.ok)) throw new Error("Falha na requisição");

        const partes = await Promise.all(respostas.map((r) => r.json()));
        setAnamnese(Object.assign({}, ...partes));
      } catch (error) {
        console.log("Erro ao carregar anamnese:", error);
        setErro("Não foi possível carregar a anamnese. Tente novamente.");
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, [codusuario]);

  return (
    <div className={styles.dashboardLayout}>
      <Sidebar profile={profiles[tipoUsuario]} />
      <div className={styles.conteudoPrincipal}>
        <Top />

        <main className={styles.container}>
          <button
            type="button"
            className={styles.voltar}
            onClick={() => router.back()}
          >
            ← Voltar
          </button>

          <div className={styles.header}>
            <h1 className={styles.titulo}>Anamnese</h1>
            <p className={styles.subtitulo} aria-live="polite">
              Paciente código {codusuario}
            </p>
          </div>

          {carregando && <p className={styles.mensagem}>Carregando anamnese...</p>}
          {!carregando && erro && <p className={styles.mensagem}>{erro}</p>}

          {anamnese &&
            SECOES.map((secao) => (
              <section key={secao.titulo} className={styles.card}>
                <h2 className={styles.tituloSecao}>{secao.titulo}</h2>
                <dl className={styles.grade}>
                  {secao.campos.map((campo) => (
                    <Campo key={campo.key} campo={campo} anamnese={anamnese} />
                  ))}
                </dl>
              </section>
            ))}

          {anamnese && (
            <p className={styles.lgpd}>
              Termo LGPD: {anamnese.aceitou_termo_lgpd ? "aceito pelo paciente" : "não aceito"}
            </p>
          )}
        </main>
      </div>
    </div>
  );
}