import {createNavigator,} from '@vkontakte/router'

const routes = [
    {
        name: 'home',
        updateUrl: false,
        children: [
            {name: 'preview_modal', subRoute: true},
            {name: 'testing'},
            {
                name: 'admin',
                children: [
                    {name: 'settings_modal', subRoute: true, children: [{name: 'questions_and_stuff'}]}
                ]
            }
        ]
    }
]

const config = {
    defaultRoute: 'home',
    preserveHash: true,
    errorLogger: console.error,
    updateUrl: false,
}

const router = createNavigator(routes, config)

router.start()

export default router
