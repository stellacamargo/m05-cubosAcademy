const listarProdutos = async (req, res) => {
    try {
        const { rows: produtos } = await req.pool.query('SELECT * FROM produtos');

        res.status(200).json(produtos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao listar produtos.' });
    }
};

const cadastrarProduto = async (req, res) => {
    const { nome, descricao, preco, foto_url } = req.body;

    if (!nome || !descricao || !preco) {
        return res.status(400).json({ error: 'Nome, descrição e preço são obrigatórios.' });
    }

    try {
        const { rows: novoProduto } = await req.pool.query(
            'INSERT INTO produtos (nome, descricao, preco, quantidade_estoque, usuario_id, foto_url) VALUES ($1, $2, $3, 0, $4, $5) RETURNING *',
            [nome, descricao, preco, req.userId, foto_url || null]
        );

        res.status(201).json({
            message: 'Produto cadastrado com sucesso.',
            produto: novoProduto[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao cadastrar o produto.' });
    }
};

const atualizarProduto = async (req, res) => {
    const { id } = req.params;
    const { nome, descricao, preco } = req.body;

    if (!nome || !descricao || !preco) {
        return res.status(400).json({ error: 'Nome, descrição e preço são obrigatórios.' });
    }

    try {
        const { rows: produtoExistente } = await req.pool.query('SELECT * FROM produtos WHERE id = $1', [id]);

        if (produtoExistente.length === 0) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }

        await req.pool.query(
            'UPDATE produtos SET nome = $1, descricao = $2, preco = $3 WHERE id = $4',
            [nome, descricao, preco, id]
        );

        res.status(200).json({ message: 'Produto atualizado com sucesso.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar o produto.' });
    }
};

const atualizarQuantidadeEstoque = async (req, res) => {
    const { id } = req.params;
    const { quantidade } = req.body;

    if (!quantidade) {
        return res.status(400).json({ error: 'Quantidade é obrigatória.' });
    }

    try {
        const { rows: produtoExistente } = await req.pool.query('SELECT * FROM produtos WHERE id = $1', [id]);

        if (produtoExistente.length === 0) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }

        await req.pool.query(
            'UPDATE produtos SET quantidade_estoque = quantidade_estoque + $1 WHERE id = $2',
            [quantidade, id]
        );

        res.status(200).json({ message: 'Quantidade de estoque atualizada com sucesso.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar quantidade em estoque.' });
    }
};

const atualizarFotoProduto = async (req, res) => {
    const { id } = req.params;
    const { foto_url } = req.body;

    if (!foto_url) {
        return res.status(400).json({ error: 'URL da foto é obrigatória.' });
    }

    try {
        const { rows: produtoExistente } = await req.pool.query('SELECT * FROM produtos WHERE id = $1', [id]);

        if (produtoExistente.length === 0) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }

        await req.pool.query('UPDATE produtos SET foto_url = $1 WHERE id = $2', [foto_url, id]);

        res.status(200).json({ message: 'Foto do produto atualizada com sucesso.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar foto do produto.' });
    }
};

const deletarProduto = async (req, res) => {
    const { id } = req.params;

    try {
        const { rows: produtoExistente } = await req.pool.query('SELECT * FROM produtos WHERE id = $1', [id]);

        if (produtoExistente.length === 0) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }

        await req.pool.query('DELETE FROM produtos WHERE id = $1', [id]);

        res.status(200).json({ message: 'Produto deletado com sucesso.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao deletar o produto.' });
    }
};

module.exports = {
    listarProdutos,
    cadastrarProduto,
    atualizarProduto,
    atualizarQuantidadeEstoque,
    atualizarFotoProduto,
    deletarProduto
};
