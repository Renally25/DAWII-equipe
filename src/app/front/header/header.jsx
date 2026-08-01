import styles from "./header.module.css"

export default function Header(){
    return (
        <header className={styles.header}>

            <div className={styles.componentesHeader}>
                <img  className={styles.img} src="/logo.png" alt="logo"/>          
                <div className={styles.blocotexto}>
                <h1>Página do administrador</h1>
            </div>
            </div>
        </header>
    )
}