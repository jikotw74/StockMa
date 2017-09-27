const fs = require('fs');
const puppeteer = require('puppeteer');
let db = {};

const parsePage = async (query, otc) => {
    otc = otc || false;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(query);

    const stocksArray = await page.evaluate(() => {
        const trs = Array.from(document.querySelectorAll('body > table.h4 > tbody > tr'));
        return trs.filter(tr => {
            let code = tr.querySelector('td:nth-child(6)');
            if(code){
                return code.textContent === 'ESVUFR';
            }
            return false
        }).map(tr => {
            let name = tr.querySelector('td:nth-child(1)');
            if(name){
                return name.textContent;
            }
            return "";
        })
    });

    const reg = new RegExp('^(\\d[\\d]*)\\s(\\S*)');
    
    stocksArray.forEach(stock => {
        let match = stock.match(reg);
        if(match){
            db[match[1]] = {
                'name': match[2],
                'isOtc': otc,
                'keys':[match[2]]
            }  
        }  
    })

    // console.log(db);
    
    return await browser.close();
}

var results = Promise.all([
    parsePage('http://isin.twse.com.tw/isin/C_public.jsp?strMode=2'),
    parsePage('http://isin.twse.com.tw/isin/C_public.jsp?strMode=4', true)
]);
results.then(() => {
    // console.log(db);
    fs.writeFile('stockDB.json', JSON.stringify(db), 'utf8', () => console.log('done'));
})