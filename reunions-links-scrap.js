
const axios = require("axios")
const cheerio = require("cheerio")
const fs = require('fs')

const base = "https://hch.elturf.com/hipodromochile/"


function getCalendaryResults_urls_hipodromochile(){
    const links = []

    for(let year = 1998; year<2023; year++){
        links.push(`${base}carreras-calendario-anual?id_pais_programa=&fecha_reunion=0000-00-00&fecha_reunion_ano=${year}&fecha_reunion_mes=12#calendario_anual_12`)
    }
    links.push('stoper')
    return links
}



async function getSite(links, index){ // str[], int
    if(index >= links.length){
        return
    }
    const axiosResponse = await axios.request({
        method: "GET",
        url: links[index],
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
        }
    })
    return axiosResponse
}

async function parseSite_getLinks(html){ //string
    const load = cheerio.load(html.data)

    const anchorElements = load('.cal_resultado').find('a')

    const urlList = []
    for(const a of anchorElements){
        urlList.push(a.attribs.href)
    }
    return urlList
}

const storage = {
    "reuniones": [],
}

const calendary = getCalendaryResults_urls_hipodromochile();


async function scrap(arr,index){

    if(index >= arr.length-1){
        const filePath = __dirname + '/out/' + 'r.json'
        console.log(storage.reuniones)
        return fs.writeFileSync( filePath, JSON.stringify(storage))
    } else {

        const result = getSite(arr,index)
        result
            .then((response)=>{
                return parseSite_getLinks(response)
            }).then((data)=>{
                storage.reuniones = storage.reuniones.concat(data)
            }).then(()=>{
                return scrap(arr, index+1)
            })
    }
    
}

const test = [
    "https://hch.elturf.com/hipodromochile/carreras-calendario-anual?id_pais_programa=&fecha_reunion=0000-00-00&fecha_reunion_ano=2023&fecha_reunion_mes=12#calendario_anual_12"
    , 'stoper'
]

