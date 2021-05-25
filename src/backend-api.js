import axios from "axios";

const URL = 'http:localhost:5000/'

function getTestsList(owner, isGroup, userID) {
    return axios.get(URL + `${owner}/${isGroup}/${userID}`).then(res => res.data)
    // return new Promise((resolve, reject) => {
    // resolve([
    //         {
    //             id: 1,
    //             header: 'Тест по легендариуму "Колесо Времени"',
    //             description: 'Описание, лол.\nА ты чего хотел?',
    //             image: 'https://nerdist.com/wp-content/uploads/2019/08/Wheel-of-Time-Dragon-Reborn.jpg',
    //             noq: 3
    //         }, {
    //             id: 2,
    //             header: 'Махорка, и чем её дымят',
    //             image: 'https://9animetv.su/wp-content/uploads/2020/12/zxcf-740x480.jpg',
    //             noq: 10
    //         }, {
    //             id: 3,
    //             header: 'test 3',
    //             image: 'https://elephant.art/wp-content/uploads/2019/11/poop-emoji.jpg',
    //             noq: 0
    //         }, {
    //             id: 4,
    //             header: 'test 4',
    //             image: 'https://elephant.art/wp-content/uploads/2019/11/poop-emoji.jpg',
    //             noq: 0
    //         }
    //     ])
    // })
}


function getTestData(testID) {
    console.log(testID)
    return axios.get(URL + "test/" + `${testID}`).then(res => res.data)
    // return new Promise((resolve, reject) => {
    //     resolve({
    //         header: 'Тест по легендариуму "Колесо Времени"',
    //         image: 'https://nerdist.com/wp-content/uploads/2019/08/Wheel-of-Time-Dragon-Reborn.jpg',
    //         questions: [
    //             {
    //                 title: 'Кто женат на Фэйли Башир?',
    //                 answers: [
    //                     {
    //                         answer: 'Ранд Ал\'Тор',
    //                         aftertext: 'У этого развратника аж три жены, не-а'
    //                     },
    //                     {
    //                         answer: 'Мэт Коутон',
    //                         aftertext: 'У него есть целая Королева Шончан, вы что'
    //                     },
    //                     {
    //                         answer: 'Перрин Айбара',
    //                         aftertext: 'Наш кузнец приголубил настоящего сокола...'
    //                     },
    //                     {
    //                         answer: 'Сайка Тоцука',
    //                         aftertext: 'Lol wat'
    //                     },
    //                         ],
    //                 truth: 3-1
    //             },
    //             {
    //                 title: 'Кто такая Моргейз Траканд?',
    //                 answers: [
    //                     {
    //                         answer: 'Простая деревенская женщина',
    //                         aftertext: 'Ага, конечно...'
    //                     },
    //                     {
    //                         answer: 'Айз Седай. А еще это очень длинный ответ на такой дурацкий вопрос, боже мой, а го еще длиннее, бесконечность — не предел!',
    //                         aftertext: 'Она, как и все королевы Андора, проходила обучение в Белой Башне, но не проходила даже испытание на послушницу'
    //                     },
    //                     {
    //                         answer: 'Королева Салдэйи',
    //                         aftertext: 'Не-а, этим государством правит Тенобия Салдэйская.'
    //                     },
    //                     {
    //                         answer: 'Королева Андора',
    //                         aftertext: 'Верно! Правда уже бывшая.'
    //                     },
    //                 ],
    //                 truth: 4-1
    //             }
    //         ],
    //         results: {0: 'Ну ты чего...', 1: 'Можно было лучше', 2: 'Малаца'}
    //     })
    // })
}


export {
    getTestsList,
    getTestData
}