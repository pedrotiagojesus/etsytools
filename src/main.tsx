import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.min.css";

// CSS
import "./assets/css/bootstrap.min.css";
import "./assets/css/theme.css";

// Fonts
import "./assets/fonts/Lato/Lato.css";
import "./assets/fonts/FrederickatheGreat/FrederickatheGreat.css";
import "./assets/fonts/PWPerspective/PWPerspective.css";
import "./assets/fonts/Roboto/Roboto.css";
import "./assets/fonts/RubikGemstones/RubikGemstones.css";
import "./assets/fonts/AmaticSC/AmaticSC.css";
import "./assets/fonts/AreYouSerious/AreYouSerious.css";
import "./assets/fonts/BitcountGridSingle/BitcountGridSingle.css";
import "./assets/fonts/BitcountGridSingleCursive/BitcountGridSingleCursive.css";
import "./assets/fonts/BitcountGridSingleRoman/BitcountGridSingleRoman.css";
import "./assets/fonts/Bungee/Bungee.css";
import "./assets/fonts/Butcherman/Butcherman.css";
import "./assets/fonts/GloriaHallelujah/GloriaHallelujah.css";
import "./assets/fonts/Gruppo/Gruppo.css";
import "./assets/fonts/Jersey10/Jersey10.css";
import "./assets/fonts/LuckiestGuy/LuckiestGuy.css";
import "./assets/fonts/MomoSignature/MomoSignature.css";
import "./assets/fonts/Pacifico/Pacifico.css";
import "./assets/fonts/PermanentMarker/PermanentMarker.css";
import "./assets/fonts/Rubik80sFade/Rubik80sFade.css";
import "./assets/fonts/ShadowsIntoLight/ShadowsIntoLight.css";
import "./assets/fonts/Sixtyfour/Sixtyfour.css";
import "./assets/fonts/Cinzel/Cinzel.css";
import "./assets/fonts/DancingScript/DancingScript.css";
import "./assets/fonts/InstrumentSerif/InstrumentSerif.css";
import "./assets/fonts/Inter18pt/Inter18pt.css";
import "./assets/fonts/Inter24pt/Inter24pt.css";
import "./assets/fonts/Inter28pt/Inter28pt.css";
import "./assets/fonts/Montserrat/Montserrat.css";
import "./assets/fonts/OpenSans/OpenSans.css";
import "./assets/fonts/OpenSansSemiCondensed/OpenSansSemiCondensed.css";
import "./assets/fonts/OpenSansCondensed/OpenSansCondensed.css";
import "./assets/fonts/Orbitron/Orbitron.css";

// Context
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./contexts/ToastContext";

// Pages
import App from "./App";
import Calculator from "./pages/Calculator/Calculator";
import GenerateProduct from "./pages/GenerateProduct/GenerateProduct";
import Mockup from "./pages/Mockup/Mockup";

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
                // {
                //     path: "/midjourney-prompt",
                //     element: <MidjourneyPrompt />,
                // },
                // {
                //     path: "/test",
                //     element: <Test />,
                // },
            ],
        },
    ],
    {
        basename: "/",
    }
);


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>,
)

