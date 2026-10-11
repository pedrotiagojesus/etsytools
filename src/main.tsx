import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Bootstrap
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.min.css";

// CSS
import "@assets/css/bootswatch-united.min.css";
import "@assets/css/theme.css";

// Fonts
import "@assets/fonts/Lato/Lato.css";

// Context
import { ThemeProvider } from "@contexts/ThemeContext";
import { ToastProvider } from "@contexts/ToastContext";

// Pages
import App from "./App";
import Calculator from "@pages/Calculator/Calculator";
import GenerateProduct from "@pages/GenerateProduct/GenerateProduct";
import Mockup from "@pages/Mockup/Mockup";

const router = createBrowserRouter(
    [
        {
            path: "/",
            element: <App />,
            children: [
                {
                    index: true,
                    element: <Calculator />,
                },
                {
                    path: "/calculator",
                    element: <Calculator />,
                },
                {
                    path: "/generate-product",
                    element: <GenerateProduct />,
                },
                {
                    path: "/mockup",
                    element: <Mockup />,
                },
            ],
        },
    ],
    {
        basename: "/",
    },
);

const rootElement = document.getElementById("root");
if (!rootElement) {
    throw new Error('Elemento "#root" não encontrado no index.html');
}

createRoot(rootElement).render(
    <StrictMode>
        <ThemeProvider>
            <ToastProvider>
                <RouterProvider router={router} />
            </ToastProvider>
        </ThemeProvider>
    </StrictMode>,
);
