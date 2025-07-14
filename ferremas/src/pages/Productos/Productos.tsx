// src/pages/Productos/Productos.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from './Productos.module.css';

interface Producto {
    id: number;
    codigo_producto: string;
    categoria: string;
    marca: string;
    nombre: string;
    descripcion: string;
    precio: number;
    cantidad: number;
    imagen: string;
    fecha_actualizacion: string;
}

interface ProductoEnCarrito extends Producto {
    cantidadEnCarrito: number;
}

export default function Productos() {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [carrito, setCarrito] = useState<ProductoEnCarrito[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchProductos = async () => {
        try {
            const response = await fetch("http://localhost:3006/api/productos");

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    `Error ${response.status}: ${errorData.message || 'Error al obtener los productos'}`
                );
            }

            const data = await response.json();
            setProductos(data);
        } catch (err) {
            console.error('Detalles del error:', err);
            setError(`Error al cargar los productos: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setLoading(false);
        }
    };

    // Agregar producto al carrito
    const agregarAlCarrito = (producto: Producto) => {
        setCarrito((prev) => {
            const existe = prev.find((item) => item.id === producto.id);

            if (existe) {
                if (existe.cantidadEnCarrito >= producto.cantidad) {
                    alert("No hay suficiente stock disponible");
                    return prev;
                }

                return prev.map((item) =>
                    item.id === producto.id
                        ? { ...item, cantidadEnCarrito: item.cantidadEnCarrito + 1 }
                        : item
                );
            } else {
                return [...prev, { ...producto, cantidadEnCarrito: 1 }];
            }
        });
    };

    // Eliminar producto del carrito
    const eliminarDelCarrito = (id: number) => {
        setCarrito(carrito.filter(item => item.id !== id));
    };

    // Calcular total del carrito
    const calcularTotal = () => {
        return carrito.reduce(
            (total, item) => total + (item.precio * item.cantidadEnCarrito),
            0
        );
    };

    // Cargar productos al montar el componente
    useEffect(() => {
        fetchProductos();
    }, []);

    if (loading) return <div className={styles.loading}>Cargando productos...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Productos Ferremas</h1>

            {/* Listado de productos */}
            <div className="row">
                {productos.map((producto) => (
                    <div key={producto.id} className="col-md-4 mb-4">
                        <div className={styles.productCard}>
                            <div
                                className={styles.productImageContainer}
                                style={{
                                    backgroundImage: `url(http://localhost:3006/images/${producto.imagen})`
                                }}
                            />
                            <div className={styles.productBody}>
                                <h5 className={styles.productTitle}>{producto.nombre}</h5>
                                <h6 className={styles.productBrand}>{producto.marca}</h6>
                                <p className={styles.productDesc}>{producto.descripcion}</p>
                                <div className={styles.productFooter}>
                                    <span className={styles.productCode}>{producto.codigo_producto}</span>
                                    <span className={styles.productPrice}>
                                        ${producto.precio.toLocaleString("es-CL")}
                                    </span>
                                    <button
                                        className={`${styles.btnPrimary} ${producto.cantidad <= 0 ? styles.disabled : ''}`}
                                        onClick={() => agregarAlCarrito(producto)}
                                        disabled={producto.cantidad <= 0}
                                    >
                                        {producto.cantidad > 0 ? "Agregar al carrito" : "Agotado"}
                                    </button>
                                    <div className={styles.stock}>
                                        <span className={producto.cantidad > 0 ? styles.stockIn : styles.stockOut}>
                                            {producto.cantidad > 0 ? `Stock: ${producto.cantidad}` : "Agotado"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Carrito de compras */}
            {carrito.length > 0 && (
                <div className={styles.cartContainer}>
                    <h2 className={styles.cartTitle}>Tu Carrito</h2>
                    <ul className={styles.cartList}>
                        {carrito.map((item) => (
                            <li key={item.id} className={styles.cartItem}>
                                <div className={styles.cartItemInfo}>
                                    <span className={styles.cartItemName}>
                                        {item.nombre} x {item.cantidadEnCarrito}
                                    </span>
                                    <span className={styles.cartItemCode}>
                                        {item.codigo_producto}
                                    </span>
                                </div>
                                <div className={styles.cartItemActions}>
                                    <span className={styles.cartItemPrice}>
                                        ${(item.precio * item.cantidadEnCarrito).toLocaleString("es-CL")}
                                    </span>
                                    <button
                                        className={styles.btnRemove}
                                        onClick={() => eliminarDelCarrito(item.id)}
                                    >
                                        &times;
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className={styles.cartTotal}>
                        <span>Total:</span>
                        <span>${calcularTotal().toLocaleString("es-CL")}</span>
                    </div>
                    <button
                        className={styles.btnCheckout}
                        onClick={() => navigate("/checkout", { state: { carrito } })}
                    >
                        Proceder al pago
                    </button>
                </div>
            )}
        </div>
    );
}