import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home/Home';
import Productos from './pages/Productos/Productos';
import PagoResultado from './pages/PagoResultado/PagoResultado';
import CheckoutSuccess from './pages/Checkout/CheckoutSuccess';
import CheckoutFailure from './pages/Checkout/CheckoutFailure';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/pago-resultado" element={<PagoResultado />} />
          <Route path="/checkout-success" element={<CheckoutSuccess />} />
          <Route path="/checkout-failure" element={<CheckoutFailure />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;