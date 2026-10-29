const http = require('http');
const fs = require('fs');
const path = require('path');
const pw = require('C:\\Users\\charn\\AppData\\Local\\ms-playwright-go\\1.57.0\\package');

const PORT = 3042;
const ROOT = __dirname;
const SCREENSHOT_DIR = 'C:\\Users\\charn\\.gemini\\antigravity\\brain\\838be0c5-50ca-4aea-819f-64da4f231972\\scratch';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4'
};

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let reqPath = decodeURI(req.url.split('?')[0]);
      if (reqPath === '/') reqPath = '/index.html';
      const filePath = path.join(ROOT, reqPath);
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(404);
          res.end('404');
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content);
        }
      });
    });

    server.listen(PORT, () => {
      console.log(`Test server running at http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

async function runTests() {
  const server = await startServer();
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  const browser = await pw.chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--headless=new']
  });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // 1. Carregamento inicial
    await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    assert(consoleErrors.length === 0, `Nenhum erro no console ao carregar (erros: ${consoleErrors.join(', ')})`);

    // 2. Teste do Título da Página e Elementos Essenciais
    const title = await page.title();
    assert(title.includes('Método Acordo 90'), `Título da página correto: "${title}"`);

    const headline = await page.textContent('.quiz-main-headline');
    assert(headline.includes('DESCUBRA SE SUA DÍVIDA PODE SER QUITADA'), 'Headline do Quiz carregada');

    const price = await page.textContent('.offer-price-block .price-number');
    assert(price.trim() === '24', 'Preço da oferta ajustado para R$ 24,90');

    const bumpsCount = await page.locator('.order-bump-card').count();
    assert(bumpsCount === 0, 'Todos os order bumps foram removidos com sucesso');

    // Teste do Vídeo de Vendas
    const videoSrc = await page.getAttribute('#main-sales-video source', 'src');
    assert(videoSrc && videoSrc.includes('video1.mp4'), `Vídeo de vendas configurado com sucesso (src: ${videoSrc})`);

    // 3. Teste da Calculadora
    const initialDiscount = await page.textContent('#calc-discount-reais');
    const initialPercent = await page.textContent('#calc-discount-percent');
    assert(initialDiscount.includes('6.000,00'), `Calculadora desconto inicial R$ 6.000,00 (obteve: ${initialDiscount})`);
    assert(initialPercent.includes('60%'), `Calculadora percentual inicial 60% (obteve: ${initialPercent})`);

    // Altera valores para R$ 20.000 e R$ 2.000 (Desconto de 90%)
    await page.fill('#calc-debt-input', '2000000');
    await page.fill('#calc-proposal-input', '200000');
    const updatedDiscount = await page.textContent('#calc-discount-reais');
    const updatedPercent = await page.textContent('#calc-discount-percent');
    assert(updatedDiscount.includes('18.000,00'), `Calculadora desconto recalculado R$ 18.000,00 (obteve: ${updatedDiscount})`);
    assert(updatedPercent.includes('90%'), `Calculadora percentual recalculado 90% (obteve: ${updatedPercent})`);

    // Altera para proposta maior que dívida (R$ 5.000 e R$ 8.000)
    await page.fill('#calc-debt-input', '500000');
    await page.fill('#calc-proposal-input', '800000');
    const isAlertVisible = await page.isVisible('#calc-alert-box.is-visible');
    assert(isAlertVisible, 'Alerta de proposta maior que dívida exibido com sucesso');

    // 4. Teste do Stepper do Método ACORDO
    const step0Title = await page.textContent('#step-title');
    assert(step0Title.includes('APURE SUA DÍVIDA'), `Etapa 0 inicial correta: "${step0Title}"`);

    // Clica no passo C (Calcule o Limite)
    await page.click('#tab-step-1');
    const step1Title = await page.textContent('#step-title');
    assert(step1Title.includes('CALCULE SEU LIMITE'), `Navegação para etapa 1 correta: "${step1Title}"`);

    // Clica em "Próxima Etapa →"
    await page.click('#step-next-btn');
    const step2Title = await page.textContent('#step-title');
    assert(step2Title.includes('OBSERVE AS OPORTUNIDADES'), `Botão Próxima Etapa funcionou: "${step2Title}"`);

    // 5. Teste do Accordion de FAQ
    const faqItem0 = page.locator('.faq-item').first();
    const faqBtn0 = faqItem0.locator('.faq-question-btn');
    await faqBtn0.click();
    let isOpen = await faqItem0.evaluate(el => el.classList.contains('is-open'));
    assert(isOpen, 'Accordion abre ao clicar');
    await faqBtn0.click();
    isOpen = await faqItem0.evaluate(el => el.classList.contains('is-open'));
    assert(!isOpen, 'Accordion fecha ao clicar novamente');

    // 6. Teste do Modal de Prévia
    const previewTrigger = page.locator('button[data-preview-index="0"]').first();
    await previewTrigger.click();
    await page.waitForTimeout(250); // espera animação de transição
    const isModalOpen = await page.isVisible('#preview-modal');
    assert(isModalOpen, 'Modal de prévia aberto com sucesso');

    // Fecha com tecla Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(250);
    const isModalClosed = await page.evaluate(() => !document.getElementById('preview-modal').classList.contains('is-open'));
    assert(isModalClosed, 'Modal de prévia fechado com tecla Escape');

    // 7. Teste dos Feedbacks Reais (WhatsApp)
    const feedbackCards = await page.locator('.feedback-card-sketch').count();
    assert(feedbackCards === 3, `Seção de feedbacks exibe 3 relatos reais (encontrou: ${feedbackCards})`);
    const firstQuote = await page.locator('.feedback-highlight-quote').first().textContent();
    assert(firstQuote.includes('mais de 20 mil'), 'Conteúdo do feedback real validado');

    // 7. Teste de Responsividade e Captura de Telas (360px, 390px, 768px, 1024px, 1440px)
    const viewports = [
      { name: 'mobile_360', width: 360, height: 740 },
      { name: 'mobile_390', width: 390, height: 844 },
      { name: 'tablet_768', width: 768, height: 1024 },
      { name: 'desktop_1024', width: 1024, height: 768 },
      { name: 'desktop_1440', width: 1440, height: 900 }
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle' });
      
      // Verifica overflow horizontal
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      assert(!hasHorizontalScroll, `Viewport ${vp.name} (${vp.width}px): Sem rolagem horizontal indesejada`);

      // Teste do Sticky CTA no mobile (scroll past hero CTA)
      if (vp.width <= 768) {
        await page.evaluate(() => {
          window.scrollTo(0, 2000);
          window.dispatchEvent(new Event('scroll'));
        });
        await page.waitForTimeout(250);
        const stickyVisible = await page.evaluate(() => document.getElementById('mobile-sticky-cta').classList.contains('is-visible'));
        assert(stickyVisible, `Viewport ${vp.name}: Sticky CTA apareceu após rolagem`);
        
        // Retorna ao topo para screenshot fiel
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(100);
      }

      // Captura screenshot do Hero e página completa
      const shotPath = path.join(SCREENSHOT_DIR, `review_${vp.name}.png`);
      await page.screenshot({ path: shotPath, fullPage: false });
      console.log(`Screenshot salvo: ${shotPath}`);
    }

    console.log(`\n================================`);
    console.log(`RESULTADO DOS TESTES: ${passed} passaram, ${failed} falharam.`);
    console.log(`================================\n`);

  } catch (err) {
    console.error('Erro na execução dos testes:', err);
  } finally {
    await browser.close();
    server.close();
  }
}

runTests();
