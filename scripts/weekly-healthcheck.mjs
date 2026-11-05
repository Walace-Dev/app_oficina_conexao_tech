/**
 * Auditoria sem alterações de dados:
 * - --static: verifica estrutura do projeto e segurança básica do código
 * - --remote: verifica o site na Vercel e a disponibilidade da API do Supabase
 *
 * Executado automaticamente pelo GitHub Actions toda segunda-feira.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { setTimeout as pause } from 'node:timers/promises';

const APP_URL = process.env.PUBLIC_APP_URL || 'https://app-oficina-conexao-tech.vercel.app';
const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || 'https://vmkjsgjledlmdxsqursi.supabase.co';

function check(condition, message) {
  assert.ok(condition, message);
  console.log('✓ ' + message);
}

async function auditStatic() {
  const [app, client, schema, pkg, css] = await Promise.all([
    readFile('src/App.jsx', 'utf8'),
    readFile('src/lib/supabase.js', 'utf8'),
    readFile('supabase/schema.sql', 'utf8'),
    readFile('package.json', 'utf8').then(JSON.parse),
    readFile('src/styles.css', 'utf8'),
  ]);

  check((app.match(/<input\b/g) || []).length === 1, 'Existe exatamente um campo input no app');
  check(/supabase\.from\(['"]oficina_nomes['"]\)\.insert\(\{\s*nome:/s.test(app), 'Formulário persiste nomes no Supabase');
  check(!/\.insert\([\s\S]*?\)\.select\(/.test(app), 'Inserção não requisita leitura pública');
  check(app.includes('<header') && app.includes('<aside') && app.includes('<footer'), 'Header, sidebar e footer presentes');
  check(app.includes('sidebar-links') && app.includes('bottom-nav') && app.includes('desktop-footer'), 'Menus mockados presentes');
  check(css.includes('@media(max-width:760px)'), 'Estilos responsivos presentes');

  check(client.includes('VITE_SUPABASE_URL') && client.includes('VITE_SUPABASE_PUBLISHABLE_KEY'), 'Cliente usa chave pública do Supabase');
  check(!/import\.meta\.env\.VITE_(?:SERVICE_ROLE|SUPABASE_SECRET|SUPABASE_SERVICE_ROLE)/.test(client), 'Nenhuma chave privilegiada é lida pelo frontend');

  check(/alter table public\.oficina_nomes enable row level security/i.test(schema), 'RLS declarada no esquema');
  check(/grant insert\s*\(nome\)\s*on table public\.oficina_nomes to anon, authenticated/i.test(schema), 'Permissão de inserção restrita à coluna nome');
  check(/create policy[\s\S]*?for insert[\s\S]*?to anon, authenticated[\s\S]*?with check/i.test(schema), 'Política de inserção anônima presente');
  check(!/grant\s+(?:select|update|delete)\b[^;]*\bto\s+anon\b/i.test(schema), 'Esquema não concede leitura, alteração ou exclusão anônimas');

  check(Boolean(pkg.scripts?.build), 'Script de compilação existe');
  check(pkg.dependencies?.react?.startsWith('19.'), 'React 19 instalado');
  check(Boolean(pkg.dependencies?.['@supabase/supabase-js']), 'SDK oficial do Supabase instalado');
}

async function request(url, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(15000),
        headers: { 'User-Agent': 'ConexaoTech-WeeklyHealthcheck/1.0' },
        redirect: 'follow',
      });
      if (response.status >= 500 || response.status === 429) {
        throw new Error('HTTP ' + response.status);
      }
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        console.warn('Tentativa ' + attempt + ' falhou em ' + url + ': ' + error.message);
        await pause(1500 * attempt);
      }
    }
  }
  throw new Error('Recurso indisponível após ' + attempts + ' tentativas: ' + url + ' — ' + lastError.message);
}

async function auditRemote() {
  const appUrl = new URL(APP_URL);
  const supabaseUrl = new URL(SUPABASE_URL);
  check(appUrl.protocol === 'https:' && supabaseUrl.protocol === 'https:', 'Endpoints utilizam HTTPS');

  const response = await request(appUrl);
  check(response.status === 200, 'Página inicial disponível (HTTP 200)');
  const html = await response.text();
  check(/<div\s+id=["']root["']/.test(html), 'Resposta contém o ponto de entrada do React');

  const match = html.match(/<script[^>]+src=["']([^"']+\.js)["']/i);
  check(Boolean(match), 'HTML inclui o bundle JavaScript de produção');

  const jsUrl = new URL(match[1], appUrl);
  check(jsUrl.origin === appUrl.origin, 'Bundle carregado do mesmo domínio');
  const bundle = await request(jsUrl);
  check(bundle.status === 200, 'Bundle JS acessível (HTTP 200)');
  check((await bundle.text()).length > 1000, 'Bundle JS não está vazio');

  const restEndpoint = new URL('/rest/v1/', supabaseUrl);
  const dbResponse = await request(restEndpoint);
  // A API sem chave normalmente retorna 401: é esperado, não sinal de pane.
  check([200, 400, 401, 403, 404].includes(dbResponse.status),
    'Gateway da API Supabase responde (HTTP ' + dbResponse.status + ')');

  console.log('✓ Auditoria remota finalizada: teste não acessou nem alterou registros');
}

try {
  const scope = process.argv[2] || '--all';
  if (!['--static', '--remote', '--all'].includes(scope)) throw new Error('Opção inválida: ' + scope);
  if (scope === '--static' || scope === '--all') await auditStatic();
  if (scope === '--remote' || scope === '--all') await auditRemote();
  console.log('\nAUDITORIA CONCLUÍDA COM SUCESSO');
} catch (error) {
  console.error('\nFALHA NA AUDITORIA:', error.message);
  process.exitCode = 1;
}
