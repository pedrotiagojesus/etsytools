import { countByDifficulty, DIFFICULTY_LABELS, type JobAnalysis } from "@utils/difficulty";

// CSS
import "./DifficultyReport.css";

interface DifficultyReportProps {
    analysis: JobAnalysis;
}

const DifficultyReport: React.FC<DifficultyReportProps> = ({ analysis }) => {
    const counts = countByDifficulty(analysis);

    return (
        <div className="difficulty-report">
            <div className="difficulty-report-head">
                <h5 className="mb-0">Dificuldade estimada</h5>
                <span className={`difficulty-badge ${analysis.overall}`}>
                    {DIFFICULTY_LABELS[analysis.overall]}
                </span>
            </div>

            <p className="text-muted small mb-2">
                {counts.easy} fácil · {counts.medium} médio · {counts.hard} difícil, em {analysis.pages.length}{" "}
                páginas. É uma estimativa automática (densidade de linhas e áreas a colorir), com limiares ainda
                por calibrar — usa-a como orientação para a idade-alvo, não como regra.
            </p>

            <details>
                <summary>Ver por página</summary>
                <table className="table table-sm difficulty-report-table">
                    <thead>
                        <tr>
                            <th scope="col">Página</th>
                            <th scope="col">Nível</th>
                            <th scope="col">Áreas</th>
                            <th scope="col">Segmentos</th>
                            <th scope="col">Tinta</th>
                        </tr>
                    </thead>
                    <tbody>
                        {analysis.pages.map((page) => (
                            <tr key={page.index}>
                                <td>{page.index}</td>
                                <td>
                                    <span className={`difficulty-badge ${page.difficulty}`}>
                                        {DIFFICULTY_LABELS[page.difficulty]}
                                    </span>
                                </td>
                                <td>{page.metrics.regions}</td>
                                <td>{page.metrics.segments}</td>
                                <td>{(page.metrics.inkRatio * 100).toFixed(1)}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </details>
        </div>
    );
};

export default DifficultyReport;
