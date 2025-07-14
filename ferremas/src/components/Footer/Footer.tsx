import { FaTools, FaPhone, FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa';
import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.footerSection}>
                    <div className={styles.logo}>
                        <FaTools className={styles.logoIcon} />
                        <span>FERREMAS</span>
                    </div>
                    <p className={styles.description}>
                        Tu ferretería de confianza con más de 20 años de experiencia
                    </p>
                </div>

                <div className={styles.footerSection}>
                    <h3 className={styles.sectionTitle}>Contacto</h3>
                    <div className={styles.contactItem}>
                        <FaPhone className={styles.contactIcon} />
                        <span>(123) 456-7890</span>
                    </div>
                    <div className={styles.contactItem}>
                        <FaMapMarkerAlt className={styles.contactIcon} />
                        <span>Av. Industrial 123, Ciudad</span>
                    </div>
                    <div className={styles.contactItem}>
                        <FaEnvelope className={styles.contactIcon} />
                        <span>contacto@ferremas.com</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;