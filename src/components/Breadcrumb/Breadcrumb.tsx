import { Link } from "react-router-dom";
import "./Breadcrumb.css";

export interface BreadcrumbItem {
    label: string;
    path: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

const Breadcrumb = ({ items }: BreadcrumbProps) => {
    // Don't render if there are no items or only one item (home)
    if (items.length <= 1) {
        return null;
    }

    return (
        <nav aria-label="breadcrumb" className="breadcrumb-nav">
            <ol className="breadcrumb">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <li
                            key={item.path}
                            className={`breadcrumb-item ${isLast ? 'active' : ''}`}
                            aria-current={isLast ? 'page' : undefined}
                        >
                            {isLast ? (
                                <span>{item.label}</span>
                            ) : (
                                <>
                                    <Link to={item.path}>{item.label}</Link>
                                    <i className="bi bi-chevron-right breadcrumb-separator" aria-hidden="true"></i>
                                </>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumb;
