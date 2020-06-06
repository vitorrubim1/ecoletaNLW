import Knex from 'knex';

export async function up(knex: Knex) {
    //CRIA A TABELA
    return knex.schema
        .createTable('items', table => { //( table => ) REFERÊNCIA PRA TABLE 
            table.increments('id').primary();
            table.string('image').notNullable();
            table.string('title').notNullable();
        });
}

export async function down(knex: Knex) {
    //APAGA A TABELA
    return knex.schema
        .dropTable('items');
}