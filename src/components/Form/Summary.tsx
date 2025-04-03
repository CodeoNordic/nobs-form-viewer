import { useConfig } from "@context/Config";
import { useMemo } from "react";

const Summary: FC = () => {
    const config = useConfig();

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
            } else if (question.type == "matrix" || question.type == "matrixdropdown") { // Matrix question, with rows and columns
                let answer: { [key: string]: any } = {};

                console.log(question)
                console.log(jsonAnswers[question.name])

                question.rows.map((row: any) => {
                    const rowName = row.name ?? row.value ?? row
                    answer[rowName] = {};

                    question.columns.map((column: any) => {
                        const colName = column.name ?? column.value ?? column;
                        const ans = jsonAnswers[question.name]

                        if (ans[rowName]?.[colName] || ans[rowName] == colName) {
                            answer[rowName][colName] = ans[rowName][colName] ?? ans[rowName] == colName;
                        }
                    })
                })

                console.log(question)
                console.log(jsonAnswers[question.name])
                console.log(answer)

                newAnswers[question.name] = answer;
            } else if (question.type == "matrixdynamic") { // Different from normal matrix
                let answer: { [key: string]: any } = {};

                console.log(question)
                console.log(jsonAnswers[question.name])

                question.columns.map((column: any) => {
                    jsonAnswers[question.name].map((ansCol: any) => {
                        
                    })
                })
            } else if (question.type == "file") { // Image (TODO: Consider adding more testing)
                newAnswers[question.name] = jsonAnswers[question.name];
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

        if ((element.choices || element.type == "text" || element.type == "matrix") && !answers[element.name] && config?.hideUnanswered == true) return null;

        if (element.type == "matrix" || element.type == "matrixdropdown" || element.type == "matrixdynamic") {
            return <div key={key} className={`question ${element.type}`}>
                <div className="column-header">
                    <div></div> {/* Empty div for the first column */}
                    {element.columns.map((column: any, index: number) =>
                        <div key={index}><p>{column.text ?? column.name ?? column}</p></div>
                    )}
                </div>
                {element.rows.map((row: any, index: number) => {
                    const rowName = row.name ?? row.value ?? row;
                    const rowTitle = row.text ?? row.name ?? row;

                    return <div key={index} className="row">
                        <div className="row-header">
                            <p>{rowTitle}</p>
                        </div>
                        {element.columns.map((column: any, index: number) => {
                            const colName = column.name ?? column.value ?? column;
                            const ans = answers[element.name]?.[rowName]?.[colName];

                            return <div key={index} className="column">
                                <p className={typeof ans === "boolean" ? "crossmark" : ""}>{ans 
                                    ? typeof ans === "boolean" 
                                        ? "X" : ans 
                                    : ""}
                                </p>
                            </div>
                        })}
                    </div>
                })}
            </div>
        }

        return <div key={key} className={`question${element.type ? " " + element.type : ""}`}>
            {((element.titleLocation != "hidden" && element.title != "" && element.type != undefined) || answers[element.name]) && (
                <p>{!element.elements 
                    ? (element.titleLocation == "hidden"
                        ? "" 
                        : element.title 
                        ? element.title + ": " 
                        : element.name + ": "
                    ) + (
                        (typeof answers[element.name] !== "object" && answers[element.name] != undefined) ? answers[element.name] : ""
                    ) : element.title ?? element.title
                }</p>
            )}
            {(element.type == "file" && answers[element.name] != undefined) && answers[element.name].map((answer: any) =>
                <img key={answer.name} src={answer.content} alt={answer.name} className="image" />
            )}
            {newElements.length > 0 && <div className={`sub-elements${element.noNewLine ? " no-new-line" : ""}`}> {
                newElements.map((subElement: any, index: number) => surveyItem(subElement, index))
            }</div>}
        </div>
    }

    return <div className="summary">
        {(survey.title && survey.showTitle !== false) && <p className="title">{survey.title}</p>}
        {(survey.description && survey.showTitle !== false) && <p className="description">{survey.description}</p>}
        {survey.pages.map((page: any, index: number) => surveyItem(page, index))}
    </div>
}

export default Summary;