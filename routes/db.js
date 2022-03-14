const Database = require('better-sqlite3');
const db = new Database('./database/recipes.db', { verbose: console.log });

function getRecipe(id) {
    return db.prepare('SELECT * FROM recipes WHERE id=?').get(id);
}

function getTags(id) {
    // select tags.name from recipes inner join TagMap on recipes.id=recipeid inner join tags on tags.id=tagid where recipes.id=16;
    stmt =  db.prepare('SELECT tags.name FROM recipes INNER JOIN TagMap ON recipes.id=recipeid INNER JOIN tags ON tags.id=tagid WHERE recipes.id=?').all(id);
    console.log(stmt);
    return stmt;
}

function getNRecipes(n = 4) {
    return db.prepare('SELECT * FROM recipes ORDER BY id DESC LIMIT ?').all(n);
}

function getDish(search) {
    return db.prepare('SELECT * FROM recipes WHERE name like ?').all(search + '%');
}

// Test no result from select if == undefined, test select id
module.exports = {getRecipe, getTags, getNRecipes, getDish};