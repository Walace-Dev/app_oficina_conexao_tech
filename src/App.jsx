import { useState } from 'react';
import {
  ArrowRight, Atom, CheckCircle2, Cloud, Code2, Database, ExternalLink,
  Github, House, Info, LayoutPanelLeft, Menu, Send, ShieldCheck,
  Sparkles, UserRoundPlus, X
} from 'lucide-react';
import { supabase } from './lib/supabase.js';

const pages = [
  { id: 'inicio', label: 'Início', icon: House },
  { id: 'cadastro', label: 'Cadastro', icon: UserRoundPlus },
  { id: 'sobre', label: 'Sobre', icon: Info }
];

export default function App() {
  const [page, setPage] = useState('inicio');
  const [menuOpen, setMenuOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [status, setStatus] = useState('idle');
  const [feedback, setFeedback] = useState('');
  const [ultimoNome, setUltimoNome] = useState('');

  function navigate(to) {
    setPage(to);
    setMenuOpen(false);
  }

  async function submit(event) {
    event.preventDefault();
    if (status === 'loading') return;
    const normalized = nome.trim().replace(/\s+/g, ' ');
    if (!normalized || normalized.length > 80) {
      setStatus('error');
      setFeedback('Informe um nome com até 80 caracteres.');
      return;
    }
    if (!supabase) {
      setStatus('error');
      setFeedback('Supabase não configurado. Verifique as variáveis de ambiente.');
      return;
    }

    setStatus('loading');
    setFeedback('');
    try {
      // Inserção sem .select(): nenhuma leitura pública é permitida pela RLS.
      const { error } = await supabase.from('oficina_nomes').insert({ nome: normalized });
      if (error) throw error;
      setUltimoNome(normalized);
      setNome('');
      setStatus('success');
      setFeedback('Nome salvo com sucesso no Supabase!');
    } catch (error) {
      console.error('Falha ao cadastrar:', error);
      setStatus('error');
      setFeedback('Não foi possível salvar. Verifique a conexão e tente novamente.');
    }
  }

  return (
    <div className="app-shell">
      {menuOpen && <button className="backdrop" onClick={() => setMenuOpen(false)} aria-label="Fechar menu" />}
      <aside className={'sidebar ' + (menuOpen ? 'sidebar--open' : '')}>
        <div className="brand">
          <div className="brand-icon"><Atom size={25} /></div>
          <div className="brand-copy"><strong>Conexão Tech</strong><span>CompEng Lab</span></div>
          <button className="close-menu" onClick={() => setMenuOpen(false)} aria-label="Fechar menu"><X size={20} /></button>
        </div>
        <div className="sidebar-title">WORKSPACE</div>
        <nav className="sidebar-links" aria-label="Menu lateral">
          {pages.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => navigate(item.id)}
                className={'sidebar-link ' + (page === item.id ? 'selected' : '')}
                aria-current={page === item.id ? 'page' : undefined}>
                <Icon size={19} /><span>{item.label}</span>
                {page === item.id && <span className="active-dot" />}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip"><Sparkles size={20} /><strong>Seu laboratório</strong><p>Uma interface simples. Uma integração de verdade.</p></div>
          <div className="sidebar-version"><span className="online-dot" /> Oficina prática • v1.0</div>
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <div className="crumb">
            <button className="mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Abrir menu"><Menu size={22} /></button>
            <span>Workspace <b>/</b> <strong>{pages.find((item) => item.id === page).label}</strong></span>
          </div>
          <div className="topbar-right">
            <div className={'connection ' + (supabase ? 'connection--ok' : 'connection--warn')}>
              <span className="online-dot" /> {supabase ? 'Supabase configurado' : 'Configuração pendente'}
            </div>
            <div className="avatar">CL</div>
          </div>
        </header>
        <main className="content">
          <div className="content-inner">
            <div className="eyebrow"><span><Code2 size={14} /></span> OFICINA • ASSISTENTES DE IA</div>
            <section className="hero">
              <div>
                <h1>{page === 'sobre' ? 'Tecnologia na prática.' : 'Conectando ideias ao mundo real.'}</h1>
                <p>{page === 'sobre'
                  ? 'Um experimento que conecta frontend, banco de dados e deploy.'
                  : 'Um pequeno projeto para experimentar todo o caminho: interface, banco de dados e deploy.'}</p>
              </div>
              <div className="hero-art" aria-hidden="true"><div className="halo" /><div className="hero-symbol"><Atom size={70} strokeWidth={1.1} /></div></div>
            </section>
            {page === 'sobre' ? (
              <section className="panel about-card">
                <div className="card-icon card-icon--purple"><Info size={22} /></div>
                <h2>Sobre este experimento</h2>
                <p>O React envia o nome digitado para a tabela <code>public.oficina_nomes</code> do PostgreSQL no Supabase.</p>
                <p>Os três menus são navegáveis, mas simulados com estado do React. Não existem rotas de backend para os menus.</p>
                <p>A segurança RLS permite inserções anônimas, mas não permite que visitantes consultem os registros de outras pessoas.</p>
                <button className="primary-button about-button" onClick={() => navigate('cadastro')}>Testar cadastro <ArrowRight size={18} /></button>
              </section>
            ) : (
              <div className="cards">
                <section className="panel form-card">
                  <div className="card-top"><div className="card-icon"><UserRoundPlus size={20} /></div><span className="tag tag--green">TESTE REAL</span></div>
                  <h2>{page === 'cadastro' ? 'Cadastrar um nome' : 'Vamos começar?'}</h2>
                  <p className="description">Digite um nome e envie. O registro será armazenado no PostgreSQL via Supabase.</p>
                  <form onSubmit={submit} noValidate>
                    <label htmlFor="nome">Nome</label>
                    <input id="nome" name="nome" type="text" autoComplete="name" maxLength={80}
                      placeholder="Digite seu nome aqui" value={nome} disabled={status === 'loading'}
                      onChange={(event) => { setNome(event.target.value); if (status !== 'loading') { setStatus('idle'); setFeedback(''); } }} />
                    <span className="input-hint">Somente um campo. Integração completa.</span>
                    <button className="primary-button save-button" type="submit" disabled={status === 'loading'}>
                      {status === 'loading' ? 'Enviando...' : 'Salvar no banco'}
                      {status === 'loading' ? <span className="spinner" /> : <ArrowRight size={18} />}
                    </button>
                    {feedback && <div className={'feedback feedback--' + status} role="status" aria-live="polite">
                      {status === 'success' ? <CheckCircle2 size={18} /> : <Info size={18} />}<span>{feedback}</span>
                    </div>}
                  </form>
                  {ultimoNome && <div className="last-entry"><CheckCircle2 size={16} />Último envio nesta sessão: <strong>{ultimoNome}</strong></div>}
                  <div className="form-foot"><ShieldCheck size={16} /> Sem senha • sem leitura pública dos registros</div>
                </section>
                <section className="panel flow-card">
                  <div className="card-top"><div className="card-icon card-icon--purple"><LayoutPanelLeft size={20} /></div><span className="tag">ARQUITETURA</span></div>
                  <h2>Por trás do clique</h2>
                  <p className="description">Três tecnologias trabalhando juntas.</p>
                  <div className="flow-list">
                    <div className="flow-step"><div className="flow-icon react"><Atom size={24} /></div><div><strong>React</strong><span>Interface e formulário</span></div><CheckCircle2 size={18} className="flow-check" /></div>
                    <div className="flow-line" />
                    <div className="flow-step"><div className="flow-icon db"><Database size={23} /></div><div><strong>Supabase</strong><span>PostgreSQL + segurança RLS</span></div><CheckCircle2 size={18} className="flow-check" /></div>
                    <div className="flow-line" />
                    <div className="flow-step"><div className="flow-icon cloud"><Cloud size={23} /></div><div><strong>Vercel</strong><span>Build e hospedagem web</span></div><CheckCircle2 size={18} className="flow-check" /></div>
                  </div>
                  <div className="flow-note"><Sparkles size={18} /> O formulário é real. Os menus são mockados para este teste.</div>
                </section>
              </div>
            )}
            <div className="bottom-strip"><span>Feito para aprender, testar e evoluir.</span>
              <a href="https://github.com/Walace-Dev/app_oficina_conexao_tech" target="_blank" rel="noopener noreferrer"><Github size={17} /> Ver repositório <ExternalLink size={14} /></a>
            </div>
          </div>
        </main>
        <footer className="desktop-footer"><span>© 2026 Conexão Tech • CompEng Lab</span>
          <nav aria-label="Navegação do rodapé">{pages.map((item) => <button key={item.id} onClick={() => navigate(item.id)} className={page === item.id ? 'footer-current' : ''}>{item.label}</button>)}</nav>
          <span className="footer-built"><Send size={14} /> Construído com React</span>
        </footer>
      </div>
      <nav className="bottom-nav" aria-label="Navegação móvel">
        {pages.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => navigate(item.id)} className={page === item.id ? 'bottom-current' : ''} aria-current={page === item.id ? 'page' : undefined}><Icon size={21} /><span>{item.label}</span></button>; })}
      </nav>
    </div>
  );
}
