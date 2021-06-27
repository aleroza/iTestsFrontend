import React, {useEffect, useState} from 'react';
import {
    Alert,
    Badge,
    Button,
    Cell,
    FormItem,
    FormLayout,
    Group,
    Header,
    IconButton,
    Input,
    Panel,
    PanelHeader,
    PanelHeaderClose,
    Placeholder,
    Radio,
    Select,
    SimpleCell,
    Switch,
    Tabs,
    TabsItem
} from "@vkontakte/vkui";
import router from "../router";
import {deleteResults, getResults, getTestDataAdmin, updateTest} from "../backend-api";
import {Icon28AddOutline, Icon56AddCircleOutline} from "@vkontakte/icons";
import {ObjectID} from "bson";
import XLSX from 'xlsx';

const QuestionsAndStuff = ({id, sharedState}) => {
    const deb = () => {
        debugger;
    }

    // const [questionsAndStuff, setQuestionsAndStuff] = useState({})
    const [activeTab, setActiveTab] = useState('options')
    const [questions, setQuestions] = useState([])
    const [savedQuestions, setSavedQuestions] = useState([])
    const [saveBadge, setSaveBadge] = useState(null)
    const [downloadDisabled, setDownloadDisabled] = useState(true)

    const newOption = {_id: new ObjectID(), option: '', aftertext: ''}
    const newQuestion = {_id: new ObjectID(), question: '', options: [newOption], truth: 0}
    let timer = null

    const fetchTestData = async () => {
        getTestDataAdmin(sharedState.newTest._id, sharedState.security).then(res => {
            setSavedQuestions(res.data.questions)
            setQuestions(res.data.questions)
        })
    }

    useEffect(() => {
        fetchTestData()
            .then(() => sharedState.setPopout(null))
    }, [])

    const downloadResults = (select, zeroes) => {
        function transliterate(word) {
            const keys = {
                'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
                'е': 'e', 'ё': 'e', 'ж': 'j', 'з': 'z', 'и': 'i',
                'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
                'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
                'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh',
                'щ': 'shch', 'ы': 'y', 'э': 'e', 'ю': 'u', 'я': 'ya', ' ': '_'
            }
            return word.split("").map((char) => keys[char] || char).join("");
        }

        getResults(sharedState.newTest._id, zeroes, sharedState.security).then((res) => {
            if (res.data) {
                const format = select.options[select.selectedIndex].value
                console.log(format)
                let ws = XLSX.utils.json_to_sheet(res.data.results);
                ws['A1'].v = 'VK ID';
                ws['B1'].v = 'Баллы'
                let wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "sheet");
                let buf = XLSX.write(wb, {bookType: format, type: 'buffer'}); // generate a nodejs buffer
                let str = XLSX.write(wb, {bookType: format, type: 'binary'}); // generate a binary string in web browser
                XLSX.writeFile(wb, `results-${transliterate(sharedState.newTest.title).substr(0, 30)}--${new Date(Date.now()).toLocaleString()}.${format}`);
            } else sharedState.openSnackbar('Нет результатов для выгрузки')

        })
    }

    const resultsRender = () => {
        return (<div>
            <Group mode='plain' separator='hide' style={{display: 'flex', justifyContent: 'flex-end'}}>
                <Button mode='destructive' size='m' onClick={() => {
                    sharedState.setPopout(
                        <Alert
                            actions={[{
                                title: 'Удалить',
                                mode: 'destructive',
                                autoclose: true,
                                action: () => {
                                    deleteResults(sharedState.newTest._id, sharedState.security)
                                        .then(() => {
                                            sharedState.openSnackbar('Все результаты удалены')
                                        })
                                },
                            }, {
                                title: 'Отмена',
                                autoclose: true,
                                mode: 'cancel'
                            }]}
                            onClose={() => sharedState.setPopout(null)}
                            header="Подтвердите действие"
                            text="Удалить все ответы пользователей на тест?"
                        />)
                }
                }>Очистить результаты</Button>
            </Group>

            <Group
                separator='hide' header={<Header mode="secondary">Выгрузка результатов</Header>}>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <SimpleCell onClick={(e) => {
                        if (e.isTrusted && ["[object HTMLHeadingElement]", "[object HTMLInputElement]", "[object HTMLDivElement]"].includes(e.target.toString())) {
                            document.getElementById('addZeroes').click()
                        }
                    }} after={<Switch id='addZeroes'/>}>Добавить набравших 0 баллов?</SimpleCell>
                    <Select id='mode' placeholder={'Выберите формат вывода'} onChange={() => setDownloadDisabled(false)}
                            options={[
                                {label: '*.CSV', value: 'csv'},
                                {label: '*.XLSX (Excel)', value: 'xlsx'},
                                {label: '*.TXT', value: 'txt'},
                            ]}
                            style={{width: '80%', margin: '5px auto'}}
                    />
                    <Button
                        disabled={downloadDisabled}
                        onClick={() => {
                            downloadResults(document.getElementById('mode').nextElementSibling, document.getElementById('addZeroes').checked)
                        }}
                        style={{display: 'flex', margin: '10px auto'}} size='m'>Скачать результаты</Button>
                </div>

            </Group>
        </div>)
    }


    //Checking validation checks
    useEffect(() => {
        let validationRes = Array.from(document.getElementsByClassName('validateMe')).map(element => !element.classList.contains('FormItem--error'))
        validationRes.push(!(JSON.stringify(questions) === JSON.stringify(savedQuestions)))
        if (!validationRes.every(Boolean)) {
            setSaveBadge(null)
        } else {
            setSaveBadge(<Badge mode="prominent"/>)
        }
    }, [questions, savedQuestions])

    const questionsRender = () => {
        //TODO Переписать это под ООП
        const addQuestion = () => {
            setQuestions([...questions, newQuestion])
        }

        const addOption = (queIndex) => {
            const modifiedQuestion = {...questions[queIndex], options: [...questions[queIndex].options, newOption]}
            const modifiedList = [...questions]
            modifiedList.splice(queIndex, 1, modifiedQuestion)
            setQuestions(modifiedList)
        }

        //не робит
        const moveQuestions = (from, to) => {
            const modifiedList = [...questions]
            modifiedList.splice(to, 1, modifiedList[to])
            setQuestions(modifiedList)
        }

        const moveOptions = (queIndex, from, to) => {
            let newTruth = questions[queIndex].truth
            if (newTruth === from) newTruth = to
            else if (!((from < newTruth && to < newTruth) || (from > newTruth && to > newTruth)))
                if (newTruth > from) newTruth--; else newTruth++
            const modifiedOptions = [...questions[queIndex].options]
            const moving = modifiedOptions.splice(from, 1)[0]
            modifiedOptions.splice(to, 0, moving)
            const modifiedQuestion = {...questions[queIndex], options: modifiedOptions, truth: newTruth}
            const modifiedList = [...questions]
            modifiedList.splice(queIndex, 1, modifiedQuestion)
            setQuestions(modifiedList)
        }

        const deleteQuestion = (queIndex) => {
            const modifiedList = [...questions]
            modifiedList.splice(queIndex, 1)
            setQuestions(modifiedList)
        }

        const deleteOption = (queIndex, optIndex) => {
            let newTruth = questions[queIndex].truth
            if (newTruth === optIndex && optIndex !== 0) newTruth--
            const modifiedOptions = [...questions[queIndex].options]
            modifiedOptions.splice(optIndex, 1)
            const modifiedQuestion = {...questions[queIndex], options: modifiedOptions, truth: newTruth}
            const modifiedList = [...questions]
            modifiedList.splice(queIndex, 1, modifiedQuestion)
            setQuestions(modifiedList)
        }

        const changeQuestion = (queIndex, newText) => {
            // Таймаут позволяет откладывать изменения стейта и ререндеринг, если человек зажал клавишу
            timer = setTimeout(() => {
                const modifiedQuestion = {...questions[queIndex], question: newText.trim()}
                const modifiedList = [...questions]
                modifiedList.splice(queIndex, 1, modifiedQuestion)
                setQuestions(modifiedList)
            }, 200)
        }

        const changeOption = (queIndex, optIndex, newText) => {
            timer = setTimeout(() => {
                const modifiedOption = {...questions[queIndex].options[optIndex], option: newText.trim()}
                const modifiedOptions = [...questions[queIndex].options]
                modifiedOptions.splice(optIndex, 1, modifiedOption)
                const modifiedQuestion = {...questions[queIndex], options: modifiedOptions}
                const modifiedList = [...questions]
                modifiedList.splice(queIndex, 1, modifiedQuestion)
                setQuestions(modifiedList)
            }, 200)
        }

        const changeTruth = (queIndex, optIndex) => {
            const modifiedQuestion = {...questions[queIndex], truth: optIndex}
            const modifiedList = [...questions]
            modifiedList.splice(queIndex, 1, modifiedQuestion)
            setQuestions(modifiedList)
        }


        if (questions.length === 0) {
            return (<Placeholder
                icon={<Icon56AddCircleOutline/>}
                header="Пока нет вопросов"
                action={<Button size='l' onClick={() => addQuestion()}>Добавить первый вопрос</Button>}
            >
                Что это за тест без вопросов?
            </Placeholder>)
        } else {
            return (
                <div>
                    <Group mode='plain' separator='hide' style={{display: 'flex', justifyContent: 'flex-end'}}>
                        <Button disabled={saveBadge === null} mode='tertiary' before={saveBadge}
                                onClick={() => {
                                    updateTest({
                                        _id: sharedState.newTest._id,
                                        questions: questions
                                    }, sharedState.security).then(() => {
                                        sharedState.openSnackbar('Изменения сохранены!')
                                        sharedState.setNewTest({
                                            ...sharedState.newTest,
                                            numberOfQuestions: questions.length
                                        })
                                        setSavedQuestions(questions)
                                    })
                                }}
                        >
                            Сохранить</Button>
                    </Group>

                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'stretch'}}>
                        <FormLayout
                            id="form"
                            onSubmit={e => e.preventDefault()}>
                            {questions.map((question, queIndex) => {
                                return (
                                    <Cell id={`q${queIndex}`}
                                          key={question._id}
                                          name={'radio'}
                                        //TODO не робит, сделать свой CSS (и overflow в дочках тоже)
                                        // style={{paddingRight:'0px'}}
                                          removable onRemove={() => deleteQuestion(queIndex)}
                                          disabled
                                        // draggable={true}
                                        //   onDragFinish={(e)=>moveQuestions(e.from, e.to)}
                                          multiline={true}>

                                        <Group>

                                            <FormItem
                                                className='validateMe'
                                                top={`Вопрос ${queIndex + 1}`}
                                                status={question.question ? '' : 'error'}
                                            >
                                                <Input
                                                    onChange={(e) => changeQuestion(queIndex, e.target.value)}
                                                    defaultValue={question.question}/></FormItem>
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'stretch'
                                            }}>
                                                {questions[queIndex].options.map((option, optIndex) => (
                                                    <Cell key={option._id}
                                                        // style={{overflow:'visible'}}
                                                          multiline={true}
                                                          removable={question.options.length !== 1}
                                                          onRemove={(e) => {
                                                              if (e.clientX !== 0 && e.clientY !== 0) deleteOption(queIndex, optIndex)
                                                          }}
                                                        // onRemove={(e) => console.log(e)}
                                                          draggable={true}
                                                          onDragFinish={(e) => moveOptions(queIndex, e.from, e.to)}
                                                          after={questions[queIndex].options.length - 1 === optIndex ?
                                                              <IconButton
                                                                  onClick={(e) => {
                                                                      if (e.clientX !== 0 && e.clientY !== 0) addOption(queIndex)
                                                                  }}><Icon28AddOutline/></IconButton> : null}
                                                    >
                                                        <FormItem className='validateMe'
                                                                  status={option.option ? '' : 'error'}
                                                                  style={{padding: '0px 16px'}}>
                                                            <Radio name={queIndex} value={optIndex}
                                                                   onChange={() => changeTruth(queIndex, optIndex)}
                                                                   defaultChecked={question.truth === optIndex}><Input
                                                                onChange={(e) => changeOption(queIndex, optIndex, e.target.value)}
                                                                defaultValue={option.option}/></Radio>
                                                        </FormItem>
                                                    </Cell>
                                                ))}

                                            </div>
                                        </Group>
                                    </Cell>

                                )
                            })}
                        </FormLayout>
                        <Button size='l' onClick={() => addQuestion()}
                                style={{marginLeft: 'auto', marginRight: 'auto', marginBottom: '5px'}}>Добавить
                            вопрос</Button>

                    </div>
                </div>)
        }
    }


    return (
        <Panel id={id}>
            <PanelHeader
                separator={false}
                left={<PanelHeaderClose onClick={() => {
                    router.back()
                    //Иначе после выхода с моделки возвращает сюда
                    router.history.pop()
                }}/>}
            >
                {sharedState.newTest.title}
            </PanelHeader>
            <Group
                header={
                    <Tabs>
                        <TabsItem selected={activeTab === 'options'}
                                  onClick={() => setActiveTab('options')}>Вопросы</TabsItem>
                        {/*<TabsItem selected={activeTab === 'finals'}*/}
                        {/*          onClick={() => setActiveTab('finals')}>Итоги</TabsItem>*/}
                        <TabsItem selected={activeTab === 'results'}
                                  onClick={() => setActiveTab('results')}>Результаты</TabsItem>
                    </Tabs>}
            >
            </Group>
            <Group>
                {!sharedState.popout ? (() => {
                    if (questions)
                        switch (activeTab) {
                            case 'options':
                                return questionsRender();
                            case 'finals':
                                return;
                            case 'results':
                                return resultsRender();
                            default:
                                return null
                        }
                })() : null}
            </Group>
        </Panel>
    )
}
export default QuestionsAndStuff;