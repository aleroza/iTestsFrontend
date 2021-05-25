import {
    createNavigator,
} from '@vkontakte/router'

const routes = [
    {
        name: 'home',
        updateUrl: false,
        children: [
            {name: 'persik'},
            {name: 'preview_page', subRoute: true}
        ]
    },
    {
        name: 'testing'
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
