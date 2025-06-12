import { useConfig, useConfigState } from "@context/Config";
import { useEffect, useRef, useState } from "react";
import History from 'jsx:@svg/history.svg';

export const HistoryItem: FC<{ answerHistory: any, elementName: string }> = ({ answerHistory, elementName }) => {
    const config = useConfig();
    const [answerHistoryOpen, setAnswerHistoryOpen] = useState(false);
    const itemRef = useRef<HTMLDivElement>(null);

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

    if (!(answerHistory.some((item: any) => item.answers[elementName] != undefined))) return null;

    return <div className={"answer-history" + (answerHistoryOpen ? " open" : "")} ref={itemRef}>
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
                        const answer = history.answers[elementName];
                        const next = answerHistory[index + 1]?.answers[elementName];
                        
                        if (answer === next) return null;

                        return <li key={index}>
                            <span>{history.user}</span>
                            <span>•</span>
                            <span>{answer ? answer : (config?.locale === "no" ? "slettet svaret" : "deleted answer")}</span>
                            {history.timestamp && <><span>•</span><span className="time-ago">{
                                new Date(history.timestamp).toLocaleString(config?.locale || "en-US", {
                                    dateStyle: "short",
                                    timeStyle: "short"
                                })    
                            }</span></>}
                        </li>
                    })}
                </ul>
            </div>
        )}
    </div>
}

export const HistoryList: FC<{ sortedHistory: any }> = ({ sortedHistory }) => {
    const [config, setConfig] = useConfigState();
    const [historyOpen, setHistoryOpen] = useState(false);
    const [viewingChanges, setViewingChanges] = useState(false);
    const [answerData, setAnswerData] = useState<any>(null);

    if (!config) return null;

    return <div className="change-history">
        {!historyOpen ? (
            <button
                className="change-history__badge"
                aria-label="Show change history"
                onClick={() => setHistoryOpen(!historyOpen)}
            >
                {config.locale === "no" ? "Endringshistorikk" : "Changes history"} ({sortedHistory.length})
            </button>
        ) : (
            <div className="change-history__panel">
                <button
                    className="change-history__close"
                    onClick={() => {
                        setHistoryOpen(false);
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
                    {sortedHistory.map((h: any, index: number) => (
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
                                    <span className="timestamp">
                                        {new Date(h.timestamp).toLocaleString(config.locale || 'en-US', {
                                            dateStyle: 'short',
                                            timeStyle: 'short',
                                        })}
                                    </span>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        )}
    </div>
}