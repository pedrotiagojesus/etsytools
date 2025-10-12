// CSS
import "./ButtonSubmit.css";

type ButtonSubmitProps = {
    disabled: boolean;
    description: string | null;
};

const ButtonSubmit = ({ disabled, description }: ButtonSubmitProps) => {
    if (!description) return null;

    return (
        <button type="submit" className="btn btn-primary" disabled={disabled}>
            {description}
        </button>
    );
};

export default ButtonSubmit;
