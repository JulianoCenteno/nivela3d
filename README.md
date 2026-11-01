# Nivela 3D

Gestão inteligente para impressão 3D: **cada impressão conta, cada lucro também.**

MVP com: login e cadastro, calculadora de preço (material, energia, desgaste, manutenção, falhas, mão de obra, extras e taxa do canal), impressoras, materiais, canais de venda, produtos, vendas, painel de lucro mensal, tema claro/escuro, planos com limites e liberação automática por webhook da plataforma de vendas.

**Stack:** Next.js 15 + Tailwind 4 · Supabase (login + banco Postgres) · hospedagem na Vercel.

---

## Colocar no ar (passo a passo, ~30 min)

### 1. Supabase (banco e login)
1. Crie uma conta em supabase.com → **New project** (região: *South America – São Paulo*).
2. Vá em **SQL Editor** → **New query**, cole o conteúdo de `supabase/migrations/0001_init.sql` e clique em **Run**. Depois faça o mesmo com `0002_insumos.sql`.
3. Em **Authentication → URL Configuration**:
   - *Site URL*: o endereço do app (ex.: `https://app.nivela3d.com.br`)
   - *Redirect URLs*: adicione `https://app.nivela3d.com.br/auth/callback`
4. Em **Authentication → Email Templates**, traduza os e-mails de confirmação e de recuperação de senha para português.
5. Em **Project Settings → API**, copie a *Project URL*, a chave *anon public* e a chave *service_role*.

### 2. GitHub
Crie um repositório privado e envie esta pasta (sem `node_modules`).

### 3. Vercel (hospedagem)
1. Em vercel.com → **Add New Project** → importe o repositório.
2. Em **Environment Variables**, preencha as variáveis listadas em `.env.example`.
3. Clique em **Deploy**. Depois, em **Domains**, conecte o domínio.

### 4. Plataforma de vendas (App Digital Hub)
1. Crie os 3 produtos/ofertas (Iniciante, Profissional, Empresa), mensais e anuais.
2. Cadastre o webhook de compra, renovação, cancelamento e reembolso com a URL:
   `https://SEU-DOMINIO/api/webhooks/digitalhub?token=SEU_DIGITALHUB_WEBHOOK_TOKEN`
3. Coloque os links de checkout nas variáveis `NEXT_PUBLIC_CHECKOUT_*`.

O plano é vinculado pelo **e-mail da compra**. Quem comprar deve criar a conta no app com o mesmo e-mail (a ordem não importa).

> **Importante:** ainda não conhecemos o formato exato do webhook da plataforma. O parser (`src/lib/webhook.ts`) reconhece os formatos mais comuns, e **todo evento recebido fica salvo** na tabela `webhook_events` (com o resultado). Faça uma compra de teste e confira essa tabela no Supabase. Se aparecer como "ignorado", ajuste o parser com base no evento salvo.

---

## Regras de plano (no banco, valem para tudo)

| Plano | Impressoras | Produtos |
|---|---|---|
| Teste grátis (7 dias após cadastro) | 1 | 30 |
| Iniciante | 1 | 30 |
| Profissional | 5 | 200 |
| Empresa | 15 | 5.000 |

Sem plano ativo, a pessoa consegue ver os próprios dados, mas não cadastra nada novo. Para mudar os dias de teste, edite `trial_days()` no SQL. Para mudar os limites, edite `plan_limit()` no SQL e `src/lib/plans.ts`.

## Desenvolvimento local

```bash
npm install
cp .env.example .env.local   # preencha
npm run dev                  # http://localhost:3000
npm test                     # testes do motor de cálculo e do webhook
```

## Estrutura

```
supabase/migrations/0001_init.sql   tabelas, segurança (RLS), limites de plano, gatilhos
src/lib/calc.ts                     motor de cálculo (testado)
src/lib/webhook.ts                  leitura do webhook da plataforma (testado)
src/app/(auth)/                     login, cadastro, recuperar senha
src/app/(app)/                      painel, calculadora, produtos, vendas, impressoras, materiais, custos, plano, clube
src/app/api/webhooks/digitalhub/    endpoint do webhook
public/brand/                       logo clara, escura, ícone e ícone de app (SVG)
```

## Próximas etapas (fase 2)
Clientes e pedidos com status de produção · orçamentos em PDF · estoque de filamento com baixa automática · simulador de marketplaces · relatórios por máquina/categoria · exportação CSV · assistente de IA.
