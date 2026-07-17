import styles from "./busca.module.css";
import { Search } from "@deemlol/next-icons";

export default function Busca({ busca, setBusca, onBuscar, className }) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onBuscar();
    }
  };

  return (
    <div className={`${styles.barraBusca} ${className || ""}`}>
      <input
        type="text"
        placeholder="Buscar usuário..."
        className={styles.inputBusca}
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <button
        className={styles.buttonBusca}
        onClick={onBuscar}
      >
        <Search />
      </button>
    </div>
  );
}