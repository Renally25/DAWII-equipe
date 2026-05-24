import styles from "./busca.module.css";
import { Search } from "@deemlol/next-icons"

export default function Busca({
    busca,
    setBusca,
    onBuscar
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
            <button className={styles.buttonBusca} value={busca} onClick={() => onBuscar(busca)}
>
                <Search />
                
            </button>
        </div>
    );
}