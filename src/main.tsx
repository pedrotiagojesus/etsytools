import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";

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
import Product from "@pages/Product/Product";

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
                    path: "/product",
                    element: <Product />,
                },
                // Old pages, merged into /product
                {
                    path: "/generate-product",
                    element: <Navigate to="/product" replace />,
                },
                {
                    path: "/mockup",
                    element: <Navigate to="/product" replace />,
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
