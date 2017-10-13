const puppeteer = require('puppeteer');
let browser = false;

async function getStockInfo(keys){
    console.log('getStockInfo', keys);

    let now = new Date();
    const page = await browser.newPage();
    await page.goto(
        `http://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=${keys}&json=1&delay=0&_=${now.getTime()}`, 
        {waitUntil: 'networkidle'}
    );
    const bodyHandle = await page.$('body');
    const html = await page.evaluate(body => body.innerHTML, bodyHandle);
    await page.close();
    return JSON.parse(html);
}

async function getStock(stock_id){
    // console.log('[getStock id] ', stock_id);

    now = new Date();
    const page = await browser.newPage();
    await page.goto(`http://mis.twse.com.tw/stock/api/getStock.jsp?ch=${stock_id}.tw&json=1&_=${now.getTime()}`);
    const bodyHandle = await page.$('body');
    const html = await page.evaluate(body => body.innerHTML, bodyHandle);
    const res = JSON.parse(html);
    await page.close();
    return res;
}

async function getStocks(stock_ids){
    // console.log('[getStocks ids] ', stock_ids);
    let result = false;

    stock_ids = [].concat(stock_ids);
    if(stock_ids.length > 0){
        let queryKeys = [];

        // start brwoser
        browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
            // headless: false,
            // slowMo: 250 // slow down by 250ms
        });

        // get cookies
        const page = await browser.newPage();
        await page.goto(`http://mis.twse.com.tw/stock/fibest.jsp?lang=zh_tw&stock=${stock_ids[0]}`);
        // const cookies = await page.cookies();
        // console.log(cookies);

        // get query keys
        await Promise.all(stock_ids.map(async (id) => {
            const res = await getStock(id);
            if(res && res.rtcode === '0000'){
                if(res.msgArray && res.msgArray[0] && res.msgArray[0].key){
                    // console.log(res.msgArray[0].key);
                    queryKeys.push(res.msgArray[0].key);    
                }
            }
        }));

        // console.log('[getStocks queryKeys] ', queryKeys);

        if(queryKeys.length > 0){
            const keys = queryKeys.join('|');
            result = await getStockInfo(keys);
        }
    }

    await browser.close();
    // console.log('[getStocks return] ', result);
    return result;
}

module.exports = getStocks;

// Promise.all([getStocks(['2327', '2890', '6180'])])
// .then(message => console.log(message))
// .catch(error => console.log(error))