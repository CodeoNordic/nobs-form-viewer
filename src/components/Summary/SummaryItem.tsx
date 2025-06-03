import { useConfig } from "@context/Config";
import { getTimeAgo } from "@utils/timeAgo";
import { useEffect, useRef, useState } from "react";
import History from 'jsx:@svg/history.svg';

interface SummaryItemProps {
    element: any;
    answers: any;
    answerHistory?: any;
}

const SummaryItem: FC<SummaryItemProps> = ({ element, answers, answerHistory }) => {
    const config = useConfig();
    let newElements: any[] = []; 
    const [answerHistoryOpen, setAnswerHistoryOpen] = useState(false);
    const itemRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        if (!answerHistoryOpen) return;

        const handleClick = (e: MouseEvent) => {
            const target = e.target as Node;
            if (
                itemRef.current &&
                !itemRef.current.contains(target)
            ) {
                setAnswerHistoryOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClick);

        return () => {
            document.removeEventListener("mousedown", handleClick);
        };
    }, [answerHistoryOpen]);


    if ((element.choices || element.type == "text" || element.type == "matrix") && !answers[element.name] && config?.hideUnanswered == true) return null;

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
    if (newElements.length > 0 && config?.hideUnanswered) {
        const hasAnswers = checkForAnswers(newElements);
        if (!hasAnswers) return null;
    }

    const hasTitle = element.titleLocation != "hidden" && 
        (
            (element.type != undefined && element.type != "panel") || 
            (element.title != undefined && (element.title as string).trim() != "")
        );

    // If there are no answers, no title and no sub-elements, return null
    if (!answers[element.name] && newElements.length == 0 && !hasTitle) {
        return null;
    }

    return (
        <div className={`question${element.type ? " " + element.type : ""}`}>
            <div className="question-content">
                {hasTitle && (
                    <p className="question-title">{!element.elements 
                        ? (element.titleLocation == "hidden"
                            ? "" 
                            : element.title 
                                ? element.title + ":" 
                                : element.name + ":"
                        ) : element.title ?? element.title
                    }</p>
                )}
                {(element.inputType == "color" && answers[element.name]) && <div className="color-box" style={{ backgroundColor: answers[element.name] }}></div>}
                {(element.inputType == "range" && answers[element.name]) && <p className="question-answer">{answers[element.name]}%</p>}
                {(element.inputType !== "color" 
                    && element.inputType !== "range" 
                    && element.type !== "imagepicker"
                    && typeof answers[element.name] !== "object" 
                    && answers[element.name] != undefined
                ) && <p className="question-answer">{
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
                    <div className="row-header"></div> {/* Empty div for the first column */}
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
                    {element.columns.map((_: any, index: number) =>
                        <div key={index} className="column"/>
                    )}
                </div>}
            </div>}
            {(element.type == "matrix" || element.type == "matrixdropdown") && <div>
                <div className="column-header">
                    <div className="row-header"></div> {/* Empty div for the first column */}
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
            {(answerHistory.some((item: any) => item.answers[element.name] != undefined)) &&
                <div className={"answer-history" + (answerHistoryOpen ? " open" : "")} ref={itemRef}>
                    {!answerHistoryOpen ? (
                        <button className="answer-history__open" onClick={() => setAnswerHistoryOpen(true)}>
                            <History />
                        </button>
                    ) : (
                        <div className="answer-history__panel">
                            <button className="answer-history__close" onClick={() => setAnswerHistoryOpen(false)}>
                                {config?.locale === "no" ? "Lukk" : "Close"}
                            </button>
                            <ul>
                                {answerHistory.map((history: any, index: number) => {
                                    const answer = history.answers[element.name];
                                    const next = answerHistory[index + 1]?.answers[element.name];
                                    
                                    if (answer === next) return null;

                                    return <li key={index}>
                                        <span>{history.user}</span>
                                        <span>•</span>
                                        <span>{answer ? answer : (config?.locale === "no" ? "slettet svaret" : "deleted answer")}</span>
                                        {history.timestamp && <><span>•</span><span className="time-ago">{getTimeAgo(history.timestamp)}</span></>}
                                    </li>
                                })}
                            </ul>
                        </div>
                    )}
                </div>
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