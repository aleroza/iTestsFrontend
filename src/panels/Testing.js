import {getTestData} from "../backend-api";
import React, {useEffect, useState} from "react";
import {
    Alert,
    Button,
    FormItem,
    FormLayout,
    Gradient,
    Group,
    Panel,
    PanelHeader,
    PanelHeaderClose,
    Radio,
    ScreenSpinner,
    Separator,
    Text,
    Title,
    useAdaptivity,
    ViewWidth
} from "@vkontakte/vkui";
import router from "../router";

const Testing = ({id, sharedState}) => {
    const deb = () => {
        debugger;
    }

    const [testData, setTestData] = useState({})
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [finishStatus, setFinishStatus] = useState(false)
    const [score, setScore] = useState(0)
    const testID = router.getState().params.testID
    const {viewWidth} = useAdaptivity();
    const isDesktop = viewWidth >= ViewWidth.SMALL_TABLET;

    useEffect(() => {
        //TODO Запрос на вычитание колва попыток
        console.log(testID, router.getState().params.firstRun)
        setScore(0)
        sharedState.setPopout(<ScreenSpinner size='large'/>)
        fetchTestData().then(() => sharedState.setPopout(null))
        console.log(testData)

        history.pushState(null, null, location.href)
        window.addEventListener('popstate', preventLeaving)
        window.addEventListener('beforeunload', preventLeaving)
        return () => {
            window.removeEventListener('popstate', preventLeaving);
            window.removeEventListener('beforeunload', preventLeaving);
        };

    }, [])

    const fetchTestData = async () => {
        if (Object.keys(testData).length === 0) {
            getTestData(testID).then(res => setTestData(res))
        }
    }

    const preventLeaving = (e) => {
        if (!finishStatus) {
            // console.log(e)
            e.preventDefault();
            e.returnValue = '';
            history.pushState(null, null, location.href)
            openExitAlert()
        } else null
        /*
        FIXME
         Почему-то перезагрузка и кнопка назад блокируются даже после завершения теста.
         Отзыв ивентлистнера не помог. Вынести результаты на отдельную страницу?
         */
        /*
        FIXME
         Лол, а эта хрень вообще работает в приложении?
         */

    }

    const openExitAlert = () => {
        if (!finishStatus) {
            sharedState.setPopout(
                <Alert
                    actions={[{
                        title: 'Выйти',
                        mode: 'destructive',
                        autoclose: true,
                        action: () => {
                            router.go('home')
                        },
                    }, {
                        title: 'Отмена',
                        autoclose: true,
                        mode: 'cancel'
                    }]}
                    onClose={() => sharedState.setPopout(null)}
                    header="Подтвердите действие"
                    text="Вы уверены, что хотите прервать прохождение теста?"
                />
            );
        }
    }

    const checkAnswer = (e) => {
        //TODO Добавить aftertext
        e.preventDefault()
        const choice = parseInt(e.target.elements.radio.value)
        const right = testData.questions[currentQuestion].truth
        // console.log(e)
        document.querySelectorAll('.radio').forEach(item => {
            item.children[0].disabled = true
        })
        document.getElementById('submit_btn').disabled = true
        if (right === choice) {
            setScore(score + 1)
            document.getElementById('radio' + right).nextElementSibling.children[1].style.color = 'green'

        } else {
            document.getElementById('radio' + right).nextElementSibling.children[1].style.color = 'green'
            document.getElementById('radio' + choice).nextElementSibling.children[1].style.color = 'red'
            // e.target[choice].parentElement.children[1].children[1].style.color = 'red'
        }
        setTimeout(() => {
            if (currentQuestion + 1 > testData.questions.length - 1) {
                setFinishStatus(true)
                // window.removeEventListener('popstate', preventLeaving);
                // window.removeEventListener('beforeunload', preventLeaving);

            } else {
                setCurrentQuestion(currentQuestion + 1)
                document.querySelectorAll('.radio').forEach(item => {
                    item.children[0].disabled = false
                    item.children[1].children[1].style.color = 'black'
                })
                document.getElementById('radio' + choice).checked = false
            }
        }, 2000)
    }

    function testBody() {
        if (!sharedState.popout && !finishStatus) {
            if (currentQuestion > testData.questions.length) setFinishStatus(true)
            const question = testData.questions[currentQuestion]

            return (
                <Group style={isDesktop ? {width: '80%', marginLeft: 'auto', marginRight: "auto"} : {}}>

                    <Title weight='regular' level='1'>{question.title}</Title>
                    <FormLayout onSubmit={e => {
                        checkAnswer(e)
                    }}>

                        <FormItem>
                            {question.options.map((item, index) => (
                                <Radio id={'radio' + index}
                                       className='radio'
                                       onClick={() => document.getElementById('submit_btn').removeAttribute('disabled')}
                                       key={'radio' + index} name='radio' value={index}>{item.option}
                                </Radio>
                            ))}
                        </FormItem>

                        <Separator/>
                        <Button id='submit_btn' mode='secondary' size="l"
                                style={{display: 'block', width: '30%', margin: 'auto', marginTop: '15px'}}
                                disabled
                        >Далее</Button>

                    </FormLayout>


                </Group>
            )

        } else {
            //TODO отправка результатов теста на сервер
            document.getElementsByClassName('vkuiPanel__in Panel__in').item(0).style.height = '100%'
            return (
                <div style={{
                    backgroundImage: `url(${testData.image})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    overflow: 'hidden',
                    height: '100%',
                    width: '100%'
                }}>
                    <Gradient style={{
                        // margin: '-7px -7px 0 -7px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        height: '100%',
                        backdropFilter: 'blur(5px)'
                    }}>

                        <Title weight='heavy' level='2'>Ваш результат — {score} из {testData.questions.length}</Title>
                        <Text weight='regular'>{testData.finals[score]}</Text>
                        <Button size='l' onClick={() => {
                            router.go('home')
                            router.history = router.history.slice(-1)

                        }} style={{marginTop: '20px', marginBottom: '10px'}}>На главную</Button>
                    </Gradient>
                </div>
            )
        }
    }

    return (
        <Panel id={id}>
            <PanelHeader onClick={() => console.log(viewWidth, ViewWidth.TABLET, isDesktop)}
                         left={<PanelHeaderClose onClick={finishStatus ? () => router.go('home') : openExitAlert}/>}
            >
                {testData.title}
            </PanelHeader>


            {Object.keys(testData).length !== 0 && testBody()}
        </Panel>
    )
}


export default Testing;