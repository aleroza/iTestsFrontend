import React, {useEffect, useState,} from 'react'

import {
    AdaptivityProvider,
    AppRoot,
    Avatar,
    Button,
    ConfigProvider,
    ContentCard,
    Div,
    ModalPage,
    ModalRoot,
    ScreenSpinner,
    Snackbar,
    View,
} from '@vkontakte/vkui'

import {Icon16Done, Icon24DoorArrowLeftOutline, Icon24Linked,} from '@vkontakte/icons'

import bridge from '@vkontakte/vk-bridge'


import router from './router'
import Home from "./panels/Home";
import Persik from "./panels/Persik";
import Testing from "./panels/Testing";

function App() {
    const [scheme, setScheme] = useState(null)
    const [activePanel, setActivePanel] = useState('home')
    const [tests, setTests] = useState([])
    const [activeTest, setActiveTest] = useState(null)
    const [activeModal, setActiveModal] = useState(null)
    const [popout, setPopout] = useState(<ScreenSpinner size='large'/>);
    const [snackbar, setSnackbar] = useState(null)
    const [urlParams, setUrlParams] = useState({})
    const [loginType, setLoginType] = useState({})
    let security = {}
    const sharedState = {
        urlParams,
        loginType,
        security,
        tests,
        setTests,
        activeTest,
        setActiveTest,
        activeModal,
        setActiveModal,
        setPopout,
        snackbar,
        setSnackbar,
    }

    const parseQueryString = async () => {
        const queryObject = window.location.search.slice(1).split('&')
            .map((queryParam) => {
                let kvp = queryParam.split('=');
                return {key: kvp[0], value: kvp[1]}
            })
            .reduce((query, kvp) => {
                query[kvp.key] = kvp.value;
                return query
            }, {})

        security = queryObject
        await setUrlParams(queryObject);
        fetchLoginType()
    };

    const fetchLoginType = () => {
        const group = bridge.send("VKWebAppGetGroupInfo", {"group_id": parseInt(urlParams.vk_group_id)})
        setLoginType({...loginType, group})
    }

    useEffect(() => {
        parseQueryString()
            // .then(() => fetchLoginType())
            // .then(() => {
            //     console.log(urlParams)
            //     console.log(loginType)
            // })
        console.log(urlParams)
        console.log(loginType)


        const routerUnsubscribe = router.subscribe(({toState}) => {
            let routerStatePage = toState.page

            let index = routerStatePage.indexOf('.')
            if (index !== -1) {
                routerStatePage = routerStatePage.substring(0, index)
            }

            setActivePanel(routerStatePage)

            if (toState.modal != null) {
                let nextActiveModal = toState.modal.substring(toState.page.indexOf('.') + 1)

                switch (nextActiveModal) {
                    case 'preview_page':
                        break
                    default:
                        nextActiveModal = null
                }

                setActiveModal(nextActiveModal)
            } else {
                setActiveModal(null)
            }

        })


        const themeUpdateHandler = ({detail: {type, data}}) => {
            if (type !== 'VKWebAppUpdateConfig') {
                return
            }

            setScheme(data.scheme)
        }
        bridge.subscribe(themeUpdateHandler)
        bridge.send('VKWebAppInit')

        return () => {
            routerUnsubscribe()
            bridge.unsubscribe(themeUpdateHandler)
        }
    }, [])

    const declOfNum = (n, titles) => {
        return titles[(n % 10 === 1 && n % 100 !== 11) ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2]
    }

    const openLinkSnackbar = () => {
        if (snackbar) return null;
        setSnackbar(
            <Snackbar
                onClose={() => setSnackbar(null)}
                before={<Avatar size={24} style={{background: 'var(--accent)'}}><Icon16Done fill="#fff" width={14}
                                                                                            height={14}/></Avatar>}
            >
                Ссылка скопирована
            </Snackbar>
        );
    }


    const modal = (
        <ModalRoot
            activeModal={activeModal}
            onClose={router.back}
        >
            <ModalPage
                id="preview_page"
            >
                {router.getState().params.test ? (() => {
                    const test = router.getState().params.test

                    return (
                        <Div>
                            <ContentCard
                                disabled
                                header={test.title}
                                image={test.image}
                                text={test.description}
                                caption={
                                    <div className='preview_page_div'
                                         style={{display: 'flex', justifyContent: 'space-between'}}>
                                        {`${test.numberOfQuestions} ${declOfNum(test.numberOfQuestions, ['вопрос', 'вопроса', 'вопросов'])}`}
                                        <div>
                                            {/*FIXME Кнопки съезжают при экстра-маленькой ширине экрана*/}
                                            <Button

                                                mode="secondary"
                                                size="l"
                                                before={<Icon24DoorArrowLeftOutline/>}
                                                onClick={() => {
                                                    router.go('testing', {testID: test._id, firstRun: (test.results)})
                                                }}
                                            >Пройти тест</Button>
                                            <Button
                                                style={{marginLeft: '10px'}}
                                                mode="secondary"
                                                size="l"
                                                before={<Icon24Linked/>}
                                                onClick={() => {
                                                    //TODO копирование ссылки https://github.com/VKCOM/vk-router#buildurl
                                                    bridge.send("VKWebAppCopyText", {"text": "Этот текст будет скопирован в буфер обмена."}).then(() => {
                                                        router.back()
                                                        openLinkSnackbar()
                                                    })
                                                }}
                                            />
                                        </div>

                                    </div>
                                }
                            />
                        </Div>)
                })() : null}
            </ModalPage>
        </ModalRoot>
    )

    return (
        <ConfigProvider scheme={scheme}>
            <AdaptivityProvider>
                <AppRoot>
                    <View
                        activePanel={activePanel} modal={modal} popout={popout}
                    >
                        <Home id='home' sharedState={sharedState}/>
                        <Persik id='persik'/>
                        <Testing id='testing' sharedState={sharedState}/>
                    </View>
                </AppRoot>
            </AdaptivityProvider>
        </ConfigProvider>
    )
}

export default App;