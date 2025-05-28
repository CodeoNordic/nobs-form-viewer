import { useConfig } from "@context/Config";
import { useMemo } from "react";
import SummaryItem from "./SummaryItem";
import extractAnswers from "./extractAnswers";
import Footer from "./Footer";
import Header from "./Header";

const Summary: FC = () => {
    const config = useConfig();

    if (!config) return null;

    if (config.oldData) {
        console.log(config.oldData);
    }

    const survey = JSON.parse(config.value!);

    const answers = useMemo(() => {
        const jsonAnswers = JSON.parse(config.answerData || '{}');

        if (!jsonAnswers || Object.keys(jsonAnswers).length === 0 && config.oldData) {
            console.log("survey", survey)

            Object.keys(config.oldData).forEach((key, index) => {
                jsonAnswers[key] = config.oldData[key].value;
            })
        }

        const newAnswers = extractAnswers(jsonAnswers, survey, config);

        console.log("Extracted answers:", newAnswers);

        return newAnswers;
    }, [config.answerData, survey]);

    return <div className={"summary" + (config.style ? " " + config.style : "")}>
        <Header />
        {(survey.title && survey.showTitle !== false) && <p className="title">{survey.title}</p>}
        {(survey.description && survey.showTitle !== false) && <p className="description">{survey.description}</p>}
        {survey.pages.map((page: any, index: number) => 
            <SummaryItem key={index} element={page} answers={answers} />
        )}
        <Footer />
    </div>

    /**
     * source pro font
    */
}

export default Summary;