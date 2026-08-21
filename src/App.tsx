import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

// Components
import Header from "@components/Header/Header";
import Footer from "@components/Footer/Footer";
import ToastContainer from "@components/Toast/ToastContainer";

// Hooks
import { useToast } from "@hooks/useToast";

// CSS
import "./App.css";

function App() {
    const { toasts, removeToast } = useToast();

    return (
        <>
            <a href="#main-content" className="skip-to-main">
                Skip to main content
            </a>
            <Header />
            <main id="main-content" tabIndex={-1}>
                <Outlet />
            </main>
            <Footer />
            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        </>
    );
}

export default App;
