exports.up = function (knex) {
  return knex.schema.createTable('tickets', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title', 255).notNullable();
    table.text('description').notNullable();
    table.string('status', 50).notNullable().defaultTo('open');
    table
      .uuid('created_by')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table
      .uuid('assigned_to')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('tickets');
};