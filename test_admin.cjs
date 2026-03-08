const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('BROWSER ERROR:', msg.text());
        }
    });

    page.on('pageerror', error => {
        console.log('PAGE ERROR (Crash):', error.message);
    });

    try {
        console.log('Navigating...');
        await page.goto('https://dolphingym.netlify.app', { waitUntil: 'domcontentloaded' });
        console.log('Page loaded');

        // login
        await page.waitForSelector('input[type="email"]');
        await page.type('input[type="email"]', 'admin@dolphingym.com');
        await page.type('input[type="password"]', '123456');
        await page.click('button[type="submit"]');
        console.log('Clicked login');

        await new Promise(r => setTimeout(r, 2000));

        // Click Admin tab using JS 
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const adminBtn = btns.find(b => b.innerText.includes('Manager Panel') || b.textContent.includes('لوحة المدير') || b.textContent.includes('Manager'));
            if (adminBtn) adminBtn.click();
        });
        console.log('Clicked Admin Tab');
        // Wait for animation
        await new Promise(r => setTimeout(r, 1000));

        // Click Equipment tab
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const eqBtn = btns.find(b => b.innerText.includes('Inventory') || b.textContent.includes('المعدات') || b.textContent.includes('Devices'));
            if (eqBtn) {
                console.log('Found equipment tab, clicking...');
                eqBtn.click();
            }
        });

        await new Promise(r => setTimeout(r, 1000));

        // Click Financials tab
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const eqBtn = btns.find(b => b.textContent.includes('Financials') || b.textContent.includes('المالية'));
            if (eqBtn) {
                console.log('Found Financials tab, clicking...');
                eqBtn.click();
            }
        });

        await new Promise(r => setTimeout(r, 2000));

        console.log('Action complete.');

    } catch (e) {
        console.error('Script Error:', e);
    } finally {
        await browser.close();
    }
})();
