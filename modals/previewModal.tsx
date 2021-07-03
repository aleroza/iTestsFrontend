import {Button, ContentCard, ModalPage} from "@vkontakte/vkui";
import {Icon24DoorArrowLeftOutline} from "@vkontakte/icons";
import React from "react";
import router from "../router";
import {declOfNum} from "../App";

const PreviewModal = () => (
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
)

export default PreviewModal