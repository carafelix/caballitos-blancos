const puppeteer = require('puppeteer');
async function datos(){

    // Launch the browser and open a new blank page

        const browser = await puppeteer.launch();
        const page = await browser.newPage();

    // Navigate the page to a URL
        await page.goto('https://hipodromo.cl/carreras-resultado-ver?id_carrera=665209');

    // Set screen size
        await page.setViewport({width: 1080, height: 1024});
    
    // Wait
        const searchResultSelector = '.table-bordered.elturf_padding_tablas';
        await page.waitForSelector(searchResultSelector);

}

datos();