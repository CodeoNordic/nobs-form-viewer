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
        {config.header && <div className="header">
                {config.header.leftColumn && <div className="header-left">
                    <p className="navn">{config.header.leftColumn.navn}</p>
                    <p className="født-kjønn">
                        Født: {config.header.leftColumn.født}, Kjønn: {config.header.leftColumn.kjønn}
                    </p>
                    <p className="adresse">{config.header.leftColumn.adresse}</p>
                    <p className="telefon">Telefon: {config.header.leftColumn.telefon}</p>
                </div>}
                {config.header.rightColumn && <div className="header-right">
                    <p className="ordrenummer">{config.header.rightColumn.ordrenummer}</p>
                    <p className="ordredato">Ordredato: <strong>{config.header.rightColumn.ordredato}</strong></p>
                    <p className="type">{config.header.rightColumn.type}</p>
                    <p className="ortopediingeniør">Ortopediingeniør: <strong>{config.header.rightColumn.ortopediingeniør}</strong></p>
                    <p className="prodansvarlig">Prod. ansvarlig: {config.header.rightColumn.prodansvarlig}</p>
                </div>}
        </div>}
        {(survey.title && survey.showTitle !== false) && <p className="title">{survey.title}</p>}
        {(survey.description && survey.showTitle !== false) && <p className="description">{survey.description}</p>}
        {survey.pages.map((page: any, index: number) => {
            return <SummaryItem key={index} element={page} answers={answers} />;
        })}
    </div>
}

export default Summary;