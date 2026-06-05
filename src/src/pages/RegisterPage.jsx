import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import './LoginPage.css';
import './RegisterPage.css';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    dataNascimento: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function formatDate(value) {
    if (!value) return '';
    const [ano, mes, dia] = value.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.senha !== form.confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        nome: form.nome,
        email: form.email,
        senha: form.senha,
        dataNascimento: formatDate(form.dataNascimento),
      });
      setSuccess('Conta criada com sucesso! Redirecionando para o login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const msg = err.response?.data?.message;
      if (err.response?.status === 409) setError('Este e-mail já está cadastrado.');
      else if (err.response?.status === 400) setError(msg || 'Preencha todos os campos obrigatórios.');
      else setError(msg || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card card register-card">
        <div className="login-logo" aria-hidden="true">
          <span className="login-logo-text">Pixel<span>Game</span></span>
        </div>

        <h1 className="login-title">Criar conta</h1>
        <p className="login-subtitle">Preencha os dados para se cadastrar</p>

        {error && (
          <div className="alert alert-error" role="alert" aria-live="assertive">
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success" role="status" aria-live="polite">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate aria-label="Formulário de cadastro">
          <div className="form-group">
            <label htmlFor="nome">Nome completo <span aria-hidden="true">*</span></label>
            <input
              id="nome"
              name="nome"
              type="text"
              className="input-field"
              placeholder="Seu nome"
              value={form.nome}
              onChange={handleChange}
              required
              autoComplete="name"
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">E-mail <span aria-hidden="true">*</span></label>
            <input
              id="reg-email"
              name="email"
              type="email"
              className="input-field"
              placeholder="exemplo@email.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label htmlFor="dataNascimento">Data de nascimento</label>
            <input
              id="dataNascimento"
              name="dataNascimento"
              type="date"
              className="input-field"
              value={form.dataNascimento}
              onChange={handleChange}
              aria-describedby="date-hint"
            />
            <small id="date-hint" className="form-hint">Opcional</small>
          </div>

          <div className="form-group">
            <label htmlFor="reg-senha">Senha <span aria-hidden="true">*</span></label>
            <input
              id="reg-senha"
              name="senha"
              type="password"
              className="input-field"
              placeholder="Mínimo 6 caracteres"
              value={form.senha}
              onChange={handleChange}
              required
              autoComplete="new-password"
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmarSenha">Confirmar senha <span aria-hidden="true">*</span></label>
            <input
              id="confirmarSenha"
              name="confirmarSenha"
              type="password"
              className="input-field"
              placeholder="Repita a senha"
              value={form.confirmarSenha}
              onChange={handleChange}
              required
              autoComplete="new-password"
              aria-required="true"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary login-submit-btn"
            disabled={loading}
            aria-busy={loading}
          >
            {loading
              ? <><span className="spinner" aria-hidden="true" /> Criando conta...</>
              : 'Criar conta'
            }
          </button>
        </form>

        <p className="login-register">
          Já tem conta?{' '}
          <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
