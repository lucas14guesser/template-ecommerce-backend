const { createSuccess, createError } = require("../utils/Utils");

async function login(serviceFunction, req, res) {
    try {
        const data = req.body;
        const result = await serviceFunction(data);

        if (!result) {
            return res.json(createError('Credenciais inválidas'));
        }

        return res.json(createSuccess(result));
    } catch (error) {
        return res.json(createError('Erro ao realizar login' + error.message));
    }
}

async function getAllItems(serviceFunction, req, res) {
    try {
        const items = await serviceFunction();

        if (items.length > 0) {
            res.json(createSuccess(items));
        } else {
            res.json(createError('Nenhum item encontrado'));
        }
    } catch (error) {
        res.json(createError('Erro ao buscar dados: ' + error.message))
    }
}

async function getItemByID(serviceFunction, req, res) {
    try {
        const { id } = req.params;
        const item = await serviceFunction(id);

        if (item) {
            res.json(createSuccess(item))
        } else {
            res.json(createError('Não existe Item com este ID'));
        }
    } catch (error) {
        res.json(createError('Erro ao buscar dados' + error.message))
    }
}

async function postItem(serviceFunction, req, res) {
    try {
        const data = req.body;

        if (!data || Object.keys(data).length === 0) {
            return res.json(createError('Corpo da requisição vazio ou inválido'));
        }

        const result = await serviceFunction(data);

        if (result) {
            res.json(createSuccess(result));
        } else {
            res.json(createError('Erro ao processar os dados'));
        }
    } catch (error) {
        res.json(createError('Erro ao cadastrar item' + error.message));
    }
}

module.exports = { login, getAllItems, getItemByID, postItem };