const db = require('./db');

module.exports = function(app){
  
    app.get('/', (req, res) => {
        res.render('home', { title: 'Test', message: 'Home', data: db.getNRecipes()})
    })
}