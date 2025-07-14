import { FaTools, FaShoppingCart, FaBoxOpen } from "react-icons/fa";
import CarouselBanner from "../../components/CarouselBanner/CarouselBanner";
import styles from "./Home.module.css";

const Home = () => {
    return (
        <div className={styles.homeContainer}>
            <CarouselBanner />

            <section className={styles.aboutSection}>
                <div className={styles.container}>
                    <h1 className={styles.title}>
                        <FaTools className={styles.toolsIcon} /> FERREMAS
                    </h1>

                    <div className={styles.contentBox}>
                        <p className={styles.description}>
                            Ferremas es tu aliado confiable en materiales de construcción, herramientas y suministros para el hogar.
                            Con más de 20 años de experiencia, ofrecemos productos de calidad y asesoramiento profesional para
                            tus proyectos de construcción, remodelación y reparación.
                        </p>

                        <p className={styles.description}>
                            Nuestro compromiso va más allá de la venta: brindamos soluciones integrales con un servicio personalizado,
                            entregas puntuales y los mejores precios del mercado. En Ferremas, cada cliente es importante y cada
                            proyecto merece nuestra atención experta.
                        </p>
                    </div>
                </div>
            </section>

            <section className={styles.productsPreview}>
                <div className={styles.container}>
                    <h2 className={styles.sectionTitle}>Nuestros Productos</h2>
                    <div className={styles.productsGrid}>
                        <div className={styles.productCard}>
                            <div className={styles.productIcon}><FaTools /></div>
                            <h3>Herramientas</h3>
                            <p>Amplia variedad de herramientas manuales, eléctricas y profesionales para cada necesidad</p>
                        </div>
                        <div className={styles.productCard}>
                            <div className={styles.productIcon}><FaBoxOpen /></div>
                            <h3>Materiales</h3>
                            <p>Materiales de construcción de primera calidad para tus proyectos</p>
                        </div>
                        <div className={styles.productCard}>
                            <div className={styles.productIcon}><FaShoppingCart /></div>
                            <h3>Ofertas</h3>
                            <p>Descuentos especiales en productos seleccionados para ahorrar en tus compras</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;