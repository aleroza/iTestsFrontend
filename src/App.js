import React, {useEffect, useState,} from 'react'

import {
    AdaptivityProvider,
    AppRoot,
    Avatar,
    Badge,
    Button,
    Card,
    ConfigProvider,
    ContentCard,
    Div,
    FormItem,
    FormLayout,
    Group,
    Input,
    ModalPage,
    ModalPageHeader,
    ModalRoot,
    ScreenSpinner,
    Separator,
    SimpleCell,
    Snackbar,
    Switch,
    View,
} from '@vkontakte/vkui'

import {Icon16Done, Icon24DoorArrowLeftOutline,} from '@vkontakte/icons'

import bridge from '@vkontakte/vk-bridge'


import router from './router'
import Home from "./panels/Home";
import Testing from "./panels/Testing";
import Admin from "./panels/Admin";
import axios from "axios";
import {createTest, updateTest} from "./backend-api";
import QuestionsAndStuff from "./panels/QuestionsAndStuff";

function App() {
    const [scheme, setScheme] = useState(null)
    const [activePanel, setActivePanel] = useState('home')
    const [activeTest, setActiveTest] = useState(null)
    const [activeModal, setActiveModal] = useState(null)
    const [popout, setPopout] = useState(<ScreenSpinner size='large'/>);
    //TODO нормальные попапы сделать, чтобы он пропадал только после получения ответа
    //const [nextpopout, nextsetPopout] = useReducer((bolval) => {if (bolval) return(<ScreenSpinner size='large'/>) else return null}, <ScreenSpinner size='large'/>);
    const [snackbar, setSnackbar] = useState(null)
    const [urlParams, setUrlParams] = useState({})
    const [loginType, setLoginType] = useState({})
    let security = {}
    //Сделать через конст, ибо ререндер убивает наверное

    //For settings modal
    const [newTest, setNewTest] = useState({})
    const [prevTest, setPrevTest] = useState({})
    const [saveBadge, setSaveBadge] = useState(null)
    const [imageValid, setImageValid] = useState(true)


    const parseQueryString = () => {
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
        setUrlParams(queryObject)
    };

    const fetchLoginType = async () => {
        const user = await bridge.send("VKWebAppGetUserInfo");
        let owner = {...user, isGroup: false, name: user.first_name + " " + user.last_name, isAdmin: true}
        if (urlParams.vk_group_id) {
            //TODO мутки с параметрами для перехода на список тестов пользователя
            owner = await bridge.send("VKWebAppGetGroupInfo", {"group_id": parseInt(urlParams.vk_group_id)})
            owner = {...owner, isGroup: true, isAdmin: (['admin', 'editor'].includes(urlParams.vk_viewer_group_role))}
        }
        setLoginType({...loginType, user, owner})
    }

    useEffect(() => {
        if (Object.keys(urlParams).length !== 0) {
            fetchLoginType()
        }
    }, [urlParams])

    useEffect(() => {
        parseQueryString()

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
                    case 'preview_modal':
                        break
                    case 'settings_modal':
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

        return () => {
            routerUnsubscribe()
            bridge.unsubscribe(themeUpdateHandler)
        }
    }, [])

    const declOfNum = (n, titles) => {
        return titles[(n % 10 === 1 && n % 100 !== 11) ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2]
    }

    const openSnackbar = (text) => {
        if (snackbar) return null;
        setSnackbar(
            <Snackbar
                onClose={() => setSnackbar(null)}
                before={<Avatar size={24} style={{background: 'var(--accent)'}}><Icon16Done fill="#fff" width={14}
                                                                                            height={14}/></Avatar>}
            >
                {text}
            </Snackbar>
        );
    }

    //Checking validation checks
    useEffect(() => {
        let validationRes = Array.from(document.getElementsByClassName('validateMe')).map(element => !element.classList.contains('FormItem--error'))
        if (document.getElementById('validateImg')) validationRes.push(!(document.getElementById('validateImg').classList.contains('imagePending')))
        validationRes.push(!(JSON.stringify(newTest) === JSON.stringify(prevTest)))
        if (!validationRes.every(Boolean)) {
            setSaveBadge(null)
        } else {
            setSaveBadge(<Badge mode="prominent"/>)
        }
    }, [newTest, prevTest, imageValid])


//TODO Отделить логику модалок от App
    const modal = (
        <ModalRoot
            activeModal={activeModal}
            onClose={() => {
                // console.log(router.history)
                router.closeModal({cutHistory: true})
            }}
        >
            <ModalPage
                id="preview_modal"
            >
                {router.getState().params.test ? (() => {
                    const test = router.getState().params.test
                    const attemptsLeft = (test.result ? test.result.attemptsLeft : test.numberOfAttempts)
                    return (
                        <ContentCard
                            disabled
                            header={test.title}
                            image={test.image}
                            // TODO описания с переносом строки
                            text={test.description}
                            caption={
                                <div className='preview_modal_div'
                                     style={{display: 'flex', justifyContent: 'space-between'}}>
                                    <div>
                                        {`${test.numberOfQuestions} ${declOfNum(test.numberOfQuestions, ['вопрос', 'вопроса', 'вопросов'])}`}
                                        <br/>
                                        {test.numberOfAttempts !== -1 ? attemptsLeft < 0 ? "" : `${attemptsLeft} ${declOfNum(attemptsLeft, ['попытка', 'попытки', 'попыток'])}` : null}
                                    </div>
                                    <div>
                                        {/*FIXME Кнопки съезжают при экстра-маленькой ширине экрана*/}
                                        <Button
                                            mode="secondary"
                                            size="l"
                                            disabled={test.numberOfAttempts !== -1 && attemptsLeft === 0}
                                            before={<Icon24DoorArrowLeftOutline/>}
                                            onClick={() => {
                                                router.go('testing', {
                                                    testID: test._id,
                                                    firstRun: !Boolean(test.result)
                                                })
                                            }}
                                        >Пройти тест</Button>
                                        {/*<Button*/}
                                        {/*    style={{marginLeft: '10px'}}*/}
                                        {/*    mode="secondary"*/}
                                        {/*    size="l"*/}
                                        {/*    before={<Icon24Linked/>}*/}
                                        {/*    onClick={() => {*/}
                                        {/*        //TODO копирование ссылки https://github.com/VKCOM/vk-router#buildurl*/}
                                        {/*        // отдельные кнопки на копирование и поделиться? или нафиг во*/}
                                        {/*        // bridge.send("VKWebAppShare", {"link": "https://vk.com/app6909581#hello"}).then(() => {*/}
                                        {/*        bridge.send("VKWebAppCopyText", {"text": "Этот текст будет скопирован в буфер обмена."}).then(() => {*/}
                                        {/*            router.closeModal({cutHistory:true})*/}
                                        {/*            openSnackbar("Ссылка скопирована!")*/}
                                        {/*        })*/}
                                        {/*    }}*/}
                                        {/*/>*/}
                                    </div>

                                </div>
                            }
                        />)
                })() : null}
            </ModalPage>

            <ModalPage
                id="settings_modal"

                header={
                    <ModalPageHeader
                        // onClick={()=>console.log(router.getHistory())}
                        right={<Button disabled={saveBadge === null} mode='tertiary' before={saveBadge}
                                       onClick={() => {
                                           if (newTest._id === undefined) {
                                               createTest(newTest, security).then(() => {
                                                   router.closeModal({cutHistory: true})
                                                   openSnackbar('Тест добавлен!')
                                               })
                                           } else {
                                               updateTest(newTest, security).then(() => {
                                                   setPrevTest(newTest)
                                                   openSnackbar('Тест изменен!')
                                               })
                                           }
                                       }}
                        >
                            Сохранить</Button>}
                    >
                        Настройки теста
                    </ModalPageHeader>
                }
            >
                {router.getState().params.test ? (() => {
                    if (prevTest !== router.getState().params.test) {
                        setNewTest(router.getState().params.test)
                        setPrevTest(router.getState().params.test)
                    }
                    //console.log(newTest)
                    return (
                        <Group>
                            {/*TODO подумать над смишнявым текстом плейсхолдеров*/}
                            <Div>
                                <Button mode='secondary' disabled={newTest._id === undefined} size='m' stretched
                                        onClick={() =>
                                            router.go('questions_and_stuff')
                                        }
                                >Вопросы и результаты</Button>
                            </Div>
                            <FormLayout
                                id="form"
                                onSubmit={e => e.preventDefault()}>
                                <FormItem
                                    top="ID">
                                    <Input disabled defaultValue={newTest._id || 'Создание нового теста'}/>
                                </FormItem>

                                <FormItem className='validateMe' status={newTest.title ? '' : 'error'} top="Название">
                                    <Input
                                        onChange={(e) => {
                                            //TODO Вынести изменение стейта в одну функцию, как здесь https://vkcom.github.io/VKUI/#formitem
                                            setNewTest({...newTest, title: e.target.value.trim()})

                                        }} defaultValue={newTest.title}
                                        placeholder={""}/>
                                </FormItem>

                                <FormItem className='validateMe' status={newTest.description ? '' : 'error'}
                                          top="Описание">
                                    <Input onChange={(e) => {
                                        setNewTest({...newTest, description: e.target.value.trim()})

                                    }}
                                           defaultValue={newTest.description} placeholder={""}/>
                                </FormItem>

                                <FormItem className='validateMe' id='validateImg' top="Обложка"
                                          status={newTest.image && imageValid ? '' : 'error'}
                                >
                                    {/*TODO Придумать, как сделать инпут справа от картинки без схлопывания оной*/}
                                    <Card>
                                        <div id="testImg" style={{
                                            height: 129,
                                            backgroundRepeat: 'no-repeat',
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            borderRadius: 'inherit',
                                            overflow: 'hidden',
                                            backgroundImage: `url("${newTest.image}")`
                                        }}/>
                                    </Card>
                                    <Input
                                        style={{marginTop: '8px'}} defaultValue={newTest.image} placeholder={""}
                                        onChange={(e) => {
                                            //For Mixed-Content
                                            const link = e.target.value.trim().replace('http://', 'https://')
                                            document.getElementById('validateImg').classList.add("imagePending");
                                            document.getElementById("testImg").style.backgroundImage = `url("${link}")`
                                            //TODO сделать репитер на бэке для обхода CORS https://github.com/axios/axios/issues/853
                                            // либо натыкать курл
                                            axios.head(link)
                                                .then((res) => {
                                                        if (res.status === 200) {
                                                            setImageValid(true)
                                                            setNewTest({...newTest, image: link})
                                                        } else setImageValid(false)
                                                    }
                                                )
                                                .catch((res) => setImageValid(false))
                                                .finally(() => document.getElementById('validateImg').classList.remove("imagePending"))
                                        }}/>
                                </FormItem>

                                <FormItem top="Количество попыток" bottom={"-1 — неограниченные попытки"}>
                                    <Input type='number' min='-1'
                                           onChange={(e) => {
                                               setNewTest({...newTest, numberOfAttempts: parseInt(e.target.value)})
                                           }}
                                           defaultValue={newTest.numberOfAttempts || -1} placeholder={""}/>
                                </FormItem>

                                <SimpleCell
                                    onClick={(e) => {
                                        if (e.isTrusted && ["[object HTMLHeadingElement]", "[object HTMLInputElement]", "[object HTMLDivElement]"].includes(e.target.toString())) {
                                            if (newTest.numberOfQuestions === 0) {
                                                openSnackbar("Прежде чем открывать тест, сохраните его и добавьте вопросы")
                                            } else {
                                                document.getElementById('isActiveSwitch').click()
                                                setNewTest({...newTest, isActive: !newTest.isActive})
                                            }

                                        }
                                    }
                                    } after={<Switch id='isActiveSwitch' defaultChecked={newTest.isActive}/>}>Тест
                                    открыт?</SimpleCell>

                                {/*<SimpleCell onClick={(e) => {*/}
                                {/*    if (e.isTrusted && ["[object HTMLHeadingElement]","[object HTMLInputElement]", "[object HTMLDivElement]"].includes(e.target.toString())) {*/}
                                {/*        document.getElementById('showAnswersSwitch').click()*/}
                                {/*        setNewTest({...newTest, showAnswers: !newTest.showAnswers})*/}
                                {/*        */}
                                {/*    }*/}
                                {/*}} after={<Switch id='showAnswersSwitch' defaultChecked={newTest.showAnswers}/>}>Показывать*/}
                                {/*    правильный вариант?</SimpleCell>*/}


                                <Separator/>

                            </FormLayout>
                            {snackbar}
                        </Group>
                    )
                })() : null}
            </ModalPage>
        </ModalRoot>
    )


    const sharedState = {
        activePanel,
        urlParams,
        loginType,
        security,
        activeTest, setActiveTest,
        activeModal, setActiveModal,
        setPopout,
        snackbar, openSnackbar,
        declOfNum,
        newTest, setNewTest
    }

    return (
        <ConfigProvider scheme={scheme}>
            <AdaptivityProvider>
                <AppRoot>
                    <View
                        activePanel={activePanel} modal={modal} popout={popout}
                    >
                        <Home id='home' sharedState={sharedState}/>
                        <Testing id='testing' sharedState={sharedState}/>
                        <Admin id='admin' sharedState={sharedState}/>
                        <QuestionsAndStuff id='questions_and_stuff' sharedState={sharedState}/>
                        {/*TODO Возможность прямого перехода на тест*/}
                        {/*TODO ВОЗМОЖНОСТЬ ПРЯМОГО ПЕРЕХОДА НА СПИСОК ТЕСТОВ КОНКРЕТНОГО ПОЛЬЗОВАТЕЛЯ*/}
                    </View>
                </AppRoot>
            </AdaptivityProvider>
        </ConfigProvider>
    )
}

export default App;