import { useConfigState } from "@context/Config";
import { useEffect, useMemo, useState } from "react";

const Overview: FC = () => {
    const [config, setConfig] = useConfigState();
    const [questions, setQuestions] = useState<any[]>([]);
    const [answerText, setAnswerText] = useState<any>({});

    if (!config) return null;

    const survey = useMemo(() => {
        const jsonData = JSON.parse(config.value!);

        console.log(jsonData);

        return jsonData;
    }, [config.value]);

    const answers = useMemo(() => {
        const jsonData = JSON.parse(config.answerData || '{}');

        console.log(jsonData);

        return jsonData;
    }, [config.answerData]);

    useEffect(() => {
        if (!answers || !questions) return;

        let newAnswers = {} as any;

        questions.forEach((question) => {
            if (!answers[question.name]) {
            } else if (question.choices) {
                const choice = question.choices.find((choice: any) => {
                    if (typeof choice === "string") {
                        return choice === answers[question.name]
                    } else {
                        return choice.value === answers[question.name]
                    }
                });

                newAnswers[question.name] = typeof choice === "string" ? choice : choice.text
            } else {
                newAnswers[question.name] = answers[question.name];
            }
        });

        setAnswerText(newAnswers)
    }, [answers, questions]);

    const getNestedQuestions = (elements: any[]) => {
        let questions: any[] = [];

        elements.forEach((el) => { 
            if (el.elements) {
                questions = questions.concat(getNestedQuestions(el.elements));
            } else {
                questions.push(el);
            } 
        });

        return questions;
    };

    useEffect(() => {
        if (!survey) return;
        const newQuestions: any[] = [];

        survey.pages.forEach((page: any) => {
            newQuestions.push(...getNestedQuestions(page.elements));
        });

        setQuestions(newQuestions);
    }, [survey]);

    console.log(questions);

    return <div className="overview">
        {questions.map((question, index) => {
            return <div key={index}>
                <p>{question.title ? question.title + ": " : ""}{answerText[question.name]}</p>
            </div>
        })}
    </div>
}

export default Overview;