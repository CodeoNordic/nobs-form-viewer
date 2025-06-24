import { createContext, useContext, useEffect, useState } from 'react';
import { loadCallbacks } from '@utils/performScript';
import { warn } from '@utils/log';

const defaultConfig: Partial<Form.Config> = {
    type: 'viewer',
    locale: 'no',
    compact: false,
    style: 'default',
    hideUnanswered: false,
    summaryEditable: true,
};

// Parses the JSON from FileMaker into a readable config
const parseConfig = (cfg: string = '{}') => {
    try {
        const config = JSON.parse(cfg) as Form.Config;

        Object.keys(defaultConfig).forEach((key) => {
            (config as RSAny)[key] ??= defaultConfig[key as keyof Form.Config];
        });

        return config;
    } catch(err) {
        console.error(err);
    }
}

// Runs any script that was attempted called before the config was loaded
const runLoadCallbacks = () => loadCallbacks.length && loadCallbacks.forEach(cb => {
    cb();
    loadCallbacks.splice(loadCallbacks.indexOf(cb), 1);
});

// FileMaker may call init before useEffect can assign the function
// This acts as a failsafe
window.init = cfg => {
    const parsedConfig = parseConfig(cfg);
    if (!parsedConfig) return;

    window._config = parsedConfig;
    runLoadCallbacks();
};

// Validates the config object every time it's set or updated
const validateConfig = (config: any): Form.Config => {
    const validTypes = ['viewer', 'summary'];
    const validLocales = ['en', 'no'];

    const validatedConfig = { ...defaultConfig, ...config };
  
    // Validate 'type'
    if (!validTypes.includes(validatedConfig.type)) {
      warn(`Invalid form type "${validatedConfig.type}", defaulting to "${defaultConfig.type}"`);
      validatedConfig.type = defaultConfig.type;
    }
  
    // Validate 'locale'
    if (!validLocales.includes(validatedConfig.locale)) {
      warn(`Invalid locale "${validatedConfig.locale}", defaulting to "${defaultConfig.locale}"`);
      validatedConfig.locale = defaultConfig.locale;
    }

    if (config.value) {
        try {
            JSON.parse(config.value);
        } catch (e) {
            warn("Failed to parse form value, will start with empty form.", e);
            validatedConfig.value = '';
        }
    }
    
    if (config.answerData) {
        try {
            JSON.parse(config.answerData);
        } catch (e) {
            warn("Failed to parse answer data, will start with empty data.", e);
            validatedConfig.answerData = '';
        }
    }

    if (config.style && !['minimal', 'default'].includes(config.style)) {
        warn(`Invalid style "${config.style}", defaulting to "${defaultConfig.style}"`);
        validatedConfig.style = defaultConfig.style;
    }

    if (config.hideUnanswered && typeof config.hideUnanswered !== 'boolean') {
        warn(`Invalid hideUnanswered "${config.hideUnanswered}", defaulting to "${defaultConfig.hideUnanswered}"`);
        validatedConfig.hideUnanswered = defaultConfig.hideUnanswered;
    }

    // Add additional validation
  
    return validatedConfig;
  };

const ConfigContext = createContext<State<Form.Config|null>>([null, () => {}]);
const ConfigProvider: FC = ({ children }) => {
    const [config, setConfigState] = useState<Form.Config | null>(null);

    // Validate before setting
    const setConfig = (newConfig: React.SetStateAction<Form.Config | null>) => {
        setConfigState((prevConfig) => {
            const updatedConfig = typeof newConfig === 'function' ? newConfig(prevConfig) : newConfig;
            return updatedConfig ? validateConfig(updatedConfig) : null;
        });
    };

    useEffect(() => {
        if (window._config !== undefined) setConfig(window._config);

        window.init = cfg => {
            const parsedConfig = parseConfig(cfg);
            if (!parsedConfig) return;

            window._config = parsedConfig;
            setConfig(parsedConfig);

            runLoadCallbacks();
        }
    }, []);

    // Update window._config upon change
    useEffect(() => {
        window._config = config || undefined;
    }, [config]);

    //if (!config) return null;
    return <ConfigContext.Provider value={[config, setConfig]}>
        {children}
    </ConfigContext.Provider>
}

export const useConfig = () => {
    const [config] = useContext(ConfigContext);
    return config;
}

export const useConfigState = () => {
    const ctx = useContext(ConfigContext);
    return ctx;
}

export default ConfigProvider;