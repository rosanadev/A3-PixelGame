const CartaoStrategy = require('./pagamentos/CartaoStrategy');
const BoletoStrategy = require('./pagamentos/BoletoStrategy');
const PixStrategy = require('./pagamentos/PixStrategy');

const strategies = {
    'cartao': new CartaoStrategy(),
    'boleto': new BoletoStrategy(),
    'pix': new PixStrategy()
};

class PagamentoService {
    async processarPagamento(metodo, dadosPagamento) {
        let strategy = strategies[metodo];
        if (!strategy) {
            throw new Error(`Método de pagamento "${metodo}" não suportado.`);
        }
        return strategy.processarPagamento(dadosPagamento);
    }
}

module.exports =  new PagamentoService();