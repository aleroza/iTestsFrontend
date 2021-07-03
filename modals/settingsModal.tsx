import {
    Button,
    Card,
    Div,
    FormItem,
    FormLayout,
    Group,
    Input, ModalPage,
    ModalPageHeader, Separator,
    SimpleCell,
    Switch
} from "@vkontakte/vkui";
import axios from "axios";
import React, {useState} from "react";

//For settings modal
const [newTest, setNewTest] = useState({})
const [prevTest, setPrevTest] = useState({})
const [saveBadge, setSaveBadge] = useState(null)
const [imageValid, setImageValid] = useState(true)

const SettingsModal = () => (
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
                </Group>
            )
        })() : null}
    </ModalPage>
)

export default SettingsModal