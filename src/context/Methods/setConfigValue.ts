import { useCreateMethod } from '@utils/createMethod';
import { useConfigState } from '@context/Config';
import set from 'lodash.set';

const typeMap: Array<(v: any) => any> = [
    v => (typeof v === 'string') ? v : JSON.stringify(v), // JSONString = 1
    v => Number(v), // JSONNumber = 2
    v => (typeof v === 'object' && !Array.isArray(v)) ? v : {}, // JSONObject = 3
    v => Array.isArray(v) ? v : [], // JSONArray = 4
    v => Boolean(v), // JSONBoolean = 5
    () => null // JSONNull = 6
];

const useSetConfigValue = () => {
    const [, setConfig] = useConfigState();

    useCreateMethod('setConfigValue|setConfigProp', (k: string, v: any, dataType?: number) => setConfig(prev => {
        if (!prev) return null;
        const copy = { ...prev };

        if (typeof dataType === 'number') {
            const setter = typeMap[dataType - 1];
            setter && (v = setter(v));
        }

        set(copy, k, v);
        window._config = copy;

        return copy;
    }));
}

export default useSetConfigValue;