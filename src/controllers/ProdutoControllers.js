const ProdutoServices = require('../services/ProdutoServices');
const { postItem } = require("./BaseController");

async function postProduto(req, res) {
    return postItem(ProdutoServices.postProduto, req, res);
}

module.exports = { postProduto, }