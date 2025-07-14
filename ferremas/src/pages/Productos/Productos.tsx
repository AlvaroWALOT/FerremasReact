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

interface PaymentResponse {
    url: string;
    token: string;
}

export default function Productos() {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [carrito, setCarrito] = useState<ProductoEnCarrito[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currency, setCurrency] = useState<"CLP" | "USD">("CLP");
    const [exchangeRate, setExchangeRate] = useState<number | null>(null);
    const [loadingRate, setLoadingRate] = useState(false);
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

    const fetchExchangeRate = async () => {
        setLoadingRate(true);
        try {
            const response = await fetch("http://localhost:3006/api/tipo-cambio");

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error al obtener tipo de cambio");
            }

            const data = await response.json();

            if (data.value) {
                setExchangeRate(data.value);
                console.log(`Tipo de cambio actualizado: 1 USD = ${data.value} CLP (${data.date})`);
            } else {
                throw new Error("No se recibió valor de tipo de cambio");
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error("Error obteniendo tipo de cambio:", error.message);
            } else {
                console.error("Error obteniendo tipo de cambio:", String(error));
            }
            // Establecer un valor por defecto o mostrar mensaje al usuario
            setExchangeRate(950); // Valor por defecto
            alert("No se pudo obtener el tipo de cambio actual. Usando valor de referencia.");
        } finally {
            setLoadingRate(false);
        }
    };

    useEffect(() => {
        if (currency === "USD" && exchangeRate === null) {
            fetchExchangeRate();
        }
    }, [currency]);

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

    const eliminarDelCarrito = (id: number) => {
        setCarrito(carrito.filter(item => item.id !== id));
    };

    const calcularTotal = () => {
        const totalCLP = carrito.reduce(
            (total, item) => total + (item.precio * item.cantidadEnCarrito),
            0
        );

        if (currency === "USD" && exchangeRate) {
            return totalCLP / exchangeRate;
        }
        return totalCLP;
    };

    const formatPrice = (price: number) => {
        if (currency === "USD" && exchangeRate) {
            return `US$${(price / exchangeRate).toFixed(2)}`;
        }
        return `$${price.toLocaleString("es-CL")}`;
    };

    const iniciarPago = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:3006/api/pagar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    carrito: carrito.map((p) => ({
                        id: p.id,
                        cantidad: p.cantidadEnCarrito,
                        precio: Math.round(p.precio),
                    })),
                }),
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${await response.text()}`);
            }

            const data: PaymentResponse = await response.json();

            const paymentWindow = window.open(
                `${data.url}?token_ws=${data.token}`,
                'webpayWindow',
                'width=800,height=600'
            );

            const handleMessage = (event: MessageEvent) => {
                if (event.data.webpayStatus) {
                    paymentWindow?.close();
                    window.removeEventListener('message', handleMessage);

                    if (event.data.webpayStatus === 'success') {
                        navigate('/checkout/success', {
                            state: { transaction: event.data.response }
                        });
                    } else {
                        navigate('/checkout/failure', {
                            state: { transaction: event.data.response }
                        });
                    }
                }
            };

            window.addEventListener('message', handleMessage);

        } catch (err) {
            console.error("Error en el pago:", err);
            alert("Ocurrió un error al iniciar el pago: " + (err instanceof Error ? err.message : String(err)));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductos();
    }, []);

    if (loading) return <div className={styles.loading}>Cargando productos...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Productos Ferremas</h1>

            {/* Selector de moneda */}
            <div className="mb-3" style={{ marginBottom: '20px' }}>
                <label htmlFor="currency-select" className="form-label">Moneda:</label>
                <select
                    id="currency-select"
                    className="form-select w-auto d-inline-block ms-2"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as "CLP" | "USD")}
                    style={{ width: 'auto', display: 'inline-block', marginLeft: '10px' }}
                >
                    <option value="CLP">CLP (Pesos Chilenos)</option>
                    <option value="USD">USD (Dólares)</option>
                </select>

                {currency === "USD" && (
                    <span className="ms-3" style={{ marginLeft: '15px' }}>
                        {loadingRate && "Cargando tipo de cambio..."}
                        {!loadingRate && exchangeRate && (
                            <>Tipo de cambio: 1 USD = {exchangeRate} CLP</>
                        )}
                        {!loadingRate && !exchangeRate && (
                            <span className="text-danger">Error obteniendo tipo de cambio</span>
                        )}
                    </span>
                )}
            </div>

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
                                        {formatPrice(producto.precio)}
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
                                        {formatPrice(item.precio * item.cantidadEnCarrito)}
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
                        <span>{formatPrice(calcularTotal())}</span>
                    </div>
                    <button
                        className={styles.btnCheckout}
                        onClick={iniciarPago}
                        disabled={loading}
                    >
                        {loading ? 'Procesando...' : 'Pagar con Webpay'}
                    </button>
                </div>
            )}
        </div>
    );
}