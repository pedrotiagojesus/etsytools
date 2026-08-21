import type { ValidationResult } from "@utils/validation";

interface RowConfig {
    key: string;
    label: string;
    tooltip?: string;
    unit: "€" | "%";
    editable: boolean;
    value: number | string;
    validation?: ValidationResult;
    onChange?: (value: string) => void;
    highlightChange?: boolean; // se deve animar quando o valor muda
}
