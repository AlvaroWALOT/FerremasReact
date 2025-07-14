import { Carousel } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./CarouselBanner.module.css";

const CarouselBanner = () => {
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();

    const totalSlides = 3;

    const handleSlideChange = (selectedIndex: number) => {
        setIsTransitioning(true);
        setActiveIndex(selectedIndex);
        setTimeout(() => setIsTransitioning(false), 600);
    };

    useEffect(() => {
        const interval = !isHovered ?
            setInterval(() => {
                const nextIndex = (activeIndex + 1) % totalSlides;
                setActiveIndex(nextIndex);
            }, 7000) : null;

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [activeIndex, isHovered]);

    return (
        <div
            className={`${styles.carouselWrapper} ${isTransitioning ? styles.transitioning : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Carousel
                fade
                id="bannerPrincipal"
                className={styles.carousel}
                indicators={false}
                activeIndex={activeIndex}
                onSelect={handleSlideChange}
                controls={false}
            >
                {/* Slide 1: Herramientas */}
                <Carousel.Item>
                    <div className={styles.imageContainer}>
                        <img
                            className="d-block w-100"
                            src="/src/assets/images/herramientas.jpg"
                            alt="Herramientas profesionales"
                        />
                    </div>
                </Carousel.Item>

                {/* Slide 2: Materiales de construcción */}
                <Carousel.Item>
                    <div className={styles.imageContainer}>
                        <img
                            className="d-block w-100"
                            src="/src/assets/images/materiales.jpg"
                            alt="Materiales de construcción"
                        />
                    </div>
                </Carousel.Item>

                {/* Slide 3: Ofertas especiales */}
                <Carousel.Item>
                    <div className={styles.imageContainer}>
                        <img
                            className="d-block w-100"
                            src="/src/assets/images/ofertas.jpg"
                            alt="Ofertas especiales"
                        />
                    </div>
                </Carousel.Item>
            </Carousel>

            {/* Mensaje principal basado en el slide activo */}
            <div className={styles.mainMessageOverlay}>
                {activeIndex === 0 && (
                    <div className={`${styles.mainMessageContent} ${styles.herramientasMessage}`}>
                        <h1>Herramientas profesionales</h1>
                        <p>Las mejores marcas y la mayor variedad para todos tus proyectos</p>
                        <button
                            className={styles.mainActionButton}
                            onClick={() => navigate("/productos")}
                        >
                            Ver catálogo de herramientas
                        </button>
                    </div>
                )}

                {activeIndex === 1 && (
                    <div className={`${styles.mainMessageContent} ${styles.materialesMessage}`}>
                        <h1>Materiales de construcción</h1>
                        <p>Todo lo que necesitas para tus obras y remodelaciones</p>
                        <button
                            className={styles.mainActionButton}
                            onClick={() => navigate("/productos")}
                        >
                            Explorar materiales
                        </button>
                    </div>
                )}

                {activeIndex === 2 && (
                    <div className={`${styles.mainMessageContent} ${styles.ofertaMessage}`}>
                        <h1>Ofertas especiales</h1>
                        <p>Aprovecha nuestros descuentos en productos seleccionados</p>
                        <button className={styles.mainActionButton}
                            onClick={() => navigate("/productos")}
                        >
                            Ver ofertas
                        </button>
                    </div>
                )}
            </div>

            {/* Indicadores personalizados */}
            <div className={styles.customIndicators}>
                {[...Array(totalSlides)].map((_, index) => (
                    <button
                        key={index}
                        className={`${styles.indicator} ${activeIndex === index ? styles.active : ''}`}
                        onClick={() => handleSlideChange(index)}
                    />
                ))}
            </div>

            {/* Flechas de navegación */}
            <div className={styles.customControls}>
                <button
                    className={styles.controlPrev}
                    onClick={() => handleSlideChange((activeIndex - 1 + totalSlides) % totalSlides)}
                >
                    ‹
                </button>
                <button
                    className={styles.controlNext}
                    onClick={() => handleSlideChange((activeIndex + 1) % totalSlides)}
                >
                    ›
                </button>
            </div>
        </div>
    );
};

export default CarouselBanner;