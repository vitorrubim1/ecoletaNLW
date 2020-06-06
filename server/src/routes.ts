import express from 'express';

//CONTROLLERS
import PointsController from './controllers/PointsController';
import ItemsController from './controllers/ItemsController';

const routes = express.Router();

//INSTANCIA DAS CLASSES
const pointsController = new PointsController();
const itemsController = new ItemsController();

//itemsController
routes.get('/items', itemsController.index); //LISTAGEM

//pointsController
routes.post('/points', pointsController.create); //CRIAÇÃO
routes.get('/points/', pointsController.index); //LISTAR VÁRIOS
routes.get('/points/:id', pointsController.show); //EXIBINDO COM ESPECIFICIDADE (COM REQUEST.PARAMS)

export default routes;