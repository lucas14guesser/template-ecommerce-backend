const { deleteImage, getPublicIdFromUrl } = require("../api/Cloudinary");
const { runQuery, runQueryOne } = require("./BaseService");

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
            'foto_produto_url', f.foto_produto_url
          )
        ) FILTER (WHERE f.foto_produto_id IS NOT NULL),
        '[]'
      ) AS fotos,

      -- Objeto de oferta
      jsonb_build_object(
        'oferta_ativo', o.oferta_ativo,
        'oferta_novo_preco', o.oferta_novo_preco
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
async function getProdutoById(produto_id) {
  return runQueryOne(`SELECT 
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
            'foto_produto_url', f.foto_produto_url
          )
        ) FILTER (WHERE f.foto_produto_id IS NOT NULL),
        '[]'
      ) AS fotos,

      -- Objeto de oferta
      jsonb_build_object(
        'oferta_ativo', o.oferta_ativo,
        'oferta_novo_preco', o.oferta_novo_preco
      ) AS oferta

    FROM ecommerce_produto p
    LEFT JOIN ecommerce_cor c ON c.produto_id = p.produto_id
    LEFT JOIN ecommerce_foto_produto f ON f.produto_id = p.produto_id
    LEFT JOIN ecommerce_oferta o ON o.produto_id = p.produto_id
    LEFT JOIN ecommerce_categoria cat ON cat.categoria_id = p.categoria_id
    WHERE p.produto_id = $1

    GROUP BY 
      p.produto_id, 
      p.produto_nome, 
      p.produto_lancamento, 
      p.produto_preco, 
      cat.categoria_nome,
      o.oferta_ativo,
      o.oferta_novo_preco;`, [produto_id]);
}
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
async function postOfferProduto(produto_id, oferta_ativo, oferta_novo_preco) {
  const existingOffer = await runQueryOne('SELECT * FROM ecommerce_oferta WHERE produto_id = $1', [produto_id]);

  if (existingOffer) {
    await runQuery('UPDATE ecommerce_oferta SET oferta_ativo = $1, oferta_novo_preco = $2 WHERE produto_id = $3', [oferta_ativo, oferta_novo_preco, produto_id]);
  } else {
    await runQuery('INSERT INTO ecommerce_oferta (oferta_ativo, oferta_novo_preco, produto_id) VALUES ($1, $2, $3)', [oferta_ativo, oferta_novo_preco, produto_id]);
  }
  return { message: "Oferta atualizada com sucesso!" };
}
async function deleteProduto(produto_id) {
  try {
    const imagens = await runQuery("SELECT foto_produto_url FROM ecommerce_foto_produto WHERE produto_id = $1", [produto_id]);

    for (const { foto_produto_url } of imagens) {
      if (!foto_produto_url) continue;

      const parts = foto_produto_url.split('/');
      const publicIdWithExt = parts.slice(-2).join('/');
      const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');

      await deleteImage(publicId);
    }

    const existingProduto = await runQueryOne("SELECT * FROM ecommerce_produto WHERE produto_id = $1", [produto_id]);

    if (existingProduto) {
      await runQuery("DELETE FROM ecommerce_produto WHERE produto_id = $1", [produto_id]);
      return { message: "Produto excluído com sucesso!" };
    } else {
      return { error: "Não existe produto com este ID" }
    }
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    return { error: "Erro ao excluir produto: " + error.message };
  }
}
async function retirarOferta(produto_id) {
  try {
    const existingProduto = await runQueryOne("SELECT * FROM ecommerce_produto WHERE produto_id = $1", [produto_id]);
    const existingOferta = await runQueryOne("SELECT * FROM ecommerce_oferta WHERE produto_id = $1", [produto_id]);

    if (existingProduto) {
      if (existingOferta) {
        await runQuery("DELETE FROM ecommerce_oferta WHERE produto_id = $1", [produto_id]);
        return { message: "Oferta retirada com sucesso!" };
      } else {
        return { error: "Não existe oferta para o produto com este ID" }
      }
    } else {
      return { error: "Não existe produto com este ID" }
    }
  } catch (error) {
    console.error("Erro ao retirar oferta:", error);
    return { error: "Erro ao retirar oferta: " + error.message };
  }
}
async function putProduto(produto_id, produto) {
  const { produto_nome, produto_preco, produto_lancamento = false, produto_categoria, produto_foto = [], produto_cor = [] } = produto;

  if (!produto_id || !produto_nome || !produto_preco || !produto_categoria) {
    return { error: "Campos obrigatórios: ID, nome, preço e categoria" };
  }

  try {
    const produtoExistente = await runQueryOne("SELECT * FROM ecommerce_produto WHERE produto_id = $1", [produto_id]);
    if (!produtoExistente) {
      return { error: "Produto não encontrado" };
    }

    let categoriaObj = await runQueryOne("SELECT * FROM ecommerce_categoria WHERE categoria_nome = $1", [produto_categoria]);
    if (!categoriaObj) {
      await runQuery("INSERT INTO ecommerce_categoria (categoria_nome) VALUES ($1)", [produto_categoria]);
      categoriaObj = await runQueryOne("SELECT * FROM ecommerce_categoria WHERE categoria_nome = $1", [produto_categoria]);
    }
    const categoria_id = categoriaObj.categoria_id;

    await runQuery(
      "UPDATE ecommerce_produto SET produto_nome = $1, produto_preco = $2, produto_lancamento = $3, categoria_id = $4 WHERE produto_id = $5",
      [produto_nome, produto_preco, produto_lancamento, categoria_id, produto_id]
    );

    const fotosAntigas = await runQuery("SELECT foto_produto_url FROM ecommerce_foto_produto WHERE produto_id = $1", [produto_id]);

    for (const foto of fotosAntigas) {
      const publicId = getPublicIdFromUrl(foto.foto_produto_url);
      await deleteImage(publicId);
    }

    await runQuery("DELETE FROM ecommerce_foto_produto WHERE produto_id = $1", [produto_id]);

    for (const foto of produto_foto) {
      await runQuery("INSERT INTO ecommerce_foto_produto (produto_id, foto_produto_url) VALUES ($1, $2)", [produto_id, foto.foto]);
    }

    const coresExistentes = await runQuery("SELECT cor_id FROM ecommerce_cor WHERE produto_id = $1", [produto_id]);
    const corIds = coresExistentes.map(c => c.cor_id);

    if (corIds.length > 0) {
      await runQuery("DELETE FROM ecommerce_tamanho WHERE cor_id = ANY($1)", [corIds]);
      await runQuery("DELETE FROM ecommerce_cor WHERE produto_id = $1", [produto_id]);
    }

    for (const corObj of produto_cor) {
      const { cor, tamanhos } = corObj;
      if (!cor || typeof cor !== 'object' || !cor.nome || !cor.valor) continue;

      const { nome: cor_nome, valor: cor_hex } = cor;
      const corResult = await runQueryOne(
        "INSERT INTO ecommerce_cor (produto_id, cor_nome, cor_hex) VALUES ($1, $2, $3) RETURNING cor_id",
        [produto_id, cor_nome, cor_hex]
      );
      const cor_id = corResult.cor_id;

      for (const tam of tamanhos) {
        await runQuery(
          "INSERT INTO ecommerce_tamanho (cor_id, tamanho_tamanho, tamanho_quantidade) VALUES ($1, $2, $3)",
          [cor_id, tam.tamanho, tam.quantidade]
        );
      }
    }

    return { message: "Produto atualizado com sucesso!" };
  } catch (error) {
    console.error("Erro ao atualizar produto", error);
    return { error: "Erro ao atualizar produto: " + error.message };
  }
}

module.exports = { postProduto, getAllProdutos, deleteProduto, postOfferProduto, getProdutoById, retirarOferta, putProduto }