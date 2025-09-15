import { default as buildPDF, Resolution } from 'react-to-pdf';
import Form from '@components/index';

import { useCreateMethod } from '@utils/createMethod';
import { useRef } from 'react';

import performScript from '@utils/performScript';

const App: FC = () => {
	return (
		<div>
			<Form />
		</div>
	);
};

export default App;
