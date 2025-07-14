import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function PagoResultado() {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const confirmPayment = async () => {
            const params = new URLSearchParams(location.search);
            const token = params.get('token_ws');

            if (!token) {
                console.error('No se recibió token de Webpay');
                navigate('/checkout?status=error');
                return;
            }

            try {
                const response = await fetch('http://localhost:3006/api/webpay/confirm', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });

                const data = await response.json();

                if (data.success) {
                    navigate('/checkout/success', { state: { transaction: data.response } });
                } else {
                    navigate('/checkout/failure', { state: { transaction: data.response } });
                }
            } catch (error) {
                console.error('Error confirmando pago:', error);
                navigate('/checkout?status=error');
            }
        };

        confirmPayment();
    }, [location, navigate]);

    return (
        <div className="container text-center py-5">
            <h2>Procesando tu pago...</h2>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
            </div>
        </div>
    );
}