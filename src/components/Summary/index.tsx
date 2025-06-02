import { useConfigState } from "@context/Config";
import { useEffect, useMemo, useState } from "react";
import SummaryItem from "./SummaryItem";
import extractAnswers from "./extractAnswers";
import Footer from "./Footer";
import Header from "./Header";
import { getTimeAgo } from "@utils/timeAgo";

const Summary: FC = () => {
    const [vcOpen, setVcOpen] = useState(false);
    const [viewingChanges, setViewingChanges] = useState(false);
    const [answerData, setAnswerData] = useState<string | null>(null);
    const [config, setConfig] = useConfigState();
    const [sortedHitory, setSortedHistory] = useState<any[]>([]);
    const [sortedAnswerHistory, setSortedAnswerHistory] = useState<any>([]);

    useEffect(() => {
        if (config && config.answers && config.answers.length > 0) {
            const sortedHistory = [...config.answers].sort((a, b) => {
                const dateA = new Date(a.timestamp || 0);
                const dateB = new Date(b.timestamp || 0);
                return dateB.getTime() - dateA.getTime();
            });

            const answers = sortedHistory.map((h) => {
                const jsonAnswers = JSON.parse(h.answer || '{}');

                return extractAnswers(jsonAnswers, JSON.parse(config.value!), config);
            });

            let answerHistoryFull = {} as Record<string, any[]>; 
            
            answers.map((answer, index) => {
                Object.keys(answer).forEach((key) => {
                    if (!answerHistoryFull[key]) {
                        answerHistoryFull[key] = [];
                    }
                    const value = {
                        answer: answer[key],
                        timestamp: sortedHistory[index].timestamp,
                        user: sortedHistory[index].user,
                    }

                    answerHistoryFull[key].push(value);
                });
            });
            setSortedAnswerHistory(answerHistoryFull);
            setSortedHistory(sortedHistory);
        }
    }, [config]);

    if (!config) return null;

    const survey = JSON.parse(config.value!);

    const answers = useMemo(() => {
        const jsonAnswers = JSON.parse(config.answerData || '{}');

        if (!jsonAnswers || Object.keys(jsonAnswers).length === 0 && config.oldData) {
            Object.keys(config.oldData).forEach((key, index) => {
                jsonAnswers[key] = config.oldData[key].value;
            })
        }

        const newAnswers = extractAnswers(jsonAnswers, survey, config);

        return newAnswers;
    }, [config.answerData, survey]);

    return <div className={"summary" + (config.style ? " " + config.style : "")}>
        <Header />
        <div className="summary__content">
            {(survey.title && survey.showTitle !== false) && <p className="title">{survey.title}</p>}
            {(survey.description && survey.showTitle !== false) && <p className="description">{survey.description}</p>}
            {survey.pages.map((page: any, index: number) => 
                <SummaryItem key={index} element={page} answers={answers} answerHistory={sortedAnswerHistory} />
            )}
            {sortedHitory.length > 0 && (
                <div className="change-history">
                    {!vcOpen ? (
                        <button
                            className="change-history__badge"
                            aria-label="Show change history"
                            onClick={() => setVcOpen(!vcOpen)}
                        >
                            {config.locale === "no" ? "Endringshistorikk" : "Changes history"} ({sortedHitory.length})
                        </button>
                    ) : (
                        <div className="change-history__panel">
                            <button
                                className="change-history__close"
                                onClick={() => {
                                    setVcOpen(false);
                                    setViewingChanges(false);
                                    setAnswerData(null);

                                    const newAnswerData = answerData || config.answerData;
                                    setConfig((prev): any => ({
                                        ...prev,
                                        answerData: newAnswerData,
                                    }));
                                }}
                            >
                                {config.locale === 'no' ? 'Lukk' : 'Close'}
                            </button>
                            {viewingChanges && (
                                <button
                                    className="change-history__close"
                                    onClick={() => {
                                        setViewingChanges(false);
                                        setAnswerData(null);

                                        const newAnswerData = answerData || config.answerData;
                                        setConfig((prev): any => ({
                                            ...prev,
                                            answerData: newAnswerData,
                                        }));
                                    }}
                                >
                                    {config.locale === 'no' ? 'Stopp visning av endringer' : 'Stop viewing changes'}
                                </button>
                            )}
                            
                            <ul>
                                {sortedHitory.map((h, index) => (
                                    <li
                                        key={index}
                                        onClick={() => {
                                            !answerData && setAnswerData(config.answerData || null);
                                            setConfig((prev): any => ({
                                                ...prev,
                                                answerData: h.answer,
                                            }));
                                            setViewingChanges(true);
                                        }}
                                    >
                                        <div className="meta">
                                            <span className="user">{h.user}</span>{' '}
                                            {h.timestamp && (
                                                getTimeAgo(h.timestamp)
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
        <Footer />
    </div>

    /**
     * source pro font
    */
}

export default Summary;