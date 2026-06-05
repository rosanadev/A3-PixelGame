const PagamentoStrategy = require('./PagamentoStrategy');

class CartaoStrategy extends PagamentoStrategy {
    async processarPagamento(dadosPagamento) {
        console.log('Processando pagamento via Cartão de Crédito com os dados:', dadosPagamento);
        return { status: 'sucesso', metodo: 'Cartão de Crédito' };
    }
}

module.exports =  CartaoStrategy;