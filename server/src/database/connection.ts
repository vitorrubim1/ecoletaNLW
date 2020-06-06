import knex from 'knex';
import path from 'path'; //VEM POR PADRÃO NO NODE

const connection = knex({
    client: 'sqlite3', //O DB DE USO
    connection: {
        filename: path.resolve(__dirname, 'database.sqlite'), //AONDE FICARÁ A CONX
    },
    useNullAsDefault: true,
});

export default connection;