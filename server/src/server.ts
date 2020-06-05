import express, { response } from 'express';


const app = express();

app.get('/users', (request, response) => {
    console.log("Hello world");

    response.json([
        'Diego',
        'Vitor'
    ]);
});

app.listen(3333);