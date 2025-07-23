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

            if (!cor || typeof cor !== 'object' || !cor.nome || !cor.valor) {
                continue;
            }

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
async function getAllProdutos() {
  return runQuery(`
    SELECT 
      p.produto_id,
      p.produto_nome,
      p.produto_lancamento,
      p.produto_preco,
      cat.categoria_nome,

      -- Array de cores com tamanhos dentro
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'cor_nome', c.cor_nome,
            'cor_hex', c.cor_hex,
            'tamanhos', COALESCE(
              (
                SELECT json_agg(
                  DISTINCT jsonb_build_object(
                    'tamanho', t.tamanho_tamanho,
                    'quantidade', t.tamanho_quantidade
                  )
                )
                FROM ecommerce_tamanho t
                WHERE t.cor_id = c.cor_id
              ),
              '[]'
            )
          )
        ) FILTER (WHERE c.cor_id IS NOT NULL),
        '[]'
      ) AS cores,

      -- Array de fotos
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'foto_url', f.foto_produto_url
          )
        ) FILTER (WHERE f.foto_produto_id IS NOT NULL),
        '[]'
      ) AS fotos,

      -- Objeto de oferta
      jsonb_build_object(
        'ativo', o.oferta_ativo,
        'novo_preco', o.oferta_novo_preco
      ) AS oferta

    FROM ecommerce_produto p
    LEFT JOIN ecommerce_cor c ON c.produto_id = p.produto_id
    LEFT JOIN ecommerce_foto_produto f ON f.produto_id = p.produto_id
    LEFT JOIN ecommerce_oferta o ON o.produto_id = p.produto_id
    LEFT JOIN ecommerce_categoria cat ON cat.categoria_id = p.categoria_id

    GROUP BY 
      p.produto_id, 
      p.produto_nome, 
      p.produto_lancamento, 
      p.produto_preco, 
      cat.categoria_nome,
      o.oferta_ativo,
      o.oferta_novo_preco;
  `, []);
}

module.exports = { postProduto, getAllProdutos }