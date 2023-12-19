// import data from './out/reunions.json' assert { type: "json" }; ES6
const reuniones = require('../out/reunions.json') // CommonJS

const axios = require("axios")
const cheerio = require("cheerio")
const fs = require('fs')
const buffer = require('buffer')

const base = "https://hch.elturf.com/hipodromochile/"
const test = ["https://hch.elturf.com/hipodromochile/carreras-ultimos-resultados?id_pais_programa=&fecha_reunion=2020-8-29#"]

const links = []

for(let day of reuniones) {
    links.push(base+day)
}

// core

class Race{                                              // condicional, handicap, clasico

    constructor(reunion_title, reunion_parent, n, hour, race_name, race_link, distance, cd_hd_cl, classic_type, indice_hd, horse_requirements, prize, video_url, internal_id){
        this.reunion_title = reunion_title;
        this.reunion_parent = reunion_parent
        this.n = n;
        this.hour = hour;
        this.race_name = race_name;
        this.race_link = race_link;
        this.distance = distance;
        this.cd_hd_cl = cd_hd_cl;
        this.classic_type = classic_type;
        this.indice_hd = indice_hd;
        this.horse_requirements = horse_requirements;
        this.prize = prize;
        this.video_url = video_url;
        this.internal_id = internal_id;
    }
}

let storage = [];

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
        responseEnconding: 'binary'
    })
    return [buffer.transcode(axiosResponse.data, "binary" ,'latin1').toString("binary"),links[index]]
}
let acc = 0;

async function parseSite(html,parentLink){ //string
    if(!html) return false;
    const load = cheerio.load(html)
    const reunion_title = load('.tituloshome')[0]?.firstChild?.data
    const races = []

    const rows = load('tbody').find('tr[style="vertical-align:top;"]')
    
    for(let i=0; i<rows.length; i++){
        const reunionParentUrl = parentLink;
        const filtered = rows[i]?.childNodes?.filter((v)=>v?.type !== 'text')
        const n = i+1;
        const hour = filtered[1]?.children?.[0]?.data
        const raceName = filtered[2]?.children[1]?.children[0]?.data
        const raceLink = filtered[2]?.children[1]?.attribs.href
        if(!raceLink) continue;
        const distance = filtered[3]?.children[0]?.data
        const classicType = filtered[5]?.children[1]?.children[0]?.children[0]?.data;
        const index_hd = filtered[6]?.children[0]?.data.replace(/\t/g,'').replace(/\n/g,'')
        const raceType = filtered[4]?.children[1]?.children[0].data
        const rules = filtered[7]?.children[0]?.data
        const prize = filtered[8]?.children[0]?.data.replace(/\t/g,'').replace(/\n/g,'')
        const videoUrl = filtered[11]?.children[1]?.attribs?.href
        const id = acc++

        races.push(
            new Race(reunion_title, reunionParentUrl, n, hour, raceName, raceLink, distance,raceType,classicType,index_hd,rules,prize,videoUrl,id)
        )
    }
    return races
}


async function scrap(arr,index){ // check out races_full.js stream logic. much better since if the script fails at some point you don't lose it all

    const filePath = __dirname + '/out/' + 'races_2.json'

    if(index >= arr.length){
        return fs.writeFileSync( filePath, JSON.stringify(storage))
    } else {

        const result = getSite(arr,index)

        if(!result) return fs.writeFileSync( filePath, JSON.stringify(storage));

        result
            .then((response)=>{
                return parseSite(response[0],response[1])
            }).then((data)=>{
                storage = storage.concat(data)
            }).then(()=>{
                console.log(acc)
                return scrap(arr, index+1)
            })
    }
    
}

scrap(links, 0)

