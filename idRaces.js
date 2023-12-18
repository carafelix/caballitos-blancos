const fs = require('fs')
const races = require('./out/races.json')

const id_only = races.map((v)=>v.race_link.split('id_carrera=')[1])

fs.writeFileSync(__dirname + '/out/ids.json', JSON.stringify(id_only))

