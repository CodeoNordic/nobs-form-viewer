import { useConfig } from "@context/Config";

const Header: FC = () => {
    const config = useConfig();

    if (!config?.header) return null;

    return (
        <div className="header">
            <div className="header-left">
                <p className="navn">{config.header.navn}</p>
                <p className="født-kjønn">
                    Født: {config.header.fodt}, Kjønn: {config.header.kjonn}
                </p>
                <p className="adresse">{config.header.adresse}</p>
                <p className="telefon">Telefon: {config.header.telefon}</p>
            </div>
            <div className="header-right">
                <p className="ordrenummer">{config.header.ordrenummer}</p>
                <p className="ordredato">Ordredato: <strong>{config.header.ordredato}</strong></p>
                <p className="type">{config.header.type}</p>
                <p className="ortopediingenior">Ortopediingeniør: <strong>{config.header.ortopediingenior}</strong></p>
                <p className="prodansvarlig">Prod. ansvarlig: <strong>{config.header.prodansvarlig}</strong></p>
            </div>
        </div>
    )
}

export default Header;