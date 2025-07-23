const ProdutoServices = require('../services/ProdutoServices');
const { postItem, getAllItems, deleteItem, EditItem } = require("./BaseController");

async function getAllProdutos(req, res) {
    return getAllItems(ProdutoServices.getAllProdutos, req, res);
}
async function postProduto(req, res) {
    return postItem(ProdutoServices.postProduto, req, res);
}
async function postOffer(req, res) {
    return EditItem(ProdutoServices.postOfferProduto, req, res);
}
async function deleteProduto(req, res) {
    return deleteItem(ProdutoServices.deleteProduto, req, res);
}

module.exports = { postProduto, getAllProdutos, deleteProduto, postOffer }