const axios = require('axios')
const ids = require('./out/ids.json')
const fs = require('fs')

async function getData(id){
	const response = await fetch(`https://hipodromo.elturf.com/api/general/resultado-testfp/general/${id}`, {
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

	return response.json()
}


async function main(){

    const filePath = __dirname + '/out/' + 'full_data.json'
    const stream = fs.createWriteStream(filePath)
    let time = new Date();
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
        
        const startingTime = time;
        const expectedTime = (new Date() - time) * (ids.length - i)
        finishingTime = new Date(startingTime.getTime() + expectedTime);
        finishingTime = finishingTime.toLocaleTimeString()

        console.log(`${i} out of ${ids.length}. Expected finish time: ${finishingTime}`)
    }
    stream.write(']')
    stream.close(()=>{
        console.log(`All DATA!`)
    })
}

main()