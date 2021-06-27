import React, {useEffect, useState} from 'react';
import {
    Alert,
    Avatar,
    Button,
    Cell,
    Group,
    Panel,
    PanelHeader,
    PanelHeaderClose,
    Placeholder,
    Tabs,
    TabsItem
} from "@vkontakte/vkui";
import router from "../router";
import {deleteTest, getTestsListAdmin} from "../backend-api";
import {Icon28AddOutline, Icon28DeleteOutline, Icon56AddCircleOutline, Icon56HideOutline} from "@vkontakte/icons";
import ReactTimeAgo from "react-time-ago";


const Admin = ({id, sharedState}) => {
    const deb = () => {
        // console.log(tests.active[0].createdAt)
        // debugger;
    }


    const [tests, setTests] = useState({})
    const [activeTab, setActiveTab] = useState('active')
    const [removability, setRemovability] = useState(false)

    const fetchTests = async () => {
        // console.log("чекаем список тестов")
        let orderedTests = {active: [], closed: []}
        const temp = await getTestsListAdmin(sharedState.loginType.owner.id, sharedState.loginType.owner.isGroup, sharedState.security)
        temp.map((test) => {
            if (test.isActive) {
                orderedTests.active.push(test)
            } else {
                orderedTests.closed.push(test)
            }
        })
        setTests(orderedTests)
    }

    useEffect(() => {
        if (sharedState.activePanel === 'admin' && sharedState.activeModal === null)
            fetchTests()
                .then(() => sharedState.setPopout(null))
    }, [sharedState.activePanel, sharedState.activeModal])

    const openDeleteAlert = (testID) => {
        sharedState.setPopout(
            <Alert
                actions={[{
                    title: 'Удалить',
                    mode: 'destructive',
                    autoclose: true,
                    action: () => {
                        deleteTest(testID, sharedState.security).then(() => {
                            sharedState.openSnackbar('Тест удален!')
                            fetchTests()
                            // TODO Сделать так, чтобы removability изменялось после удаления последнего теста в группе
                            // if(tests[activeTab].length===0) setRemovability(!removability)
                        })
                    },
                }, {
                    title: 'Отмена',
                    autoclose: true,
                    mode: 'cancel'
                }]}
                onClose={() => sharedState.setPopout(null)}
                header="Подтвердите действие"
                text="Вы уверены, что хотите удалить тест?"
            />
        );
    }

    const createNewTest = () => {
        router.go('settings_modal', {
            test: {
                ownerID: sharedState.loginType.owner.id,
                isGroup: sharedState.loginType.owner.isGroup,
                showAnswers: false,
                isActive: false,
                numberOfAttempts: -1,
                numberOfQuestions: 0,
                questions: [],
                finals: [],
                results: []
            }
        })
        setActiveTab('closed')
    }

    const testCell = (test) => (
        <Cell
            key={'test' + test._id}
            before={<Avatar mode='image' size={72} src={test.image}/>}
            description={
                <div>
                    <div>{test.numberOfQuestions} {sharedState.declOfNum(test.numberOfQuestions, ["вопрос", "вопроса", "вопросов"])} | {test.numberOfResults} {sharedState.declOfNum(test.numberOfResults, ["ответ", "ответа", "ответов"])}</div>
                    <div>Создан: {new Date(Date.parse(test.createdAt)).toLocaleString()}</div>
                    {/*FIXME ЛОЛ, объект же считается обновленным даже после чьего-то прохождения*/}
                    <div>Изменен <ReactTimeAgo date={Date.parse(test.updatedAt)}/></div>

                </div>
            }
            removable={removability}
            onRemove={() => openDeleteAlert(test._id)}
            onClick={() => {
                router.go('settings_modal', {test})
            }}
        >{test.title}</Cell>
    )

    return (
        <Panel id={id}>
            <PanelHeader
                // onClick={() => console.log(tests[activeTab].length===0)}
                separator={false}
                left={<PanelHeaderClose onClick={() => {
                    router.back()
                    router.history.pop()
                }}/>}
            >
                Редактирование
            </PanelHeader>
            <Group
                header={
                    <Tabs>
                        <TabsItem selected={activeTab === 'active'}
                                  onClick={() => setActiveTab('active')}>Активные</TabsItem>
                        <TabsItem selected={activeTab === 'closed'}
                                  onClick={() => setActiveTab('closed')}>Закрытые</TabsItem>
                        {removability ? null : <Button
                            onClick={() => createNewTest()}
                            size='l' mode='tertiary'><Icon28AddOutline/></Button>}
                        {/*FIXME disabled={tests[activeTab].length()===0}*/}
                        <Button size='l' mode='tertiary' onClick={() => setRemovability(!removability)}
                                style={{color: '#E64646'}}> {removability ? "Отменить" :
                            <Icon28DeleteOutline/>}</Button>
                    </Tabs>}
            >
            </Group>
            <Group>
                {!sharedState.popout ? (() => {
                    if (tests.active)
                        switch (activeTab) {
                            case 'active':
                                return (tests.active.length === 0 ?
                                    <Placeholder
                                        icon={<Icon56AddCircleOutline/>}
                                        header="Активных тестов нет"
                                        action={<Button size='l' onClick={() => createNewTest()}>Создать тест</Button>}
                                    >
                                        Может стоит добавить парочку?
                                    </Placeholder>
                                    : tests.active.map((test) => testCell(test)));
                            case 'closed':
                                return (tests.closed.length === 0 ?
                                    <Placeholder
                                        icon={<Icon56HideOutline/>}
                                        header="Закрытых тестов нет"
                                        action={<Button size='l' onClick={() => createNewTest()}>Создать тест</Button>}
                                    >
                                        Не бойтесь, тут ваш тест никто не обидит!
                                    </Placeholder>
                                    : tests.closed.map((test) => testCell(test)));
                            default:
                                return null
                        }
                })() : null}
            </Group>
            {sharedState.snackbar}
        </Panel>
    )
}
export default Admin;