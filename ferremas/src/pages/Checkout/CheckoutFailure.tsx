import { useLocation } from 'react-router-dom';

export default function CheckoutFailure() {
    const { state } = useLocation();
    const transaction = state?.transaction;

    return (
        <div className="container py-5">
            <div className="alert alert-danger text-center">
                <h2>Pago no completado</h2>
                {transaction && (
                    <div className="mt-4 text-start">
                        <p><strong>Estado:</strong> {transaction.status}</p>
                        <p><strong>Orden:</strong> {transaction.buy_order}</p>
                        <p><strong>Monto:</strong> ${transaction.amount.toLocaleString('es-CL')}</p>
                    </div>
                )}
                <a href="/" className="btn btn-primary mt-4">Volver al inicio</a>
            </div>
        </div>
    );
}