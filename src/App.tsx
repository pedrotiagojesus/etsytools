import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

// Components
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import ToastContainer from "./components/Toast/ToastContainer";

// Hooks
import { useToast } from "./hooks/useToast";

// CSS
import "./App.css";

function App() {
    const { toasts, removeToast } = useToast();
    const location = useLocation();
    const [displayLocation, setDisplayLocation] = useState(location);
    const [transitionStage, setTransitionStage] = useState("fade-in");

    useEffect(() => {
        if (location !== displayLocation) {
            setTransitionStage("fade-out");

            // Check if user prefers reduced motion
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            // If reduced motion is preferred, skip animation and update immediately
            if (prefersReducedMotion) {
                setTransitionStage("fade-in");
                setDisplayLocation(location);
            }
        }
    }, [location, displayLocation]);

    return (
        <>
            <a href="#main-content" className="skip-to-main">
                Skip to main content
            </a>
            <Header />
            <main
                id="main-content"
                className={`page-transition ${transitionStage}`}
                onAnimationEnd={() => {
                    if (transitionStage === "fade-out") {
                        setTransitionStage("fade-in");
                        setDisplayLocation(location);
                    }
                }}
                tabIndex={-1}
            >
                <Outlet />
            </main>
            <Footer />
            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        </>
    );
}

export default App;
