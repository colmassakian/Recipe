const db = require('./db');

module.exports = function(app){
    app.get('/recipe/:id', (req, res) => {
        var id = req.params.id;
        res.render('recipe', { title: 'Test', message: 'Home', data: db.getRecipe(id), tags: db.getTags(id)})
    })
}