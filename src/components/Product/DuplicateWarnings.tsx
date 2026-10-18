import { useEffect, useState } from "react";
import { useDuplicatePairs } from "@hooks/use-duplicate-pairs";

// CSS
import "./DuplicateWarnings.css";

interface DuplicateWarningsProps {
    images: File[];
}

const DuplicateWarnings: React.FC<DuplicateWarningsProps> = ({ images }) => {
    const pairs = useDuplicatePairs(images);
    const [urlsByFile, setUrlsByFile] = useState<Map<File, string>>(new Map());

    useEffect(() => {
        const files = new Set<File>();
        pairs.forEach((pair) => {
            files.add(pair.fileA);
            files.add(pair.fileB);
        });

        const map = new Map<File, string>();
        files.forEach((file) => map.set(file, URL.createObjectURL(file)));
        setUrlsByFile(map);

        return () => {
            map.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [pairs]);

    if (pairs.length === 0) return null;

    return (
        <div className="duplicate-warnings">
            <p className="duplicate-warnings-title">
                ⚠ {pairs.length === 1 ? "Estas páginas parecem" : "Estes pares de páginas parecem"} muito semelhantes:
            </p>
            {pairs.map((pair) => (
                <div className="duplicate-pair" key={`${pair.indexA}-${pair.indexB}`}>
                    <img src={urlsByFile.get(pair.fileA)} alt="" />
                    <img src={urlsByFile.get(pair.fileB)} alt="" />
                    <span className="duplicate-pair-names">
                        {pair.fileA.name} ↔ {pair.fileB.name}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default DuplicateWarnings;
