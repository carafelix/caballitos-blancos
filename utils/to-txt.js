const json = require('../data/caballitos.json');
const fs = require('fs')

const v = []

for(const h in json){
    v.push(json[h].nombre)
}

console.log(v);

fs.writeFileSync(__dirname + '/caballitos.txt', v.sort().join('\n'))