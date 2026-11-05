# Oficina Conexão Tech — CompEng Lab

Aplicação de demonstração com **React 19.3.1 + Vite 8**, **Supabase (PostgreSQL)** e **Vercel**.

## Funcionalidades

- Campo único: **Nome**.
- O formulário grava o nome realmente em `public.oficina_nomes` (Supabase).
- Header, menu sidebar e rodapé navegáveis (navegação mockada com estado React).
- Layout responsivo e mensagem de sucesso ou erro.
- Segurança com RLS: visitantes só podem **inserir**, sem ler, alterar ou excluir.

## Desenvolvimento local

Requer Node.js >= 22.12.

1. `npm install`
2. Copie `.env.example` para `.env.local`.
3. Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`.
4. `npm run dev`
5. `npm run build` para validar a compilação de produção.

## Banco de dados

O esquema já foi aplicado no projeto Supabase da oficina. A referência está em `supabase/schema.sql`.

A tabela contém as colunas `id`, `nome` e `criado_em`.

Para consultar registros, acesse o SQL Editor do Supabase e execute:

```sql
select id, nome, criado_em
from public.oficina_nomes
order by criado_em desc;
```

O frontend não utiliza `.select()` após `.insert()` porque não existe permissão pública de leitura.

## Deploy Vercel

Vincule o repositório GitHub na Vercel. Framework: **Vite**; build: `npm run build`; saída: `dist`.

Cadastre em **Production**, **Preview** e **Development**:

- `VITE_SUPABASE_URL` (URL pública do projeto)
- `VITE_SUPABASE_PUBLISHABLE_KEY` (chave `sb_publishable_...`)

**Segurança:** nunca coloque chaves `service_role` ou `sb_secret_...` no browser ou em variáveis `VITE_`.

> Aviso: a oficina é pública e não exige login. A inserção anônima pode receber spam; não use para dados sensíveis. Se transformar em produto, acrescente autenticação, proteção contra abuso e limite de requisições.

## Estrutura

- `src/App.jsx`: interface e navegação simulada
- `src/lib/supabase.js`: cliente do Supabase
- `src/styles.css`: identidade visual e responsividade
- `supabase/schema.sql`: modelo do banco e políticas RLS
- `AGENTS.md`: orientações para Codex/Claude Code

## Auditoria automática semanal

O GitHub Actions executa a auditoria **toda segunda-feira às 09h** (`America/Porto_Velho`).
Ela também pode rodar manualmente em **Actions → Auditoria semanal - Conexão Tech → Run workflow** e após alterações na branch `main`.

**O que é checado:**

- Compilação do React com Vite (`npm run build`).
- Integridade do input único, header, sidebar e footer.
- Regras RLS no SQL versionado e ausência de chave privilegiada no frontend.
- Resposta HTTP 200 do site na Vercel e disponibilidade do bundle JS.
- Resposta do gateway REST do Supabase (sem realizar escrita ou leitura de nomes).

Os resultados ficam nos [workflows do GitHub Actions](https://github.com/Walace-Dev/app_oficina_conexao_tech/actions/workflows/auditoria-semanal.yml), inclusive o resumo de cada execução. Falhas produzem status vermelho; notificações por e-mail dependem das preferências de notificação do GitHub.

> **Limitação:** a checagem de RLS no GitHub é estática (código versionado). Para auditar as políticas efetivamente aplicadas no banco, consulte também o Security Advisor do Supabase. Como o frontend não possui backend próprio, logs de execução de funções Vercel não abrangem possíveis erros de JavaScript do navegador.

> **Nota:** em repositórios públicos, o GitHub pode desabilitar tarefas agendadas após 60 dias sem atividade. Verifique a aba Actions nesse caso.
