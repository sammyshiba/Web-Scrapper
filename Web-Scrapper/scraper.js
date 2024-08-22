const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox'],
    defaultViewport: null,
  });

  const page = await browser.newPage();

  try {
    // Navigate to a general product listing page
    await page.goto('https://www.pnp.co.za/?gad_source=1&gclid=Cj0KCQjww5u2BhDeARIsALBuLnOmDMKRqJti4mvOlKWsPq3IfBrPlSvCE0M6yqPivLcr8bX1F9ytalMaAmwcEALw_wcB', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Scroll to the bottom to ensure all products are loaded
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    // Delay to allow for any lazy-loaded products to appear
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Scrape the product details
    const products = await page.evaluate(() => {
      const productArray = [];
      document.querySelectorAll('.product-list__item').forEach(element => {
        const title = element.querySelector('.product-list__product-name')?.textContent.trim();
        const price = element.querySelector('.product-price')?.textContent.trim(); // Adjusted class name
        const image = element.querySelector('.product-image')?.getAttribute('src'); // Adjusted class name
        if (title && price && image) {
          productArray.push({ title, price, image });
        }
      });
      return productArray;
    });

//     // Example to log page content
// const pageContent = await page.content();
// console.log(pageContent);


    // Log the products array to verify it's populated
    console.log('Scraped Products:', products);

    // Convert product data to JSON format
    const jsonContent = JSON.stringify(products, null, 2);

    // Write the data to a file
    fs.writeFileSync('products.json', jsonContent, 'utf8');

    console.log('Product data has been saved to products.json');

  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await browser.close();
  }
})();
