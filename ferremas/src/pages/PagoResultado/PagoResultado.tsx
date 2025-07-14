import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function PagoResultado() {
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const status = searchParams.get('status');
    const buyOrder = searchParams.get('buyOrder');

    useEffect(() => {
        if (!status) {
            navigate('/');
        }
    }, [status, navigate]);

    return (
        <div>
            {status === 'success' ? (
                <div>
                    <h1>¡Pago exitoso!</h1>
                    <p>Número de orden: {buyOrder}</p>
                    {/* Más detalles del pago */}
                </div>
            ) : (
                <div>
                    <h1>Error en el pago</h1>
                    <p>Ocurrió un problema al procesar tu pago.</p>
                </div>
            )}
        </div>
    );
}