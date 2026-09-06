const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const delay = ms => new Promise(r => setTimeout(r, ms));

const ARTIFACTS_DIR = 'C:\\Users\\THE COMPUTER MART\\.gemini\\antigravity-ide\\brain\\0a902b0c-5b2b-4fcb-890e-07b20d75c180';

async function runTests() {
  console.log("Starting tests...");
  const browser = await puppeteer.launch({ headless: 'new' });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    console.log("Logging in as admin...");
    await page.goto('http://localhost:3000/auth/login');
    await page.type('input[name="email"]', 'admin@abhartbrands.com');
    await page.type('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation();

    console.log("Navigating to admin pools...");
    await page.goto('http://localhost:3000/admin/pools');
    
    // Wait for the table to load
    try { await page.waitForSelector('table', { timeout: 10000 }); } catch (e) {}
    
    console.log("Testing Delete Pool...");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'admin_pools_before_delete.png') });
    
    page.on('dialog', async dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      await dialog.accept();
    });

    let deleteButtons = await page.$$('::-p-text(Delete)');
    if (deleteButtons.length > 0) {
      await deleteButtons[0].click();
      await delay(2000); 
      console.log("Pool deleted.");
    } else {
      console.log("No delete button found.");
    }
    
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'admin_pools_after_delete.png') });

    console.log("Testing Manage Route...");
    const manageLinks = await page.$$('::-p-text(Manage)');
    if (manageLinks.length > 0) {
      await manageLinks[0].click();
      await page.waitForNavigation();
      console.log(`Navigated to: ${page.url()}`);
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'admin_manage_route.png') });
    } else {
      console.log("No manage link found.");
    }

    const client = await page.createCDPSession();
    await client.send('Network.clearBrowserCookies');

    console.log("Testing Signup with Address...");
    await page.goto('http://localhost:3000/auth/signup');
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'signup_form.png') });
    
    await page.type('input[name="full_name"]', 'Test Buyer QA');
    await page.type('input[name="company_name"]', 'Test Corp QA');
    await page.type('input[name="phone"]', '9876543210');
    await page.type('textarea[name="address"]', '123 Main Street, Mumbai');
    // generate random email to avoid duplicate error
    const email = 'testbuyerqa' + Date.now() + '@test.com';
    await page.type('input[name="email"]', email);
    await page.type('input[name="password"]', 'Buyer@123');
    
    await page.click('button[type="submit"]');
    await delay(3000); 
    
    console.log("Logging in as buyer...");
    await page.goto('http://localhost:3000/auth/login');
    await page.type('input[name="email"]', email);
    await page.type('input[name="password"]', 'Buyer@123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation();

    console.log("Checking profile...");
    await page.goto('http://localhost:3000/dashboard/profile');
    await delay(2000);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'buyer_profile.png') });

    console.log("Testing Join Pool...");
    await page.goto('http://localhost:3000/pools');
    await delay(2000);
    const viewPoolLinks = await page.$$('::-p-text(View Pool)');
    if (viewPoolLinks.length > 0) {
      await viewPoolLinks[0].click();
      await page.waitForNavigation();
      
      await page.type('input[type="number"]', '50');
      await delay(1000); 
      
      const joinButtons = await page.$$('::-p-text(Join Pool Now)');
      if (joinButtons.length > 0) {
        await joinButtons[0].click();
        await delay(3000); 
      }
    }
    
    await page.goto('http://localhost:3000/dashboard');
    await delay(2000);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'buyer_dashboard_after_join.png') });

    await client.send('Network.clearBrowserCookies');

    console.log("Testing Admin Orders...");
    await page.goto('http://localhost:3000/auth/login');
    await page.type('input[name="email"]', 'admin@abhartbrands.com');
    await page.type('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation();

    await page.goto('http://localhost:3000/admin/orders');
    try { await page.waitForSelector('table', { timeout: 10000 }); } catch (e) {}
    await delay(2000);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'admin_orders_table.png') });

    console.log("All tests completed.");

  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await browser.close();
  }
}

runTests();