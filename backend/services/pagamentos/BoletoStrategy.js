const PagamentoStrategy = require('./PagamentoStrategy');

class BoletoStrategy extends PagamentoStrategy {
    async processarPagamento(dadosPagamento) {
        console.log('Processando pagamento via Boleto com os dados:', dadosPagamento);
        return { status: 'sucesso', metodo: 'Boleto' };
    }
}

module.exports =  BoletoStrategy;