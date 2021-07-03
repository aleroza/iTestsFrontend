import {ModalRoot} from "@vkontakte/vkui";
import PreviewModal from "./previewModal";
import SettingsModal from "./settingsModal";
import router from "../router";
// @ts-ignore
import {activeModal} from "../App"

const modals = () => (
        <ModalRoot
            activeModal={activeModal}
    onClose={() => {
        // console.log(router.history)
        router.closeModal({cutHistory: true})
    }}
>
    <PreviewModal/>
    <SettingsModal/>
        </ModalRoot>
    )


export default modals