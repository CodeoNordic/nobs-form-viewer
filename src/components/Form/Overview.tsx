import { useConfigState } from "@context/Config";
import { useMemo } from "react";

const Overview: FC = () => {
    const [config, setConfig] = useConfigState();

    if (!config) return null;

    const survey = JSON.parse(config.value!);

    const answers = useMemo(() => {
        const jsonAnswers = JSON.parse(config.answerData || '{}');

        let newAnswers: any = {};
        const questions: any[] = [];
        
        const getNestedQuestions = (elements: any[]) => {
            let nestedQuestions: any[] = [];
    
            elements.forEach((el) => { 
                if (el.elements) {
                    nestedQuestions = nestedQuestions.concat(getNestedQuestions(el.elements));
                } else {
                    nestedQuestions.push(el);
                } 
            });
    
            return nestedQuestions;
        };

        survey.pages.forEach((page: any) => {
            questions.push(...getNestedQuestions(page.elements));
        });

        questions.forEach((question) => {
            if (!jsonAnswers[question.name]) {
            } else if (question.choices) {
                if (jsonAnswers[question.name] == "other") {
                    newAnswers[question.name] = jsonAnswers[`${question.name}-Comment`];     
                } else {
                    const choice = question.choices.find((choice: any) => {
                        if (typeof choice === "string") {
                            return choice === jsonAnswers[question.name];
                        } else {
                            return choice.value === jsonAnswers[question.name];
                        }
                    });
    
                    newAnswers[question.name] = typeof choice === "string" ? choice : choice.text;
                }
            } else {
                newAnswers[question.name] = jsonAnswers[question.name];
            }
        });

        return newAnswers;
    }, [config.answerData, survey]);

    function surveyItem(element: any) {
        let newElements: any[] = []; 

        element.elements && element.elements.map((subElement: any, index: number) => {
            const nextEl = element.elements[index + 1];
            if (
                (nextEl && nextEl.startWithNewLine === false) ||
                subElement.startWithNewLine === false
            ) {
                if (newElements[newElements.length - 1] && newElements[newElements.length - 1].noNewLine === true) {
                    let fixedSubElement = { ...subElement };
                    fixedSubElement.startWithNewLine = true;
                    newElements[newElements.length - 1].elements.push(fixedSubElement);
                } else {
                    newElements.push({
                        elements: [subElement],
                        noNewLine: true
                    });
                }
            } else {
                newElements.push(subElement);
            }
        });

        return <div className={`question ${element.type ? element.type : ""}`}>
            {((element.titleLocation != "hidden" &&  element.title !== "") || answers[element.name]) && (
                <p>{!element.elements 
                    ? (element.titleLocation == "hidden"
                        ? "" 
                        : element.title 
                        ? element.title + ": " 
                        : element.name + ": "
                    ) + (
                        answers[element.name] ? answers[element.name] : ""
                    ) : element.title ?? element.title
                }</p>
            )}
            {newElements.length > 0 && <div className={`sub-elements ${element.noNewLine ? "no-new-line" : ""}`}> {
                newElements.map((subElement: any, index: number) => {
                return<div key={index}>
                    {surveyItem(subElement)}
                </div>})
            }</div>}
        </div>
    }

    console.log("render")

    return <div className="overview">
        {(survey.title && survey.showTitle !== false) && <p className="title">{survey.title}</p>}
        {survey.pages.map((page: any, index: number) => <div key={index}>
            {surveyItem(page)}
        </div>)}
    </div>
}

export default Overview;