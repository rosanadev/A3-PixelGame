class PagamentoStrategy {
    async processarPagamento(dadosPagamento) {
        throw new Error('Método processarPagamento deve ser implementado');
    }
}

module.exports =  PagamentoStrategy;