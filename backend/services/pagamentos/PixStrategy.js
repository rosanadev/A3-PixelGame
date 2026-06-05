const PagamentoStrategy = require('./PagamentoStrategy');

class PixStrategy extends PagamentoStrategy {
    async processarPagamento(dadosPagamento) {
        console.log('Processando pagamento via Pix com os dados:', dadosPagamento);
        return { status: 'sucesso', metodo: 'Pix' };
    }
}

module.exports =  PixStrategy;