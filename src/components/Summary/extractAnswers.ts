export default function extractAnswers(answers: any, survey: any, config: any) {
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
        if (!answers[question.name]) { // No answer
        } else if (question.type == "matrix" || question.type == "matrixdropdown") { // Matrix question, with rows and columns
            let answer: { [key: string]: any } = {};

            question.rows.map((row: any) => {
                const rowName = row.name ?? row.value ?? row
                answer[rowName] = {};

                question.columns.map((column: any) => {
                    const colName = column.name ?? column.value ?? column;
                    const ans = answers[question.name]

                    if (ans[rowName]?.[colName] || ans[rowName] == colName) {
                        answer[rowName][colName] = ans[rowName][colName] ?? ans[rowName] == colName;
                    }
                })
            })

            newAnswers[question.name] = answer;
        } else if (question.type == "matrixdynamic") { // Different from normal matrix
            let answer: { [key: string]: any }[] = []; // TODO: Empty answer looking weird

            answers[question.name].map((ans: any, index: number) => {
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
            newAnswers[question.name] = answers[question.name];
        } else if (question.type == "imagepicker") {
            newAnswers[question.name] = question.choices.find((choice: any) => {
                return choice.value === answers[question.name];
            }).imageLink;
        } else if (question.choices) { // Questions with choices (radio, checkbox, etc)
            if (answers[question.name] == "other") { // Other and none does not show up as normal answers
                newAnswers[question.name] = answers[`${question.name}-Comment`];     
            } else if (answers[question.name] == "none") {
                newAnswers[question.name] = config?.locale == "no" ? "Ingen" : "None";     
            } else if (Array.isArray(answers[question.name])) { // Multiple answers
                newAnswers[question.name] = answers[question.name].map((answer: any) => {
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
                        return choice === answers[question.name];
                    } else {
                        return choice.value === answers[question.name];
                    }
                });
                if (choice) {
                    newAnswers[question.name] = typeof choice === "string" ? choice : choice.text;
                }
            }
        } else if (question.type == "text") {
            if (question.inputType == "date") {
                newAnswers[question.name] = new Date(answers[question.name]).toLocaleDateString(config?.locale, { year: 'numeric', month: '2-digit', day: '2-digit' });
            } else if (question.inputType == "datetime-local") {
                newAnswers[question.name] = new Date(answers[question.name]).toLocaleTimeString(config?.locale, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
            } else if (question.inputType == "week") { 
                newAnswers[question.name] = (config?.locale === "no" ? "Uke " : "Week ") + answers[question.name].split("-W")[1] + ", " + answers[question.name].split("-W")[0];
            } else {
                newAnswers[question.name] = answers[question.name];
            }
        } else if (question.type == "boolean") {
            newAnswers[question.name] = answers[question.name] ? (config?.locale == "no" ? "Ja" : "Yes") : (config?.locale == "no" ? "Nei" : "No");
        } else if (question.type == "multipletext") {
            let answer: { [key: string]: any }[] = [];

            question.items.map((item: any) => {
                answer.push({
                    name: item.title ?? item.name ?? item,
                    value: answers[question.name][item.name ?? item]
                });
            })

            newAnswers[question.name] = answer;
        } else { // Questions without choices (comment, number, etc)
            newAnswers[question.name] = answers[question.name];
        }
    });

    return newAnswers;
}