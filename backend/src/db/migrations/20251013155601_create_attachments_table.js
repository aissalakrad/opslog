exports.up = function (knex) {
  return knex.schema.createTable('attachments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('ticket_id')
      .references('id')
      .inTable('tickets')
      .onDelete('CASCADE')
      .notNullable();
    table
      .uuid('uploaded_by')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table.string('filename').notNullable();
    table.string('filepath').notNullable();
    table.string('filetype').notNullable();
    table.integer('filesize').notNullable();
    table.timestamp('uploaded_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('attachments');
};