import { lazy, StrictMode, Suspense } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.min.css";

// CSS
import "@assets/css/bootstrap.min.css";
import "@assets/css/theme.css";

// Fonts
import "@assets/fonts/Lato/Lato.css";

// Context
import { ThemeProvider } from "@contexts/ThemeContext";
import { ToastProvider } from "@contexts/ToastContext";

// Components
import LoadingSpinner from "@components/LoadingSpinner/LoadingSpinner";

// Pages
import App from "./App";

// Cada página fica no seu próprio chunk, carregado só quando visitado — o
// Mockup sozinho arrasta react-ace, dnd-kit e html-to-image, que as outras
// páginas não precisam.
const Calculator = lazy(() => import("@pages/Calculator/Calculator"));
const GenerateProduct = lazy(
    () => import("@pages/GenerateProduct/GenerateProduct"),
);
const Mockup = lazy(() => import("@pages/Mockup/Mockup"));

const withSuspense = (element: ReactNode) => (
    <Suspense fallback={<LoadingSpinner overlay size="lg" />}>
        {element}
    </Suspense>
);

const router = createBrowserRouter(
    [
        {
            path: "/",
            element: <App />,
            children: [
                {
                    index: true,
                    element: withSuspense(<Calculator />),
                },
                {
                    path: "/calculator",
                    element: withSuspense(<Calculator />),
                },
                {
                    path: "/generate-product",
                    element: withSuspense(<GenerateProduct />),
                },
                {
                    path: "/mockup",
                    element: withSuspense(<Mockup />),
                },
            ],
        },
    ],
    {
        basename: "/",
    },
);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemeProvider>
            <ToastProvider>
                <RouterProvider router={router} />
            </ToastProvider>
        </ThemeProvider>
    </StrictMode>,
);
