const ProdutoServices = require('../services/ProdutoServices');
const { postItem, getAllItems } = require("./BaseController");

async function postProduto(req, res) {
    return postItem(ProdutoServices.postProduto, req, res);
}
async function getAllProdutos(req, res) {
    return getAllItems(ProdutoServices.getAllProdutos, req, res);
}

module.exports = { postProduto, getAllProdutos, }