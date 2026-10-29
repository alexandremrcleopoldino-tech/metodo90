# Guia de Publicação na Vercel — Método Acordo 90

Este projeto está 100% pronto para publicação estática de alta performance na **Vercel** (com suporte a cache CDN global, segurança de cabeçalhos e variáveis de ambiente).

---

## 🚀 Opção 1: Publicação via Painel Web da Vercel (Mais Fácil)

1. **Suba seu projeto para o GitHub**:
   - Crie um repositório no seu GitHub (ex: `metodo-acordo-90`).
   - Faça o commit e envie os arquivos (o arquivo `.gitignore` já está configurado para não enviar o seu `.env` com dados sensíveis).

2. **Conecte na Vercel**:
   - Acesse [vercel.com](https://vercel.com) e faça login.
   - Clique em **"Add New..."** > **"Project"**.
   - Selecione o repositório que você acabou de criar.

3. **Configuração de Build & Output**:
   - **Framework Preset**: `Other` (HTML/CSS/JS Estático).
   - **Root Directory**: `./` (padrão).
   - O arquivo [`vercel.json`](file:///c:/Users/charn/Documents/site%20DESENROLA%203.0/vercel.json) já configurará automaticamente as regras de cache, URLs limpas e segurança.

4. **Cadastre as Variáveis de Ambiente (Environment Variables)**:
   - Na tela de deploy, abra a seção **"Environment Variables"** e adicione as variáveis presentes no seu `.env`:

| Variável | Valor | Finalidade |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_CHECKOUT_URL` | `https://pay.cakto.com.br/33hxfwd_1259544` | Link do checkout Cakto |
| `NEXT_PUBLIC_META_PIXEL_ID` | `2152210728708890` | ID do Meta Pixel |
| `NEXT_PUBLIC_PRODUCT_NAME` | `Método Acordo 90` | Nome oficial do produto |
| `NEXT_PUBLIC_PRODUCT_PRICE` | `24.90` | Valor em número para pixels |
| `NEXT_PUBLIC_PRODUCT_PRICE_FORMATTED` | `R$ 24,90` | Valor exibido na copy |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | `suporte@metodoacordo90.com.br` | E-mail de atendimento |

5. **Clique em "Deploy"**:
   - Em menos de 30 segundos seu site estará online com HTTPS gratuito e CDN global!

---

## 💻 Opção 2: Publicação via Vercel CLI (Terminal)

Se você utiliza o Vercel CLI no terminal:

```bash
# 1. Instale ou acesse o CLI
npx vercel

# 2. Siga as instruções na tela e confirme a pasta atual
# 3. Para enviar para produção com as variáveis:
npx vercel --prod
```

---

## 🔒 Segurança dos Tokens
* O arquivo `.env` local guarda seus tokens ativos com segurança no seu computador.
* O arquivo `.env.example` serve como template para qualquer outro desenvolvedor da sua equipe.
* O arquivo `.gitignore` impede qualquer vazamento acidental de tokens em commits do Git.
