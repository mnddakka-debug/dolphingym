import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Capture console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });

  page.on('pageerror', err => {
    console.log('PAGE ERROR STR:', err.toString());
    console.log('PAGE ERROR STACK:', err.stack);
  });

  await page.goto('https://mnddakka-debug.github.io/dolphingym/?v=' + Date.now(), { waitUntil: 'networkidle0' });
  
  console.log('Page loaded. Attempting login...');
  
  try {
     await page.evaluate(() => {
        localStorage.setItem('gym_user', JSON.stringify({
          id: 'admin-1',
          name: 'Gym Manager',
          email: 'admin@example.com',
          role: 'admin',
          status: 'active',
          points: 100,
          badges: []
        }));
     });
     
     console.log('Reloading to bypass auth UI...');
     await page.reload({ waitUntil: 'networkidle0' });
     
     // wait a bit for react to render
     await new Promise(r => setTimeout(r, 2000));
     
     console.log('Checking for issues post-login...');
     
     const rootHtml = await page.$eval('#root', el => el.innerHTML);
     if (rootHtml.trim() === '') {
        console.log('Root is still empty/black screen.');
     } else {
        console.log('Seems to render something. Root length:', rootHtml.length);
     }
  } catch(e) {
     console.log('Puppeteer script error:', e.message);
  }

  await browser.close();
})();
