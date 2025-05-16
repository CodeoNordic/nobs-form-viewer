import { useConfig } from "@context/Config";

interface SummaryItemProps {
    element: any;
    answers: any;
}

const SummaryItem: FC<SummaryItemProps> = ({ element, answers }) => {
    const config = useConfig();
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

    const checkForAnswers = (answers: any, elements: any) => {
        return elements.some((subElement: any) => {
            if (subElement.type == "text" || subElement.type == "matrix") {
                return answers[subElement.name] != undefined;
            } else if (subElement.elements) {
                return checkForAnswers(answers, subElement.elements);
            } else {
                return false;
            }
        });
    }

    if (newElements.length > 0 && config?.hideUnanswered) {
        const hasAnswers = checkForAnswers(answers, newElements);
        console.log("hasAnswers", hasAnswers, newElements);

        if (!hasAnswers) return null;
    }


    return (
        <div className={`question${element.type ? " " + element.type : ""}`}>
            <div style={{ 
                display: "flex", 
                alignItems: "center",
            }}>
                {(element.titleLocation != "hidden" && element.title != "" && element.type != undefined && (element.type != "panel" || element.title)) && (
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
                    {element.columns.map((_: any, index: number) =>
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
                newElements.map((subElement: any, index: number) => 
                    <SummaryItem 
                        key={index} 
                        element={subElement} 
                        answers={answers} 
                    />
                )}
            </div>}
        </div>
    );
}

export default SummaryItem;