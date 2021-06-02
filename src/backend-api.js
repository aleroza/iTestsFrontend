import axios from "axios";

// const URL = 'https://melchior-itests.herokuapp.com/'
const URL = 'http://localhost:5000/'


// W/o security
export function getTestsList(ownerID, isGroup, userID) {
    return axios.get(URL + "tests_list/" + `${ownerID}/${isGroup}/${userID}`).then(res => res.data)
}
// FIXME Придумать, как не вычитать попытки при -1
export function subAttempt(testID, userID, firstRun) {
    return axios.patch(URL + "decr_attempt/", {testID, userID, firstRun})
}

export function getTestData(testID, userID) {
    return axios.get(URL + "test/" + `${testID}/${userID}`).then(res => res.data)
}

// W security
export function sendScore(testID, userID, score, security) {
    return axios.patch(URL + "set_score/", {
        testID,
        userID,
        score
    }, {headers: {Authorization: security}}).then(res => res.data)
}

//TODO ВАЖНО, СДЕЛАТЬ ДО СДАЧИ
// секурити ↘
export function getTestsListAdmin(ownerID, isGroup, security) {
    return axios.post(URL + "tests_list_admin/", {
        ownerID,
        isGroup
    }, {headers: {Authorization: security}}).then(res => res.data)
}

export function createTest(test, security) {
    return axios.post(URL + "add/", test, {headers: {Authorization: security}})
}

export function updateTest(test, security) {
    return axios.post(URL + "update/", test, {headers: {Authorization: security}})
}

export function deleteTest(testID, security) {
    return axios.delete(URL + "delete_test/", {headers: {Authorization: security}, data: {testID}})
}
