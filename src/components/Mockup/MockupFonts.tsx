import { useEffect, useState } from "react";
import { listAvailableFonts, loadFonts } from "@utils/load-fonts";
import { useToast } from "@hooks/use-toast";

const MockupFonts = () => {
    const [fontList, setFontList] = useState<string[]>([]);
    const { showError } = useToast();

    useEffect(() => {
        const fonts = listAvailableFonts();
        setFontList(fonts);

        // Este separador é especificamente um "browser" de fontes,
        // por isso faz sentido carregá-las todas aqui — mas só aqui,
        // e não no arranque global da app.
        const loadAllFonts = async () => {
            const failedFonts = await loadFonts(fonts);
            if (failedFonts.length > 0) {
                showError(`Não foi possível carregar as fontes: ${failedFonts.join(", ")}`);
            }
        };

        loadAllFonts();
    }, [showError]);

    return (
        <div>
            <ul className="list-group">
                {fontList.map((font) => (
                    <li className="list-group-item" key={font}>
                        <h5>{font}</h5>
                        <div style={{ fontFamily: font }}>
                            Whereas disregard and contempt for human rights have
                            resulted
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MockupFonts;
