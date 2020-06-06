import { Request, Response } from 'express';
import knex from '../database/connection'; //CONEXÃO COM DB

class PointsController{

    //MOSTRANDO TODOS
    async index(request: Request, response: Response){
        const { city, uf, items } = request.query;

        const parsedItems = String(items) //FORÇANDO OS ITEMS VIR COMO STRING
            .split(',') //DIVIDINDO PELAS VÍRGULAS
            .map(item => Number(item.trim())); //TIRANDO OS ESPAÇOS

        const points = await knex('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems) //SE PELO MENOS ALGUM ITEM Q VEIO NO FILTRO TEM EM ALGUM ID DA TABLE
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*')

        return response.json(points);
    }

    //MOSTRANDO COM ESPECIFICIDADE
    async show(request: Request, response: Response){
        const { id } = request.params; //BUSCO ID DA ROTA

        const point = await knex('points').where('id', id).first();

        if(!point){
            return response.status(400).json({ message: 'Point not found.' });
        }

        const items = await knex('items')
            .join('point_items', 'items.id', '=', 'point_items.item_id')
            .where('point_items.point_id', id)
            .select('items.title');

        return response.json({ point, items });
    }

    //CRIANDO
    async create (request: Request, response: Response){
        const { //VALORES
            name, 
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items //ARRAY
        } = request.body;
    
        const trx = await knex.transaction(); //PRA Q SÓ EXECUTE AS QUERY, SE HOUVER SUCESSO EM TODAS
    
        const point = { //INSERINDO NA TABLE, E PEGANDO O ID QUE POR PADRÃO É RETORNADO
            image: 'https://images.unsplash.com/photo-1556767576-5ec41e3239ea?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60',
            name, 
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        }

        const insertedIds = await trx('points').insert(point);
    
        const point_id = insertedIds[0];
    
        const pointItems = items.map((item_id: number) => {
            return{
                item_id,
                point_id,
            };
        });
    
        await trx('point_items').insert(pointItems);
    
        await trx.commit(); //ESPERANDO INSERIR NAS TABLES

        return response.json({ 
            //RETORNANDO TODA INFORMAÇÃO Q FOI CRIADA
            id: point_id,
            ...point,
         });
    }
}

export default PointsController;