import { useConfigState } from "@context/Config";
import performScript from "@utils/performScript";
import { Model, Survey } from "survey-react-ui";
import { warn } from "@utils/log";
import { useMemo } from "react";
import "survey-core/i18n";
import { Serializer } from "survey-core";
import fetchFromFileMaker from "@utils/fetchFromFilemaker";

const FormViewer: FC = () => {
    const [config, setConfig] = useConfigState();

    if (!config) return null;

    // useMemo so you can choose when to re-render
    const survey = useMemo(() => {
        if (config.validateFromFileMaker && config.scriptNames?.validate) { // needs to happen before creating the survey
            Serializer.addProperty("question", {
                name: "validateFromFileMaker",
                displayName: config.locale == "en" ? "Validate from FileMaker" : "Valider fra FileMaker",
                default: false,
                visible: true,
                category: "validation",
                type: "boolean",
            });
        }

        const newSurvey = new Model(config.value);

        // Attempt to add existing answer data
        const prevData = config.answerData;
        if (prevData) {
            try {
                const data = JSON.parse(prevData);
                newSurvey.data = data;

                if (data.pageNo) {
                    newSurvey.currentPageNo = data.pageNo;
                }
            } catch (e) {
                warn("Failed to parse answer data, will start with empty data.", e);
            }
        }

        newSurvey.locale = config.locale;

        // Save answer data on answer and page change
        const saveAnswerData = (result: Model) => {
            const data = result.data;
            data.pageNo = result.currentPageNo;

            if (config.scriptNames?.onChange) {
                performScript("onChange", { result: data });
            }

            setConfig({ ...config, answerData: JSON.stringify(data) });
        }

        const validateQuestion = (_: any, options: any) => {
            console.log("TEST");
            if (
                options.question && 
                config.scriptNames?.validate && 
                options.question.validateFromFileMaker 
            ) {
                console.log("TEST2");
                fetchFromFileMaker(config.scriptNames.validate, { // TODO: cant handle async, find workaround
                    name: options.question.name,
                    value: options.value as string,
                }, undefined, true, 30000).then((res) => {
                    const data = res as {status: boolean, message?: string} | null;
                    console.log("TEST3", res);

                    if (data?.status === false && !data.message) {
                        options.error = config.locale == "en" ? "Invalid value." : "Ugyldig verdi.";
                    } else if (data?.status === false && data.message) {
                        console.log("TEST4", data.message);
                        options.error = data.message;
                    } else {
                        options.error = null;
                    }
                }).catch((e) => {
                    warn("Failed to validate question using filemaker.", e);
                    options.error = null;
                });
            }
        };

        newSurvey.onValidateQuestion.add(validateQuestion);

        newSurvey.onValueChanged.add((result) => {
            saveAnswerData(result);
        });
        
        newSurvey.onCurrentPageChanged.add((result) => {
            saveAnswerData(result);
        });

        newSurvey.onComplete.add((result) => {
            if (config.scriptNames?.onSubmit) {
                performScript("onSubmit", { result: result.data });
            }
        });
        
        return newSurvey;
    }, [config.value, config.locale, config.compact, config.scriptNames]); // Add deps that should trigger a re-render

    return <Survey model={survey} />;
}

export default FormViewer;