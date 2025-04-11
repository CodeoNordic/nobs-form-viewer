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

                newAnswers[question.name] = answer;
            } else if (question.type == "matrixdynamic") { // Different from normal matrix
                let answer: { [key: string]: any }[] = []; // TODO: Empty answer looking weird

                jsonAnswers[question.name].map((ans: any, index: number) => {
                    answer.push({});
                    Object.keys(ans).forEach((key: any) => {
                        if (ans[key] == "other") {
                            answer[index][key] = ans[`${key}-Comment`];
                        } else if (key.endsWith("-Comment")) {
                        } else {
                            answer[index][key] = ans[key];
                        }
                    })
                })

                newAnswers[question.name] = answer;
            } else if (question.type == "file") { // Image (TODO: Consider adding more testing)
                newAnswers[question.name] = jsonAnswers[question.name];
            } else if (question.type == "imagepicker") {
                newAnswers[question.name] = question.choices.find((choice: any) => {
                    return choice.value === jsonAnswers[question.name];
                }).imageLink;
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
            } else if (question.type == "text") {
                if (question.inputType == "date") { // Date input
                    newAnswers[question.name] = new Date(jsonAnswers[question.name]).toLocaleDateString(config.locale, { year: 'numeric', month: '2-digit', day: '2-digit' });
                } else if (question.inputType == "datetime-local") { // Time input
                    newAnswers[question.name] = new Date(jsonAnswers[question.name]).toLocaleTimeString(config.locale, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
                } else if (question.inputType == "week") { // Number input
                    newAnswers[question.name] = (config.locale === "no" ? "Uke " : "Week ") + jsonAnswers[question.name].split("-W")[1] + ", " + jsonAnswers[question.name].split("-W")[0];
                } else {
                    newAnswers[question.name] = jsonAnswers[question.name];
                }
            } else if (question.type == "boolean") {
                newAnswers[question.name] = jsonAnswers[question.name] ? (config.locale == "no" ? "Ja" : "Yes") : (config.locale == "no" ? "Nei" : "No");
            } else if (question.type == "multipletext") {
                let answer: { [key: string]: any }[] = [];

                question.items.map((item: any) => {
                    const itemName = item.title ?? item.name ?? item;

                    console.log(itemName, jsonAnswers[question.name][item.name ?? item]);

                    answer.push({
                        name: itemName,
                        value: jsonAnswers[question.name][item.name ?? item]
                    });
                })

                newAnswers[question.name] = answer;
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

        return <div key={key} className={`question${element.type ? " " + element.type : ""}`}>
            <div style={{ display: "flex" }}>
                {(element.titleLocation != "hidden" && element.title != "" && element.type != undefined) && (
                    <p>{!element.elements 
                        ? (element.titleLocation == "hidden"
                            ? "" 
                            : element.title 
                                ? element.title + ":" 
                                : element.name + ":"
                        ) : element.title ?? element.title
                    }</p>
                )}
                {(element.inputType == "color" && answers[element.name]) && <div className="color-box" style={{ backgroundColor: answers[element.name] }}></div>}
                {(element.inputType == "range" && answers[element.name]) && <p>{answers[element.name]}%</p>}
                {(element.inputType !== "color" 
                    && element.inputType !== "range" 
                    && element.type !== "imagepicker"
                    && typeof answers[element.name] !== "object" 
                    && answers[element.name] != undefined
                ) && <p>{
                    answers[element.name]
                }</p>}
            </div>
            {element.type == "imagepicker" && answers[element.name] && 
                <img src={answers[element.name]} alt={answers[element.name]} className="image" />
            }
            {(element.type == "file" && answers[element.name] != undefined) && answers[element.name].map((answer: any) =>
                <img key={answer.name} src={answer.content} alt={answer.name} className="image" />
            )}
            {element.type == "multipletext" && <div className="multipletext">
                {answers[element.name]?.map((answer: any, index: number) => 
                    <p key={index} className="multipletext-item">{answer.name}: {answer.value}</p>
                )}
            </div>}
            {element.type == "matrixdynamic" && <div>
                <div className="column-header">
                    <div></div> {/* Empty div for the first column */}
                    {element.columns.map((column: any, index: number) =>
                        <div key={index}><p>{column.text ?? column.title ?? column.name ?? column}</p></div>
                    )}
                </div>
                {answers[element.name]?.map((row: any, index: number) => {
                    return <div key={index} className="row">
                        <div className="row-header">
                            <p>{index + 1}</p>
                        </div>
                        {element.columns.map((column: any, index: number) => {
                            const colName = column.name ?? column.value ?? column;
                            const ans = row[colName];

                            return <div key={index} className="column">
                                <p className={typeof ans === "boolean" ? "crossmark" : ""}>{
                                    ans 
                                        ? typeof ans === "boolean" ? "X" : ans
                                        : ""
                                }</p>
                            </div>
                        })}
                    </div>
                }) ?? <div className="row">
                    <div className="row-header">
                        <p>1</p>
                    </div>
                    {element.columns.map((column: any, index: number) =>
                        <div key={index} className="column"/>
                    )}
                </div>}
            </div>}
            {(element.type == "matrix" || element.type == "matrixdropdown") && <div>
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
            </div>}
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