const puppeteer = require('puppeteer');
const now = new Date();
const time = now.getTime();

const start = async () => {
    const browser = await puppeteer.launch({
        // headless: false,
        // slowMo: 250 // slow down by 250ms
    });
    const page = await browser.newPage();
    await page.goto('http://mis.twse.com.tw/stock/fibest.jsp?lang=zh_tw&stock=6180');
    const cookies = await page.cookies();
    // console.log(cookies);

    const page2 = await browser.newPage();
    await page2.goto(
        `http://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=otc_6180.tw&json=1&delay=0&_=${now.getTime()}`, 
        {waitUntil: 'networkidle'}
    );
    const bodyHandle = await page2.$('body');
    const html = await page2.evaluate(body => body.innerHTML, bodyHandle);
    console.log(typeof html);
    
    return await browser.close();
}

var results = Promise.all([
    start()
]);