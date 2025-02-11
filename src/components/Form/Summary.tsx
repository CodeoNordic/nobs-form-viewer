import { useConfigState } from "@context/Config";
import { useMemo } from "react";

const Summary: FC = () => {
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

        questions.forEach((question: any) => {
            if (jsonAnswers[question.name] == undefined) { // No answer
            } else if (question.type == "matrix") { // Matrix question, with rows and columns
                let fullAnswer = ""

                question.rows.map((row: any) => {
                    const rowIsString = typeof row === "string";

                    if (jsonAnswers[question.name][rowIsString ? row : row.value]) {
                        question.columns.map((column: any) => {
                            const colIsString = typeof column === "string";

                            if ((colIsString ? column : column.value) == jsonAnswers[question.name][(rowIsString ? row : row.value)]) {
                                fullAnswer += (fullAnswer && ", ") + (rowIsString ? row : row.text) + ": " + (colIsString ? column : column.text)
                            }
                        })
                    }
                })

                newAnswers[question.name] = fullAnswer
            } else if (question.choices) { // Questions with choices (radio, checkbox, etc)
                if (jsonAnswers[question.name] == "other") { // Other and none does not show up as normal answers
                    newAnswers[question.name] = jsonAnswers[`${question.name}-Comment`];     
                } else if (jsonAnswers[question.name] == "none") {
                    newAnswers[question.name] = config.locale == "no" ? "Ingen" : "None";     
                } else if (Array.isArray(jsonAnswers[question.name])) { // Multiple answers
                    newAnswers[question.name] = jsonAnswers[question.name].map((answer: any) => {
                        const choice = question.choices.find((choice: any) => {
                            if (typeof choice === "string") {
                                return choice === answer;
                            } else {
                                return choice.value === answer;
                            }
                        });
        
                        return typeof choice === "string" ? choice : choice.text;
                    }).join(", ");
                } else { // Normal answer
                    const choice = question.choices.find((choice: any) => {
                        if (typeof choice === "string") {
                            return choice === jsonAnswers[question.name];
                        } else {
                            return choice.value === jsonAnswers[question.name];
                        }
                    });
    
                    newAnswers[question.name] = typeof choice === "string" ? choice : choice.text;
                }
            } else { // Questions without choices (text, number, etc)
                newAnswers[question.name] = jsonAnswers[question.name];
            }
        });

        return newAnswers;
    }, [config.answerData, survey]);

    function surveyItem(element: any, key: number) {
        let newElements: any[] = []; 

        element.elements && element.elements.map((subElement: any, index: number) => {
            const nextEl = element.elements[index + 1];
            if (
                (nextEl && nextEl.startWithNewLine === false) ||
                subElement.startWithNewLine === false
            ) { // If element and next element should be on the same line
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

        return <div key={key} className={`question${element.type ? " " + element.type : ""}`}>
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
            {newElements.length > 0 && <div className={`sub-elements${element.noNewLine ? " no-new-line" : ""}`}> {
                newElements.map((subElement: any, index: number) => surveyItem(subElement, index))
            }</div>}
        </div>
    }

    console.log("render")

    return <div className="summary">
        {(survey.title && survey.showTitle !== false) && <p className="title">{survey.title}</p>}
        {(survey.description && survey.showTitle !== false) && <p className="description">{survey.description}</p>}
        {survey.pages.map((page: any, index: number) => surveyItem(page, index))}
    </div>
}

export default Summary;