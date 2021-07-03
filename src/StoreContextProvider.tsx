import React, {createContext, useReducer, useState} from "react";
import {ScreenSpinner} from "@vkontakte/vkui";


//FIXME херня, переделать
const initialState = {
    activeModal: null, setActiveModal:{},
    activePanel: 'home', setActivePanel:{}
};

const Store = (children: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined) => {
    const [activeModal, setActiveModal] = useState(null)
    const [activePanel, setActivePanel] = useState('home')
    const [activeTest, setActiveTest] = useState(null)
    const [popout, setPopout] = useState(<ScreenSpinner size='large'/>);
    //TODO нормальные попапы сделать, чтобы он пропадал только после получения ответа
    //const [nextpopout, nextsetPopout] = useReducer((bolval) => {if (bolval) return(<ScreenSpinner size='large'/>) else return null}, <ScreenSpinner size='large'/>);
    const [snackbar, setSnackbar] = useState(null)
    const [urlParams, setUrlParams] = useState({})
    const [loginType, setLoginType] = useState({})
    let security = {}
    //Сделать через конст, ибо ререндер убивает наверное




    return (
        <Context.Provider value={{activeModal, setActiveModal, activePanel, setActivePanel}}>
            {children}
        </Context.Provider>
    )
};

export const Context = createContext(initialState);
export default Store;