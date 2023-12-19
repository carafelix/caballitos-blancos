const fs = require('fs');
const base = __dirname + '/out/'
const outputFilePath = base + 'formatted_data.json';

const readStream = fs.createReadStream(outputFilePath, { encoding: 'utf8' });

const jsonArr = [];

let buffer = '';

readStream.on('data', (chunk) => {

  buffer += chunk;
  let index;

  while ((index = buffer.indexOf(',\n{"carrera":')) !== -1) {

        const part = buffer.slice(0,index)

        try {
            JSON.parse(part)
        } catch (error) {
            continue
        }

        jsonArr.push(JSON.parse(part))

        buffer = buffer.slice(index + 1);
  }
});

readStream.on('end', () => {

    // model the data and pipe it into postgres

    const races = jsonArr.map((v)=>{
        return {
            id: v?.carrera.id_carrera,
            nombre: v?.carrera?.nombre_premio,
            reunion: v?.carrera?.reunion?.id,
            hora: v?.carrera?.hora,
            premios: {
                bolsa: v?.carrera?.premios?.bolsa_premios,
                distribucion: v?.carrera?.premios?.premios
            },
            tipo_carrera: v?.carrera?.tipo_carrera?.tipo_carrera,
            condicion: v?.carrera?.condicion?.abreviatura,
            indice: v?.carrera?.indice?.indice,
            distancia: v?.carrera?.distancia?.distancia,
            estado_pista: v?.carrera?.estado_pista?.estado_pista,
            finish_time: v?.carrera?.resultado?.resultado,
            leaderboard: v?.ejemplares?.map((c)=>{
                return {
                    caballo: {
                        id: c?.ejemplar?.id,
                        peso: c?.peso_ejemplar?.peso_ejemplar
                    },
                    jinete: {
                        id: c?.jinete?.id,
                        peso: c?.peso_jinete?.peso_jinete
                    },
                    preparador: c?.preparador?.id,
                    stud: c?.stud?.id,
                    lugar: c?.resultado?.lugar,
                    distancia_ganador: c?.resultado?.distancia_ganador.distancia_llegada 
                }
            }),
            retiros: v?.retiros,
            favorito: v?.favorito
        }
    })

    fs.writeFileSync(__dirname + '/data/carreras_minify.json', JSON.stringify(races))



    }
)