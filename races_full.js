const races = require('./out/races.json') // CommonJS
const axios = require("axios")
const cheerio = require("cheerio")
const fs = require('fs')
const buffer = require('buffer')

// CORE //

const filePath = __dirname + '/out/' + 'races_results.json';
const stream = fs.createWriteStream(filePath)
stream.write('[')

// functions

async function getSite(links, index){ // str[], int
    if(index >= links.length){
        return
    }
    const axiosResponse = await axios.request({
        method: "GET",
        url: links[index],
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
        },
        responseType: 'arraybuffer',
        responseEnconding: 'binary' // try to use a stream 
    })
    return buffer.transcode(axiosResponse.data, "binary" ,'latin1').toString("binary")
}

async function parseSite(html){ //string
    if(!html) return false;
    const load = cheerio.load(html)
    const races = []
    
    const row = load('.success')
    return row[0].attribs
}

const test = ["https://hch.elturf.com/hipodromochile/carreras-ultimos-resultados?id_pais_programa=&fecha_reunion=2020-8-29#","https://hch.elturf.com/hipodromochile/carreras-ultimos-resultados?id_pais_programa=&fecha_reunion=2020-8-29#"]




async function scrap(arr,index){    // Recursive Method


    if(index >= arr.length){
        stream.write(']');
        stream.close(()=>{
            console.log('Closed at the end of the links array')
        }) 
        return
    } else {
        const result = getSite(arr,index)

        if(!result){
            stream.write(']');
            stream.close(()=>{
                console.log('Result was undefined')
            }) 
            return;
        } 
        result
            .then((response)=>{
                return parseSite(response)
            }).then((data)=>{

                if(index === arr.length-1){
                    data = JSON.stringify(data)
                } else data = JSON.stringify(data) + ',';

                return stream.write(data);
                
            }).then(()=>{
                return scrap(arr, index+1)
            })
    }
    
}

async function scrapIterative(arr,index){
    const filePath = __dirname + '/out/' + '_test.json'

    const stream = fs.createWriteStream(filePath)


    
    
    
}
scrap(test,0)

// scrapIterative();

// for await(const site of arr){

    // }