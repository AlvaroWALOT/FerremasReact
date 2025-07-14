import { FaTools } from 'react-icons/fa';
import styles from './Header.module.css';

const Header = () => {
    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <div className={styles.logo}>
                    <FaTools className={styles.logoIcon} />
                    <span>FERREMAS</span>
                </div>
                <nav className={styles.nav}>
                    <a href="/" className={styles.navLink}>Inicio</a>
                    <a href="/productos" className={styles.navLink}>Productos</a>
                    <a href="/contacto" className={styles.navLink}>Contacto</a>
                </nav>
            </div>
        </header>
    );
};

export default Header;