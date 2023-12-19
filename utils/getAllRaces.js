#!/bin/bash/env node

const axios = require('axios')
const ids = require('./out/ids.json')
const fs = require('fs')
const { setTimeout } = require("timers/promises");
const { createSpinner } = require('nanospinner')


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

    let time = new Date();
    let finishingTime;
    console.log('\n');
    const spinner = createSpinner('DATA DATA DATA WE GO!').start()

    for(let i = 0; i < ids.length; i++){
        const id = ids[i]
        const data = await getData(id);

        if(!data.carreras_reunion){
            stream.write(']')
            stream.close()
            spinner.error({ text: `Mission Failed! At least it we got up to ${i} races`, mark: ':(' })
            return;
        }

        data.carreras_reunion = data.carreras_reunion.filter(race => race.id_carrera == id);
        stream.write(JSON.stringify(data))
        stream.write(',')


        if(!(i%10)){
            const startingTime = time;
            const expectedTime = (new Date() - time) * ((ids.length - i)/10) 
            finishingTime = new Date(startingTime.getTime() + expectedTime);
            finishingTime = finishingTime.toLocaleTimeString()
            time = new Date()
        }

        spinner.update({
            text: `DATA DATA DATA! we are at ${i} out of ${ids.length}. Expected finishing time: ${finishingTime}`,
            color: 'white',
            stream: process.stdout,
            interval: 100,
          })

    }
    stream.write(']')
    stream.close(()=>{
        console.log(`All DATA!`)
    })
    spinner.success({ text: 'Successful!', mark: ':)' })

}

main()