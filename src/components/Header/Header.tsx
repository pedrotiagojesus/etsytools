import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "@hooks/use-theme";

// CSS
import "./Header.css";

const Header = () => {
    const { theme, toggleTheme } = useTheme();
    const [isRotating, setIsRotating] = useState(false);

    const handleToggle = () => {
        setIsRotating(true);
        toggleTheme();
        setTimeout(() => setIsRotating(false), 300);
    };

    return (
        <nav
            className="navbar navbar-expand-lg bg-primary"
            data-bs-theme="dark"
        >
            <div className="container-fluid">
                <a className="navbar-brand" href="#">
                    Etsy Tool
                </a>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div
                    className="collapse navbar-collapse"
                    id="navbarSupportedContent"
                >
                    <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center">
                        <li className="nav-item">
                            <button
                                className={`nav-link btn btn-link theme-toggle ${isRotating ? "rotating" : ""}`}
                                onClick={handleToggle}
                                aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                                title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                                type="button"
                            >
                                <i
                                    className={`bi ${theme === "light" ? "bi-moon-fill" : "bi-sun-fill"}`}
                                    aria-hidden="true"
                                ></i>
                                <span className="visually-hidden">
                                    {theme === "light"
                                        ? "Switch to dark mode"
                                        : "Switch to light mode"}
                                </span>
                            </button>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="/calculator"
                                className={({ isActive }) =>
                                    `nav-link ${isActive ? "active" : ""}`
                                }
                                aria-label="Calculator"
                            >
                                <i
                                    className="bi bi-calculator nav-icon"
                                    aria-hidden="true"
                                ></i>
                                <span className="nav-text">Calculadora</span>
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="/product"
                                className={({ isActive }) =>
                                    `nav-link ${isActive ? "active" : ""}`
                                }
                                aria-label="Product"
                            >
                                <i
                                    className="bi bi-box-seam nav-icon"
                                    aria-hidden="true"
                                ></i>
                                <span className="nav-text">Produto</span>
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="/responses"
                                className={({ isActive }) =>
                                    `nav-link ${isActive ? "active" : ""}`
                                }
                                aria-label="Responses"
                            >
                                <i
                                    className="bi bi-chat-left-text nav-icon"
                                    aria-hidden="true"
                                ></i>
                                <span className="nav-text">Respostas</span>
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Header;
