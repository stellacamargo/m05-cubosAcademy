const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const criarPedido = async (req, res) => {
    const { produtos } = req.body;

    if (!produtos || produtos.length === 0) {
        return res.status(400).json({ error: 'É necessário selecionar pelo menos um produto.' });
    }

    try {
        const { rows: novoPedido } = await req.pool.query(
            'INSERT INTO pedidos (usuario_id, data_hora, status) VALUES ($1, NOW(), $2) RETURNING *',
            [req.userId, 'pendente']
        );

        const pedidoId = novoPedido[0].id;

        for (const produto of produtos) {
            await req.pool.query(
                'INSERT INTO pedidos_produtos (pedido_id, produto_id, quantidade) VALUES ($1, $2, $3)',
                [pedidoId, produto.id, produto.quantidade]
            );

            await req.pool.query(
                'UPDATE produtos SET quantidade_estoque = quantidade_estoque - $1 WHERE id = $2',
                [produto.quantidade, produto.id]
            );
        }

        res.status(201).json({ message: 'Pedido criado com sucesso.', pedido: novoPedido[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar o pedido.' });
    }
};

const listarPedidosUsuario = async (req, res) => {
    try {
        const { rows: pedidos } = await req.pool.query(
            'SELECT * FROM pedidos WHERE usuario_id = $1 ORDER BY data_pedido DESC',
            [req.userId]
        );

        res.status(200).json(pedidos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao listar os pedidos.' });
    }
};

const listarTodosPedidos = async (req, res) => {
    
    if (!req.userAdmin) {
        return res.status(403).json({ error: 'Acesso negado.' });
    }

    try {
        const { rows: pedidos } = await req.pool.query('SELECT * FROM pedidos ORDER BY data_pedido DESC');

        res.status(200).json(pedidos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao listar todos os pedidos.' });
    }
};

const atualizarStatusPedido = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!req.userAdmin) {
        return res.status(403).json({ error: 'Acesso negado.' });
    }

    if (!status) {
        return res.status(400).json({ error: 'Status é obrigatório.' });
    }

    try {
        const { rows: pedidoExistente } = await req.pool.query('SELECT * FROM pedidos WHERE id = $1', [id]);

        if (pedidoExistente.length === 0) {
            return res.status(404).json({ error: 'Pedido não encontrado.' });
        }

        await req.pool.query('UPDATE pedidos SET status = $1 WHERE id = $2', [status, id]);

        res.status(200).json({ message: 'Status do pedido atualizado com sucesso.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar o status do pedido.' });
    }
};

const cancelarPedido = async (req, res) => {
    const { id } = req.params; 
    const { usuario_id } = req.userId;

    try {

        const pedido = await req.pool.query('SELECT * FROM pedidos WHERE id = $1', [id]);

        if (pedido.rows.length === 0) {
            return res.status(404).json({ mensagem: "Pedido não encontrado" });
        }

       
        if (pedido.rows[0].usuario_id !== usuario_id) {
            return res.status(403).json({ mensagem: "Você não tem permissão para cancelar este pedido" });
        }

        
        if (pedido.rows[0].status === 'Efetuado') {
            return res.status(400).json({ mensagem: "Não é possível cancelar um pedido já efetuado" });
        }

        
        await req.pool.query('UPDATE pedidos SET status = $1 WHERE id = $2', ['Cancelado', id]);

        return res.status(200).json({ mensagem: "Pedido cancelado com sucesso" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensagem: "Erro interno no servidor" });
    }
};

module.exports = {
    criarPedido,
    listarPedidosUsuario,
    listarTodosPedidos,
    atualizarStatusPedido,
    cancelarPedido
};
