import { useEffect, useState } from "react";

const MockupFonts = () => {
    const [fontList, setFontList] = useState<string[]>([]);

    useEffect(() => {
        const files = import.meta.glob("/src/assets/fonts/**/*");
        const folderNames = new Set<string>();

        Object.keys(files).forEach((path) => {
            const parts = path.split("/");
            const folderName = parts[parts.length - 2];

            folderNames.add(folderName);
        });

        setFontList(Array.from(folderNames).sort());
    }, []);
console.log(fontList)
    return (
        <div>
            <ul className="list-group">
                {fontList.map((font) => (
                    <li className="list-group-item" key={font}>
                        <h5>{font}</h5>
                        <div style={{ fontFamily: font }}>Whereas disregard and contempt for human rights have resulted</div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MockupFonts;
