import Link from "next/link";
import styles from "./sidebar.module.css";

export default function Sidebar({
  profile,
}) {
  const avatarSrc = profile?.avatarSrc;
  const items = profile?.items || [];

  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <img
          src={avatarSrc}
          alt={profile?.titulo || "Profissional"}
          className={styles.image}
        />

        <div className={styles.logoText}>
          <h2>Raggio Academia</h2>
          <h6>Studio ClinFit</h6>
        </div>
      </div>

      <nav>
        {items.map((item) => (
          <Link key={item.href} href={item.href} className={styles.menuItem}>
            {item.label}
          </Link>
        ))}
      </nav>

    </div>
  );
}


