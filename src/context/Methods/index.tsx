import useSetConfigValue from './setConfigValue';

// The purpose of applying the window methods in a react component is to be able to access e.g the config context
const Methods: FC = ({ children }) => {
    useSetConfigValue();

    return <>{children}</>;
}

export default Methods;