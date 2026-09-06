const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--incognito', '--start-maximized']
  });
  
  const pages = await browser.pages();
  const page = pages[0] || await browser.newPage();
  
  console.log("Navigating to login page...");
  await page.goto('http://localhost:3000/auth/login');
  
  console.log("Filling credentials...");
  await page.waitForSelector('input[name="email"]');
  await page.type('input[name="email"]', 'admin@abhartbrands.com');
  
  await page.waitForSelector('input[name="password"]');
  await page.type('input[name="password"]', 'Admin@123');
  
  console.log("Clicking Sign In...");
  await page.click('button[type="submit"]');
  
  console.log("Waiting for navigation to dashboard...");
  await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
  
  console.log("Navigating to admin panel...");
  await page.goto('http://localhost:3000/admin');
  
  console.log("Done. Browser will remain open.");
})();
