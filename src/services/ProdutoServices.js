const { runQuery, runQueryOne } = require("./BaseService");

async function postProduto(produto) {
    const { produto_nome, produto_preco, produto_lancamento = false, produto_categoria, produto_foto = [], produto_cor = [] } = produto;

    if (!produto_nome || !produto_preco || !produto_categoria) {
        return { error: "Campos obrigatórios: nome, preço e categoria" };
    }

    try {
        let categoriaObj = await runQueryOne("SELECT * FROM ecommerce_categoria WHERE categoria_nome = $1", [produto_categoria]);

        if (!categoriaObj) {
            await runQuery("INSERT INTO ecommerce_categoria (categoria_nome) VALUES ($1)", [produto_categoria]);
            categoriaObj = await runQueryOne("SELECT * FROM ecommerce_categoria WHERE categoria_nome = $1", [produto_categoria]);
        }

        const categoria_id = categoriaObj.categoria_id;

        const produtoResult = await runQueryOne("INSERT INTO ecommerce_produto (produto_nome, produto_preco, produto_lancamento, categoria_id) VALUES ($1, $2, $3, $4) RETURNING produto_id", [produto_nome, produto_preco, produto_lancamento, categoria_id]);

        const produto_id = produtoResult.produto_id;

        for (const foto of produto_foto) {
            await runQuery("INSERT INTO ecommerce_foto_produto (produto_id, foto_produto_url) VALUES ($1, $2)", [produto_id, foto.foto]);
        }

        for (const corObj of produto_cor) {
            const { cor, tamanhos } = corObj;
            const { nome: cor_nome, valor: cor_hex } = cor;

            const corResult = await runQueryOne("INSERT INTO ecommerce_cor (produto_id, cor_nome, cor_hex) VALUES ($1, $2, $3) RETURNING cor_id", [produto_id, cor_nome, cor_hex]);

            const cor_id = corResult.cor_id;

            for (const tam of tamanhos) {
                await runQuery("INSERT INTO ecommerce_tamanho (cor_id, tamanho_tamanho, tamanho_quantidade) VALUES ($1, $2, $3)", [cor_id, tam.tamanho, tam.quantidade]);
            }
        }
        return { message: "Produto cadastrado com sucesso!" };
    } catch (error) {
        console.error("Erro ao cadastrar produto", error);
        return { error: "Erro ao cadastrar produto: " + error.message };
    }
}

module.exports = { postProduto }