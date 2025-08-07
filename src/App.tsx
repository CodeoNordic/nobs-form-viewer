import { default as buildPDF, Resolution } from 'react-to-pdf';
import Form from '@components/index';

import { useCreateMethod } from '@utils/createMethod';
import { useRef } from 'react';

import performScript from '@utils/performScript';

const App: FC = () => {
    const targetRef = useRef<HTMLDivElement|null>(null);

    // Handle PDF generation
    useCreateMethod('generatePDF', () => {
        if (!targetRef.current) return;

        const copy = targetRef.current.cloneNode(true) as HTMLDivElement;
        document.body.appendChild(copy);
        copy.classList.add('pdf-root');

        buildPDF(() => copy, {
            method: 'build',
            resolution: Resolution.MEDIUM,
            page: {
                format: 'A4',
                orientation: 'portrait'
            }
        }).then(pdf => {
            const blob = pdf.output('blob');
            
            const reader = new FileReader();

            // This function runs when the reader has finished converting the PDF to base64
            reader.onloadend = () => {
                if (typeof reader.result !== 'string')
                    return console.error(`Reader result was not a string: ${reader.result}`);
                else
                    performScript('onPDF', reader.result);

                copy.remove();
            }

            reader.readAsDataURL(blob);
        });
    }, [targetRef]);

    return <div ref={targetRef}>
        <Form />
    </div>
}

export default App;