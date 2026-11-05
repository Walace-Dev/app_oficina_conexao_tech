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
