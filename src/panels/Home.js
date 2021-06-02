import React, {useEffect, useState} from 'react';

import {
    Avatar,
    Button,
    CardGrid,
    ContentCard,
    Group,
    Header,
    Panel,
    PanelHeader,
    Placeholder,
    RichCell
} from '@vkontakte/vkui';
import router from "../router";
import {getTestsList} from "../backend-api";
import bridge from "@vkontakte/vk-bridge";
import {Icon56NotePenOutline} from "@vkontakte/icons";

const Home = ({id, sharedState}) => {
    const deb = () => {
        console.log(sharedState.urlParams)
        console.log(sharedState.loginType)
        // debugger;
    }

    const [tests, setTests] = useState([])


    useEffect(() => {
        const fetchTests = async () => {
            if (Object.keys(sharedState.loginType).length !== 0) {
                console.log("чекаем список тестов")
                getTestsList(sharedState.loginType.owner.id, sharedState.loginType.owner.isGroup, sharedState.loginType.user.id).then(res => setTests(res))
            }
        }

        //TODO Когда-нибудь сделать тут нормальный AJAX, чтобы не плодить дохрена запросов
        if (sharedState.activePanel === 'home')
            fetchTests()
                .then(() => sharedState.setPopout(null))
    }, [sharedState.loginType, sharedState.activePanel])

    return (
        <Panel id={id}>
            <PanelHeader onClick={() => {
                deb()
            }}>VK iTests App</PanelHeader>
            {/*(Object.keys(sharedState.loginType).length !== 0 && sharedState.loginType.owner ?*/}
            <Group header={<Header mode="secondary">Вы на странице
                тестов {sharedState.loginType.owner && sharedState.loginType.owner.isGroup ? "группы" : "пользователя"}</Header>}>
                {/*<Div>*/}
                <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                    <RichCell
                        disabled
                        before={<Avatar size={72}
                                        src={sharedState.loginType.owner && sharedState.loginType.owner.photo_200}/>}
                        caption={`Всего тестов: ${tests.length}`}
                    >
                        {sharedState.loginType.owner && sharedState.loginType.owner.name}
                    </RichCell>
                    <div>
                        <Button
                            style={{marginRight: '5px'}}
                            disabled={!(sharedState.loginType.owner && sharedState.loginType.owner.isAdmin)}
                            size="m"
                            onClick={() => {
                                router.go("admin")
                            }}
                        >Админка</Button>
                        {/*//FIXME Заменить на просто кнопку с иконкой*/}
                        <Button style={{marginRight: '3px'}} size="m" mode="secondary"
                                onClick={() => {
                                    bridge.send("VKWebAppAddToCommunity").then(() => sharedState.openSnackbar("Приложение добавлено!"))
                                }}
                        >Добавить к себе</Button>
                        {/*<Button*/}
                        {/*    style={{marginRight: '5px'}}*/}
                        {/*    closed={!(sharedState.loginType.owner && sharedState.loginType.owner.isGroup) && sharedState.loginType.owner.isAdmin}*/}
                        {/*    size="m">Перейти к своим тестам</Button>*/}
                    </div>
                </div>

                {/*<Button onClick={() => router.go('persik')}>Show me the Persik</Button>*/}
                {/*</Div>*/}
            </Group>
            {/*: null)*/}

            {/*TODO замутить <Placeholder> при отсутствии тестов*/}
            <Group header={<Header mode="secondary">Список тестов</Header>}>
                {!sharedState.popout && tests.length === 0 ?
                    <Placeholder
                    icon={<Icon56NotePenOutline />}
                    header="Тестов нет"
                >
                    Похоже, что администратор не добавил ни одного теста...
                </Placeholder>
                    : null}
                {/*FIXME Сделать для мобилок просто ContentСard*/}
                <CardGrid size={'m'}>
                    {tests.map((test) => (
                        <ContentCard
                            key={'test' + test._id}
                            image={test.image}
                            header={test.title}
                            maxHeight={150}
                            onClick={() => {
                                router.go('preview_modal', {test})
                            }}
                        />
                    ))}
                </CardGrid>
            </Group>
            {sharedState.snackbar}
        </Panel>
    )
}

export default Home;