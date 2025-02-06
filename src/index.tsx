import { createRoot } from 'react-dom/client';
import App from './App';

import ConfigProvider from '@context/Config';
import Methods from '@context/Methods';

import performScript from '@utils/performScript';

window.onerror = err => {
    performScript('onJsError', String(err));
};

const root = createRoot(document.querySelector('#app') as HTMLElement);
root.render(
    <ConfigProvider>
        <Methods />
        <App />
    </ConfigProvider>
);