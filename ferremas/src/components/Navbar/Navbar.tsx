import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleContacto = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();
        navigate("/contacto");
    };

    return (
        <nav className="navbar-principal">
            <ul className="navbar-list">
                <li>
                    <NavLink to="/quienes-somos" className="navbar-link" end>Nosotros</NavLink>
                </li>
                <li>
                    <NavLink to="/productos" className={({ isActive }) => isActive && location.pathname === "/productos" ? "navbar-link active" : "navbar-link"} end>
                        Productos
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/contacto#contacto" className="navbar-link" end onClick={handleContacto}>Contacto</NavLink>
                </li>
                <li>
                    <NavLink to="/ofertas" className="navbar-link" end>Ofertas</NavLink>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;