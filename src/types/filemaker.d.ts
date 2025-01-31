declare global {
    namespace FM {
        type Record<T = {}> = T & RSAny;

        interface DataAPIRecord<T = RSAny> {
            fieldData: T;
            modId: string;
            portalData: RSAny;
            eventId: string;
        }

        interface DataAPIResponse<T = RSAny> {
            messages: { code: string; message: string }[];

            response: {
                data: DataAPIRecord<T>[]|null;
                dataInfo: {
                    database: string;
                    foundCount: number;
                    layout: string;
                    returnedCount: number;
                    table: string;
                    totalEventCount: number;
                }
            }
        }
    }

    interface Window {
        FileMaker: {
            PerformScript(name: string, parameter?: string): void;
            PerformScriptWithOption(
                name: string,
                parameter: string,
                option: '0'|'1'|'2'|'3'|'4'|'5'
            ): void;
        }
    }
}

export {};