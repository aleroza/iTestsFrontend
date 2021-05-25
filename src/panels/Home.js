import React, {useEffect} from 'react';

import {
    Button, CardGrid, ContentCard,
    Div,
    Group,
    Header,
    Panel,
    PanelHeader
} from '@vkontakte/vkui';
import router from "../router";
import {getTestsList} from "../backend-api";

const Home = ({id, sharedState}) => {
    const deb = () => {
        console.log(sharedState.urlParams)
        console.log(sharedState.loginType)
        // debugger;
    }

    useEffect(() => {
        const fetchTests = async () => {
            if (sharedState.tests.length === 0) {
                getTestsList("43340456", "1", "1").then(res => sharedState.setTests(res))
            }
        }

        fetchTests()
            .then(() => sharedState.setPopout(null))
    }, [])

    return (
        <Panel id={id}>
            <PanelHeader onClick={() => {
                deb()
            }}>VK iTests App</PanelHeader>
            <Group header={<Header mode="secondary">Navigation Example</Header>}>
                <Div>
                    <Button onClick={() => router.go('persik')}>Show me the Persik</Button>
                </Div>
                {/*FIXME Сделать для мобилок просто ContentСard*/}
                <CardGrid size={'m'}>
                    {sharedState.tests.map((test) => (
                        // {console.log(test)}
                        <ContentCard
                            key={'test' + test._id}
                            image={test.image}
                            header={test.title}
                            maxHeight={150}
                            onClick={() => {
                                router.go('preview_page', {test})
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