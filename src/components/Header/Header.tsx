import { NavLink } from "react-router-dom";

// CSS
import "./Header.css";

const Header = () => {
    return (
        <nav className="navbar navbar-expand-lg bg-primary" data-bs-theme="dark">
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
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <NavLink to="/calculator" className="nav-link">
                                Calculadora
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/generate-product" className="nav-link">
                                Gerador do Produto
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/mockup" className="nav-link">
                                Mockup
                            </NavLink>
                        </li>
                        {/*
                        <li className="nav-item">
                            <NavLink to="/image-fixer" className="nav-link">
                                Image Fixer
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/generate-pdf" className="nav-link">
                                Gerador de PDF
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/convert-svg" className="nav-link">
                                Conversor para SVG
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/midjourney-prompt" className="nav-link">
                                Midjourney Prompt
                            </NavLink>
                        </li> */}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Header;
