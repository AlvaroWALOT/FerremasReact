import { useLocation } from 'react-router-dom';

export default function CheckoutSuccess() {
    const { state } = useLocation();
    const transaction = state?.transaction;

    return (
        <div className="container py-5">
            <div className="alert alert-success text-center">
                <h2>¡Pago exitoso!</h2>
                {transaction && (
                    <div className="mt-4 text-start">
                        <p><strong>Orden:</strong> {transaction.buy_order}</p>
                        <p><strong>Monto:</strong> ${transaction.amount.toLocaleString('es-CL')}</p>
                        <p><strong>Código autorización:</strong> {transaction.authorization_code}</p>
                        <p><strong>Fecha:</strong> {new Date(transaction.transaction_date).toLocaleString()}</p>
                    </div>
                )}
                <a href="/" className="btn btn-primary mt-4">Volver al inicio</a>
            </div>
        </div>
    );
}