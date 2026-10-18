import { useEffect, useState } from "react";
import { computeImageHash, DUPLICATE_THRESHOLD, hammingDistance } from "@utils/image-hash";

export interface DuplicatePair {
    indexA: number;
    indexB: number;
    fileA: File;
    fileB: File;
    distance: number;
}

export function useDuplicatePairs(images: File[]): DuplicatePair[] {
    const [pairs, setPairs] = useState<DuplicatePair[]>([]);

    useEffect(() => {
        let cancelled = false;

        if (images.length < 2) {
            setPairs([]);
            return;
        }

        Promise.all(images.map((file) => computeImageHash(file)))
            .then((hashes) => {
                if (cancelled) return;

                const found: DuplicatePair[] = [];
                for (let i = 0; i < hashes.length; i++) {
                    for (let j = i + 1; j < hashes.length; j++) {
                        const distance = hammingDistance(hashes[i], hashes[j]);
                        if (distance <= DUPLICATE_THRESHOLD) {
                            found.push({
                                indexA: i,
                                indexB: j,
                                fileA: images[i],
                                fileB: images[j],
                                distance,
                            });
                        }
                    }
                }

                setPairs(found);
            })
            .catch((err) => {
                console.error(err);
            });

        return () => {
            cancelled = true;
        };
    }, [images]);

    return pairs;
}
