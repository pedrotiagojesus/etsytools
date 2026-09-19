import { describe, expect, it } from "vitest";
import {
    computeDifferenceHash,
    hammingDistance,
    HASH_WIDTH,
    HASH_HEIGHT,
} from "./imageHash";

const SIZE = HASH_WIDTH * HASH_HEIGHT;

const makeGradient = (): number[] =>
    Array.from({ length: SIZE }, (_, i) => (i % HASH_WIDTH) * 20);

describe("computeDifferenceHash", () => {
    it("é determinístico: o mesmo array de cinzentos produz sempre o mesmo hash", () => {
        const grayscale = makeGradient();
        expect(computeDifferenceHash(grayscale)).toBe(computeDifferenceHash(grayscale));
    });

    it("produz um hash com 64 bits (HASH_HEIGHT * (HASH_WIDTH - 1))", () => {
        const hash = computeDifferenceHash(makeGradient());
        expect(hash.length).toBe(HASH_HEIGHT * (HASH_WIDTH - 1));
    });

    it("rejeita um array de tamanho errado", () => {
        expect(() => computeDifferenceHash([1, 2, 3])).toThrow();
    });
});

describe("hammingDistance", () => {
    it("duas grelhas idênticas produzem distância 0", () => {
        const grayscale = makeGradient();
        const hashA = computeDifferenceHash(grayscale);
        const hashB = computeDifferenceHash(grayscale);
        expect(hammingDistance(hashA, hashB)).toBe(0);
    });

    it("duas grelhas com gradiente invertido produzem distância alta", () => {
        const grayscale = makeGradient();
        const inverted = grayscale.map((v) => 255 - v);
        const hashA = computeDifferenceHash(grayscale);
        const hashB = computeDifferenceHash(inverted);
        expect(hammingDistance(hashA, hashB)).toBeGreaterThan(50);
    });

    it("é simétrica", () => {
        const hashA = computeDifferenceHash(makeGradient());
        const hashB = computeDifferenceHash(makeGradient().map((v) => 255 - v));
        expect(hammingDistance(hashA, hashB)).toBe(hammingDistance(hashB, hashA));
    });

    it("uma pequena perturbação num único pixel muda poucos bits, não todos", () => {
        const grayscale = makeGradient();
        const perturbed = [...grayscale];
        perturbed[10] = perturbed[10] > 127 ? 0 : 255;

        const hashA = computeDifferenceHash(grayscale);
        const hashB = computeDifferenceHash(perturbed);
        const distance = hammingDistance(hashA, hashB);

        expect(distance).toBeGreaterThan(0);
        expect(distance).toBeLessThan(10);
    });

    it("rejeita hashes de tamanhos diferentes", () => {
        expect(() => hammingDistance("0101", "010")).toThrow();
    });
});
