const axios = require('axios')
const ids = require('./out/ids.json')
const fs = require('fs')
const { setTimeout } = require("timers/promises");

async function getData(id){
    let response;
	try {
        response = await fetch(`https://hipodromo.elturf.com/api/general/resultado-testfp/general/${id}`, {
        "credentials": "omit",
        "headers": {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "en-US,en;q=0.5",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "cross-site"
        },
        "referrer": "https://hipodromo.cl/",
        "method": "GET",
        "mode": "no-cors"
        });

    } catch {
        await setTimeout(3000)
        return getData(id)
    }

	return response.json()
}


async function main(){

    const filePath = __dirname + '/out/' + 'full_data.json'
    const stream = fs.createWriteStream(filePath)
    stream.write('[')
    for(let i = 0; i < ids.length; i++){
        const id = ids[i]
        const data = await getData(id);

        if(!data.carreras_reunion){
            stream.write(']')
            stream.close(()=>{
                console.log(`Result was undefined. Closing at: ${i}`)
            })
            return;
        }

        data.carreras_reunion = data.carreras_reunion.filter(race => race.id_carrera == id);
        stream.write(JSON.stringify(data))
        stream.write(',')
        
        console.log(`${i} out of ${ids.length}.`)
    }
    stream.write(']')
    stream.close(()=>{
        console.log(`All DATA!`)
    })
}

main()