import { describe, expect, it } from "vitest";
import { checkImageSpecs } from "./etsyImageSpecs";

describe("checkImageSpecs", () => {
    it("2000x2000 cumpre o mínimo de zoom e a proporção quadrada", () => {
        const check = checkImageSpecs(2000, 2000);
        expect(check.meetsZoomMinimum).toBe(true);
        expect(check.belowAbsoluteMinimum).toBe(false);
        expect(check.aspectRatioOk).toBe(true);
    });

    it("600x600 fica abaixo do mínimo absoluto", () => {
        const check = checkImageSpecs(600, 600);
        expect(check.belowAbsoluteMinimum).toBe(true);
    });

    it("1000x1000 fica entre os dois limites (acima do absoluto, abaixo do de zoom)", () => {
        const check = checkImageSpecs(1000, 1000);
        expect(check.meetsZoomMinimum).toBe(false);
        expect(check.belowAbsoluteMinimum).toBe(false);
    });

    it("3000x2250 (4:3) tem proporção aceite", () => {
        const check = checkImageSpecs(3000, 2250);
        expect(check.aspectRatioOk).toBe(true);
    });

    it("3000x1000 (muito panorâmico) tem proporção rejeitada", () => {
        const check = checkImageSpecs(3000, 1000);
        expect(check.aspectRatioOk).toBe(false);
    });

    it("shortestSide calcula corretamente em retrato e paisagem", () => {
        expect(checkImageSpecs(800, 2500).shortestSide).toBe(800);
        expect(checkImageSpecs(2500, 800).shortestSide).toBe(800);
    });
});
