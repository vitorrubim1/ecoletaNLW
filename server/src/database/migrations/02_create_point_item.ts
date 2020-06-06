import Knex from 'knex';

export async function up(knex: Knex) {
    //CRIA A TABELA
    return knex.schema
        .createTable('point_items', table => { //( table => ) REFERÊNCIA PRA TABLE 
            table.increments('id').primary();
            table.integer('point_id')
                .notNullable()
                .references('id')
                .inTable('points');

            table.integer('item_id')
                .notNullable()
                .references('id')
                .inTable('items');
        });
}

export async function down(knex: Knex) {
    //APAGA A TABELA
    return knex.schema
        .dropTable('point_items');
}