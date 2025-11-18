import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const version = '0.0.0'; // From package.json

    return (
        <footer className="app-footer">
            <div className="footer-content">
                <div className="footer-info">
                    <span>EstyTOOLS © {currentYear}</span>
                    <span className="footer-separator">|</span>
                    <span>Version {version}</span>
                </div>
                <div className="footer-links">
                    <a
                        href="https://github.com/yourusername/estytools"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer-link"
                        aria-label="Visit EstyTOOLS on GitHub"
                    >
                        <i className="bi bi-github" aria-hidden="true"></i> GitHub
                    </a>
                    <a
                        href="#"
                        className="footer-link"
                        onClick={(e) => e.preventDefault()}
                        aria-label="View documentation"
                    >
                        <i className="bi bi-book" aria-hidden="true"></i> Documentação
                    </a>
                    <a
                        href="#"
                        className="footer-link"
                        onClick={(e) => e.preventDefault()}
                        aria-label="Get support"
                    >
                        <i className="bi bi-question-circle" aria-hidden="true"></i> Suporte
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
