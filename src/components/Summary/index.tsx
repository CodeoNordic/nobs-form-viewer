import { useConfig } from "@context/Config";
import { useMemo } from "react";
import SummaryItem from "./SummaryItem";
import extractAnswers from "./extractAnswers";

const Summary: FC = () => {
    const config = useConfig();

    if (!config) return null;

    const survey = JSON.parse(config.value!);

    const answers = useMemo(() => {
        const jsonAnswers = JSON.parse(config.answerData || '{}');

        const newAnswers = extractAnswers(jsonAnswers, survey, config);

        return newAnswers;
    }, [config.answerData, survey]);

    return <div className="summary">
        {config.header && <div className="header">
            {config.header.leftColumn && <div className="header-left">
                <p className="navn">{config.header.leftColumn.navn}</p>
                <p className="født-kjønn">
                    Født: {config.header.leftColumn.født}, Kjønn: {config.header.leftColumn.kjønn}
                </p>
                <p className="adresse">{config.header.leftColumn.adresse}</p>
                <p className="telefon">Telefon: {config.header.leftColumn.telefon}</p>
            </div>}
            {config.header.rightColumn && <div className="header-right">
                <p className="ordrenummer">{config.header.rightColumn.ordrenummer}</p>
                <p className="ordredato">Ordredato: <strong>{config.header.rightColumn.ordredato}</strong></p>
                <p className="type">{config.header.rightColumn.type}</p>
                <p className="ortopediingeniør">Ortopediingeniør: <strong>{config.header.rightColumn.ortopediingeniør}</strong></p>
                <p className="prodansvarlig">Prod. ansvarlig: {config.header.rightColumn.prodansvarlig}</p>
            </div>}
        </div>}
        {(survey.title && survey.showTitle !== false) && <p className="title">{survey.title}</p>}
        {(survey.description && survey.showTitle !== false) && <p className="description">{survey.description}</p>}
        {survey.pages.map((page: any, index: number) => {
            return <SummaryItem key={index} element={page} answers={answers} />;
        })}
        {config.footer && <div className="footer">
            {config.footer.top && <div className="footer-top">
                <p>Pasientopplysninger og behandlingsrisiko</p>
                <div className="footer-top-left">
                    <div className="høyde-vekt">
                        <div>
                            <p className="høyde">Høyde: {config.footer.top.høyde}</p>
                        </div>
                        <div>
                            <p className="vekt">Vekt: {config.footer.top.vekt}</p>
                        </div>
                    </div>
                    <div className="skadeside-skadetype-gipslager">
                        <div>
                            <p className="skadeside">Skadeside: {config.footer.top.skadeside}</p>
                        </div>
                        <div>
                            <p className="skadetype">Skadetype: {config.footer.top.skadetype}</p>
                        </div>
                        <div>
                            <p className="gipslager">Gipslager: {config.footer.top.gipslager}</p>
                        </div>
                    </div>
                </div>
                <div className="footer-top-right">
                    <div>
                        <p className="behandlingsrisiko">Beh. risiko {config.footer.top.behandlingsrisiko}</p>
                    </div>
                    <div>
                        <p className="kommunikasjonsbehov">Kom. behov {config.footer.top.kommunikasjonsbehov}</p>
                    </div>
                    <div>
                        <p className="sted">Sted: {config.footer.top.sted}</p>
                    </div>
                </div>
            </div>}
            {config.footer.bottom && <div className="footer-bottom">
                <p>Prøving og levering</p>
                <div>
                    <div>
                        <p className="timeavtaler">Timeavtaler ordre {config.footer.bottom.timeavtaler}</p>
                    </div>
                    <div>
                        <p className="prøvedato">Prøvedato {config.footer.bottom.prøvedato}</p>
                    </div>
                    <div>
                        <p className="planlagtLevering">Planlagt levering {config.footer.bottom.planlagtLevering}</p>
                    </div>
                </div>
                <div className="checkboxes">
                    <div className="checkboxes-top">
                        <div className="checkbox ingeniør">
                            <input type="checkbox" checked={config.footer.bottom.ingeniør} readOnly />
                            <p>Ingeniør</p>
                        </div>
                        <div className="checkbox skoklinikk">
                            <input type="checkbox" checked={config.footer.bottom.skoklinikk} readOnly />
                            <p>Skoklinikk</p>
                        </div>
                    </div>
                    <div className="checkbox send-post">
                        <input type="checkbox" checked={config.footer.bottom.sendPost} readOnly />
                        <p>Send med posten</p>
                    </div>
                    <div className="checkboxes-middle">
                        <div className="checkbox brev">
                            <input type="checkbox" checked={config.footer.bottom.brev} readOnly />
                            <p>Brev</p>
                        </div>
                        <div className="checkbox ring">
                            <input type="checkbox" checked={config.footer.bottom.ring} readOnly />
                            <p>Ringes</p>
                        </div>
                        <div className="checkbox sms">
                            <input type="checkbox" checked={config.footer.bottom.sms} readOnly />
                            <p>SMS</p>
                        </div>
                    </div>
                    <div className="checkboxes-bottom">
                        <div className="checkbox innlevert-luka">
                            <input type="checkbox" checked={config.footer.bottom.innlevertLuka} readOnly />
                            <p>Innlevert i luka</p>
                        </div>
                        <div className="checkbox tilsendt-post">
                            <input type="checkbox" checked={config.footer.bottom.tilsendtPost} readOnly />
                            <p>Tilsendt per post</p>
                        </div>
                    </div>
                </div>
            </div>}
        </div>}
    </div>
}

export default Summary;