import styles from "./busca.module.css";

export default function Busca({
    busca,
    setBusca
}) {
    return (
        <div className={styles.barraBusca}>
            <input
                type="text"
                placeholder="Buscar usuário..."
                className={styles.inputBusca}
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
            />
        </div>
    );
}