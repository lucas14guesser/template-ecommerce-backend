const UserServices = require('../services/UserServices');
const { getAllItems, getItemByID, postItem, EditItem } = require('../controllers/BaseController');

async function loginUser(req, res) {
    return postItem(UserServices.loginUser, req, res)
}

async function getAllUser(req, res) {
    return getAllItems(UserServices.getAllUser, req, res);
}

async function getUserByID(req, res) {
    return getItemByID(UserServices.getUserByID, req, res);
}

async function postUser(req, res) {
    return postItem(UserServices.postUser, req, res)
}

async function editUser(req, res) {
    return EditItem(UserServices.EditUserByID, req, res);
}

module.exports = { loginUser, getAllUser, getUserByID, postUser, editUser }