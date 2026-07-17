"use client";

import styles from './logProf.module.css';
import {useRouter} from 'next/navigation';

export default function LogProf() {
    const router = useRouter();
    const handleLogin = (e) => {
    e.preventDefault(); 
        
        router.push('./psicologa'); 
    };
    return (

        <div className={styles.pai}>
            <div className={styles.lateral}>
                <h1>Raggio Academia</h1>
            </div>
        
        <div className={styles.container}>
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQxDPWcwbEMcz9paPMNT0RtHzC02GWB63o_w&s" alt="Profissional" className={styles.image}/>
            <h1>Entrar como Profissional</h1>
            <p className={styles.subtitle}>Use os dados enviados pela academia</p>
            <form onSubmit={handleLogin} className={styles.form}>
                <p className={styles.textInput}>Login</p>
                <input type="email" name="email" placeholder="joao@example.com" required className={styles.input}/>
                <p className={styles.textInput}>Senha</p>
                <input type="password" name="password" placeholder="suasenha" required className={styles.input}/>
                <button type="submit" className={styles.button}>Entrar</button>
            </form>
            <p className={styles.subtitle}>Esqueceu a senha? <a href="/forgot-password">Clique aqui</a></p>
            <p className={styles.aviso}><strong>Primeiro acesso?</strong> Seus dados de login são enviados pela administração da academia.</p>
        </div>
        </div>
    )
}