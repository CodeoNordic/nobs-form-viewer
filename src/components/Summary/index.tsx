import { useConfig } from "@context/Config";
import { useMemo } from "react";
import SummaryItem from "./SummaryItem";
import extractAnswers from "./extractAnswers";

const Summary: FC = () => {
    const config = useConfig();

    if (!config) return null;

    const survey = JSON.parse(config.value!);

    const answers = useMemo(() => {
        const jsonAnswers = JSON.parse(config.answerData || '{}');

        const newAnswers = extractAnswers(jsonAnswers, survey, config);

        return newAnswers;
    }, [config.answerData, survey]);

    return <div className="summary">
        {(survey.title && survey.showTitle !== false) && <p className="title">{survey.title}</p>}
        {(survey.description && survey.showTitle !== false) && <p className="description">{survey.description}</p>}
        {survey.pages.map((page: any, index: number) => {
            return <SummaryItem key={index} element={page} answers={answers} />;
        })}
    </div>
}

export default Summary;