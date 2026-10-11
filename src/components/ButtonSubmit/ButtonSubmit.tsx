// CSS
import "./ButtonSubmit.css";

interface ButtonSubmitProps {
    isDisabled: boolean;
    description: string | null;
}

const ButtonSubmit = ({ isDisabled, description }: ButtonSubmitProps) => {
    if (!description) return null;

    return (
        <button type="submit" className="btn btn-primary" disabled={isDisabled}>
            {description}
        </button>
    );
};

export default ButtonSubmit;
