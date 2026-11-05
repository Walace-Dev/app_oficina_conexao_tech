-- Esquema aplicado no Supabase em 04/11/2026.
-- Cadastro de teste: visitantes podem inserir, mas não ler, alterar ou excluir.
create table public.oficina_nomes (
  id bigint generated always as identity primary key,
  nome varchar(80) not null,
  criado_em timestamptz not null default now(),
  constraint oficina_nomes_nome_valido check (char_length(btrim(nome)) between 1 and 80)
);

alter table public.oficina_nomes enable row level security;
revoke all on table public.oficina_nomes from anon, authenticated;
grant insert (nome) on table public.oficina_nomes to anon, authenticated;

create policy "visitantes_podem_inserir_nome"
on public.oficina_nomes for insert
to anon, authenticated
with check (char_length(btrim(nome)) between 1 and 80);
