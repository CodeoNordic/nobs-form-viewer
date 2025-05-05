import { useConfig } from "@context/Config";

const Footer: FC = () => {
    const config = useConfig();

    if (!config?.footer) return null;

    return (
        <div className="footer">
            <div className="footer-top">
                <p className="title">Pasientopplysninger og behandlingsrisiko</p>
                <div className="content flex">
                    <div className="flex">
                        <div className="grid">
                            <p className="hoyde"><span>Høyde</span><span>{config.footer.hoyde}</span></p>
                            <p className="vekt"><span>Vekt</span><span>{config.footer.vekt}</span></p>
                        </div>
                        <div className="grid">
                            <p className="skadeside"><span>Skadeside</span><span>{config.footer.skadeside}</span></p>
                            <p className="skadetype"><span>Skadetype</span><span>{config.footer.skadetype}</span></p>
                            <p className="gipslager"><span>Gipslager</span><span>{config.footer.gipslager}</span></p>
                        </div>
                    </div>
                    <div className="grid">
                        <p className="behandlingsrisiko"><span>Beh. risiko</span><span>{config.footer.behandlingsrisiko}</span></p>
                        <p className="kommunikasjonsbehov"><span>Kom. behov</span><span>{config.footer.kommunikasjonsbehov}</span></p>
                        <p className="sted"><span>Sted:</span><span>{config.footer.sted}</span></p>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p className="title">Prøving og levering</p>
                <div className="content flex">
                    <div className="grid">
                        <p className="timeavtaler"><span>Timeavtaler ordre</span><span>{config.footer.timeavtaler}</span></p>
                        <p className="provedato"><span>Prøvedato</span><span>{config.footer.provedato}</span></p>
                        <p className="planlagtLevering"><span>Planlagt levering</span><span>{config.footer.planlagtLevering}</span></p>
                    </div>
                    <div className="checkboxes">
                        <div className="checkbox-wrapper">
                            <div className="checkbox ingenior">
                                <input type="checkbox" checked={!!config.footer.ingenior} readOnly />
                                <p>Ingeniør</p>
                            </div>
                            <div className="checkbox skoklinikk">
                                <input type="checkbox" checked={!!config.footer.skoklinikk} readOnly />
                                <p>Skoklinikk</p>
                            </div>
                        </div>
                        <div className="checkbox send-post">
                            <input type="checkbox" checked={!!config.footer.sendPost} readOnly />
                            <p>Send med posten</p>
                        </div>
                        <div className="checkbox-wrapper">
                            <div className="checkbox brev">
                                <input type="checkbox" checked={!!config.footer.brev} readOnly />
                                <p>Brev</p>
                            </div>
                            <div className="checkbox ring">
                                <input type="checkbox" checked={!!config.footer.ring} readOnly />
                                <p>Ringes</p>
                            </div>
                            <div className="checkbox sms">
                                <input type="checkbox" checked={!!config.footer.sms} readOnly />
                                <p>SMS</p>
                            </div>
                        </div>
                        <div className="checkbox-wrapper">
                            <div className="checkbox innlevert-luka">
                                <input type="checkbox" checked={!!config.footer.innlevertLuka} readOnly />
                                <p>Innlevert i luka</p>
                            </div>
                            <div className="checkbox tilsendt-post">
                                <input type="checkbox" checked={!!config.footer.tilsendtPost} readOnly />
                                <p>Tilsendt per post</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Footer;