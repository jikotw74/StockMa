const puppeteer = require('puppeteer');
let browser = false;

async function getStockInfo(key){
    let now = new Date();
    const page = await browser.newPage();
    await page.goto(
        `http://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=${key}&json=1&delay=0&_=${now.getTime()}`, 
        {waitUntil: 'networkidle'}
    );
    const bodyHandle = await page.$('body');
    const html = await page.evaluate(body => body.innerHTML, bodyHandle);
    return JSON.parse(html);
}

async function getStock(stock_id){
    browser = await puppeteer.launch({
        // headless: false,
        // slowMo: 250 // slow down by 250ms
    });

    let now = new Date();
    let results = [];

    // get cookies
    const page = await browser.newPage();
    await page.goto(`http://mis.twse.com.tw/stock/fibest.jsp?lang=zh_tw&stock=${stock_id}`);
    // const cookies = await page.cookies();
    // console.log(cookies);

    now = new Date();
    const page2 = await browser.newPage();
    await page2.goto(`http://mis.twse.com.tw/stock/api/getStock.jsp?ch=${stock_id}.tw&json=1&_=${now.getTime()}`);
    const bodyHandle = await page2.$('body');
    const html = await page2.evaluate(body => body.innerHTML, bodyHandle);
    const res = JSON.parse(html);

    if(res && res.rtcode === '0000'){
        await Promise.all(res.msgArray.map(async (item) => {
            const info = await getStockInfo(item.key);
            results.push(info);
        }));
    }

    await browser.close();
    console.log('getStock', results);
    return results;
}

module.exports = getStock;