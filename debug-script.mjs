import express from 'express';
import puppeteer from 'puppeteer';
import path from 'path';

const app = express();
app.use('/dolphingym', express.static('dist'));
app.use(express.static('dist')); // fallback

const server = app.listen(5000, async () => {
  console.log('Server running');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
  });
  
  console.log('Navigating...');
  await page.goto('http://localhost:5000/dolphingym/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
  server.close();
  process.exit(0);
});
