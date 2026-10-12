"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./sidebar.module.css";

/* ---------- Ícones (SVG inline, sem depender de biblioteca) ---------- */

const ICONES = {
  home: (
    <>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </>
  ),
  pessoas: (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  calendario: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </>
  ),
  diario: (
    <>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </>
  ),
  ajustes: (
    <>
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </>
  ),
  generico: <circle cx="12" cy="12" r="4" />,
};

// Ícone escolhido pelo RÓTULO do item (funciona para todos os perfis do profiles.js,
// mesmo com rotas diferentes como /pacientesTreinador e /paciFisio).
const ICONE_POR_ROTULO = [
  [/vis[ãa]o geral/i, "home"],
  [/paciente|aluno/i, "pessoas"],
  [/calend[áa]rio/i, "calendario"],
  [/di[áa]rio/i, "diario"],
  [/configura/i, "ajustes"],
];

// Páginas de lista de pacientes de cada perfil; o prontuário (/prontuario/100)
// faz o item "Pacientes" do perfil acender.
const PAGINAS_PACIENTES = ["pacientes", "pacientesTreinador", "paciFisio"];

function ultimoTrecho(caminho) {
  return (
    String(caminho || "")
      .split("?")[0]
      .split("/")
      .filter(Boolean)
      .pop() || ""
  );
}

function escolherIcone(item) {
  const achado = ICONE_POR_ROTULO.find(([regex]) => regex.test(item.label || ""));
  return achado ? achado[1] : "generico";
}

function Icone({ nome }) {
  return (
    <svg
      className={styles.icone}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONES[nome] || ICONES.generico}
    </svg>
  );
}

/* ---------- Componente ---------- */

export default function Sidebar({ profile }) {
  const pathname = usePathname() || "";
  const avatarSrc = profile?.avatarSrc;
  const items = profile?.items || [];

  const trechosAtuais = pathname.split("/").filter(Boolean);
  // Telas "filhas" de um paciente (prontuário e treino) acendem o item Pacientes.
  // Se a sua rota de treino tiver outro nome, acrescente aqui.
  const noProntuario = ["prontuario", "treino", "treinos"].some((t) =>
    trechosAtuais.includes(t),
  );

  function estaAtivo(item) {
    const trecho = ultimoTrecho(item.href);
    if (trecho === "") return false;

    return (
      trechosAtuais.includes(trecho) ||
      (noProntuario && PAGINAS_PACIENTES.includes(trecho))
    );
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <img
          src={avatarSrc}
          alt="Logo Raggio Academia"
          className={styles.image}
          width={44}
          height={44}
        />

        <div className={styles.logoText}>
          <p className={styles.marca}>Raggio Academia</p>
          <p className={styles.submarca}>Studio ClinFit</p>
        </div>
      </div>

      <nav className={styles.nav} aria-label="Navegação principal">
        {items.map((item) => {
          const ativo = estaAtivo(item);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              aria-current={ativo ? "page" : undefined}
              className={`${styles.menuItem} ${ativo ? styles.ativo : ""}`}
            >
              <Icone nome={escolherIcone(item)} />
              <span className={styles.label}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}