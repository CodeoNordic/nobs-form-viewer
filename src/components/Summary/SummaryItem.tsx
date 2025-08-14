import { useConfigState } from "@context/Config";
import { HistoryItem } from "./History";
import { useEffect, useState } from "react";
import performScript from "@utils/performScript";
import { evaluateLogic } from "./evaluateLogic";

interface SummaryItemProps {
    element: any;
    answers: any;
    answerHistory?: any;
}

const SummaryItem: FC<SummaryItemProps> = ({ element, answers, answerHistory }) => {
    const [config, setConfig] = useConfigState() as State<Form.Config>; // Config is always available in summary
    let newElements: any[] = []; 
    const [answer, setAnswer] = useState(answers[element.name]);

    useEffect(() => {
        setAnswer(answers[element.name]);
    }, [answers, element.name]);
    
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

    if ((element.choices || element.type == "text" || element.type == "matrix") && !answer && config.hideUnanswered == true) return null;

    const checkForAnswers = (elements: any) => {
        return elements.some((subElement: any) => {
            if (answers[subElement.name] != undefined) {
                return true;
            } else if (subElement.elements) {
                return checkForAnswers(subElement.elements);
            } else {
                return false;
            }
        });
    }

    // Check if any subelements of the panel or page have answers
    if (newElements.length > 0 && config.hideUnanswered) {
        const hasAnswers = checkForAnswers(newElements);
        if (!hasAnswers) return null;
    }

    const hasTitle = element.titleLocation != "hidden" && 
        (
            (element.type != undefined && element.type != "panel") || 
            (element.title != undefined && (element.title as string).trim() != "")
        );

    // If there are no answers, no title and no sub-elements, return null
    // Disabled for now, needs testing if needed
    // if (!answer && newElements.length == 0 && !hasTitle) return null;

    const answerDataObj = JSON.parse(config.answerData || "{}");
    
    if (element.visibleIf) {
        if (!evaluateLogic(element.visibleIf, answerDataObj)) return null;
    }

    const canEdit = config.summaryEditable && (
        !!element.enableIf ?
        evaluateLogic(element.enableIf, answerDataObj) :
        true
    );

    const isRequired = !!element.requiredIf ? (
        evaluateLogic(element.requiredIf, answerDataObj)
    ) : !!element.isRequired;

    const triggers = JSON.parse(config.value || "{}").triggers || {};

    console.log(triggers)

    return (
        <div className={`question${element.type ? " " + element.type : ""}`}>
            <div className="question-content">
                {hasTitle ? (
                    <p className="question-title">{!element.elements 
                        ? (element.titleLocation == "hidden"
                            ? "" 
                            : element.title 
                                ? element.title + ":" 
                                : element.name + ":"
                        ) : element.title ?? element.title
                    }{isRequired && <span className="required">*</span>}</p>
                ) : (isRequired && <span className="required">*</span>)}
                {(element.inputType == "color" && answer) && <div className="color-box" style={{ backgroundColor: answer }}></div>}
                {(element.inputType == "range" && answer) && <p className="question-answer">{answer}%</p>}
                {element.type == "boolean" && <p className="question-answer">
                    {answer ? (config.locale == "no" ? "Ja" : "Yes") : (config.locale == "no" ? "Nei" : "No")}
                </p>}
                {((element.type == "text" || element.type == "comment") && element.inputType == undefined) && (canEdit ? <textarea
                    ref={el => {
                        if (el) {
                            el.style.height = "auto";
                            el.style.height = (el.scrollHeight - 4) + "px";
                        }
                    }}
                    rows={1}
                    value={answer || ""}
                    className="question-answer text-input"
                    onChange={(e) => {
                        setAnswer(e.target.value);
                        e.target.style.height = "auto";
                        e.target.style.height = `${e.target.scrollHeight - 4}px`;
                    }}
                    onBlur={() => {
                        if (answer !== answers[element.name]) {
                            const answerData = JSON.parse(config.answerData || "{}");
                            const newAnswerData = {
                                ...answerData,
                                [element.name]: answer
                            };
                            
                            setConfig({
                                ...config,
                                answerData: JSON.stringify(newAnswerData)
                            });
                            
                            if (config.scriptNames?.onChange) {
                                performScript("onChange", { 
                                    result: newAnswerData,
                                    hasErrors: false
                                });
                            }
                        }
                    }}
                /> : <p className="question-answer">{answer || " "}</p>)}
                {(element.inputType !== "color" 
                    && element.inputType !== "range"
                    && element.type !== "boolean" 
                    && element.type !== "imagepicker"
                    && element.type !== "comment"
                    && typeof answer !== "object" 
                    && answer != undefined
                    && !((element.type == "text" 
                        || element.type == "comment"
                    ) && element.inputType == undefined)
                ) && <p className="question-answer">{
                    answer
                }</p>}
            </div>
            {element.type == "imagepicker" && answer && 
                <img src={answer} alt={answer} className="image" />
            }
            {(element.type == "file" && answer != undefined) && answer.map((answer: any) =>
                <img key={answer.name} src={answer.content} alt={answer.name} className="image" />
            )}
            {element.type == "multipletext" && <div className="multipletext-container">
                {element.items?.map((item: any, index: number) =>
                    <div key={index} className="multipletext-item">
                        <p className="question-title">{item.name}:</p> {
                            canEdit ? <textarea
                                ref={el => {
                                    if (el) {
                                        el.style.height = "auto";
                                        el.style.height = (el.scrollHeight - 4) + "px";
                                    }
                                }}
                                rows={1}
                                value={answer?.[index]?.value || ""}
                                className="question-answer text-input"
                                onChange={(e) => {
                                    setAnswer((prev: any[]|undefined) => {
                                        const newAnswers = [...(prev ?? element.items.map(() => ({ value: "" })))];
                                        newAnswers[index].value = e.target.value;
                                        return newAnswers;
                                    });
                                    e.target.style.height = "auto";
                                    e.target.style.height = `${e.target.scrollHeight - 4}px`;
                                }}
                                onBlur={() => {
                                    if (answer !== answers[element.name]) {
                                        const answerData = JSON.parse(config.answerData || "{}");
                                        const newAnswerData = {
                                            ...answerData,
                                            [element.name]: {
                                                ...(answerData[element.name] || {}),
                                                [item.name]: answer?.[index]?.value
                                            }
                                        };
                                        
                                        setConfig({
                                            ...config,
                                            answerData: JSON.stringify(newAnswerData)
                                        });

                                        if (config.scriptNames?.onChange) {
                                            performScript("onChange", { 
                                                result: newAnswerData,
                                                hasErrors: false
                                            });
                                        }
                                    }
                                }}
                            /> : <p className="question-answer">{answer?.[index]?.value || " "}</p>
                        }
                    </div>
                )}
            </div>}
            {element.type == "matrixdynamic" && <div>
                <div className="column-header">
                    <div className="row-header"></div> {/* Empty div for the first column */}
                    {element.columns.map((column: any, index: number) => 
                        <div key={index}><p>{column.text ?? column.title ?? column.name ?? column}</p></div>
                    )}
                </div>
                {answer?.map((row: any, index: number) => {
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
                    {element.columns.map((_: any, index: number) =>
                        <div key={index} className="column"/>
                    )}
                </div>}
            </div>}
            {(element.type == "matrix" || element.type == "matrixdropdown") && <div>
                <div className="column-header">
                    <div className="row-header"></div> {/* Empty div for the first column */}
                    {element.columns.map((column: any, index: number) =>
                        <div key={index}><p>{column.text ?? column.title ?? column.name ?? column}</p></div>
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
                            const ans = answer?.[rowName]?.[colName];

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
            {(answerHistory.some((item: any) => item.answer != undefined)) &&
                <HistoryItem 
                    answerHistory={answerHistory} 
                    elementName={element.name}
                />
            }
            {newElements.length > 0 && <div className={`sub-elements${element.noNewLine ? " no-new-line" : ""}`}> {
                newElements.map((subElement: any, index: number) => 
                    <SummaryItem 
                        key={index} 
                        element={subElement} 
                        answers={answers} 
                        answerHistory={answerHistory || undefined}
                    />
                )}
            </div>}
        </div>
    );
}

export default SummaryItem;