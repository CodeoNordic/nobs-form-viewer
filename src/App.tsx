import { useConfig } from '@context/Config';
import FormViewer from '@components/Viewer';
import { warn } from '@utils/log';

const Form: FC = () => {
	const config = useConfig();

	if (!config) return null;

	if (!config.value) {
		warn('No form value provided, cannot render form.');
		return null;
	}

	return (
		<div className={`formviewer ${config.compact ? 'compact' : ''}`}>
			<FormViewer />
		</div>
	);
};

export default Form;
