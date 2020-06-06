import { Request, Response } from 'express';
import knex from '../database/connection'; //CONEXÃO COM DB

class ItemsController{
    //LISTAGEM
    async index (request: Request, response: Response){
        const items = await knex('items').select('*'); //BUSCO TUDO DA TABLE
    
        const serializedItems = items.map(item => { //PERCORRO A TABLE E RETORNO UMA URL DA IMG, PARA FACILITAR PRO FRONT
            return {
                id: item.id,
                title: item.title,
                image_url: `http://localhost:3333/uploads/${item.image}`,  
            }
        });
    
        return response.json(serializedItems);
    }
}

export default ItemsController;