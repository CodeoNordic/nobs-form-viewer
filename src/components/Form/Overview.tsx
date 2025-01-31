import { useConfigState } from "@context/Config";
import { useMemo } from "react";

const Overview: FC = () => {
    const [config, setConfig] = useConfigState();

    if (!config) return null;

    const survey = useMemo(() => {
        const jsonData = JSON.parse(config.value!);

        console.log(jsonData);
    }, [config.value]);

    return <div>

    </div>
}

export default Overview;