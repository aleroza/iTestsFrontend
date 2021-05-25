import React from 'react';
import {Button, Panel, PanelHeader, PanelHeaderBack} from '@vkontakte/vkui';

import persik from '../img/persik.png';
import './Persik.css';
import router from "../router";


function Persik({id}) {
    return (
        <Panel id={id}>
            <PanelHeader
                left={<PanelHeaderBack onClick={() => router.back()}/>}
            >
                Persik
            </PanelHeader>
            <img className="Persik" src={persik} alt="Persik The Cat"/>
        </Panel>
    );
}


export default Persik;