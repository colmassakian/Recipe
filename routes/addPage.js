const db = require('./db');

module.exports = function(app){
    app.get('/addPage/:copy?/:id?', (req, res) => {
        var id = req.params.id;
        var copy = req.params.copy;
        // No id for a brand new entry
        if(!id) {
            res.render('add', {title: 'Test', message: 'Add', data: false, tags: false, copy: false})
        }
        else {
            if(copy === "true") { // Using a template from a past recipe to add a new one
                res.render('add', {title: 'Test', message: 'Add', data: db.getRecipe(id), tags: db.getTags(id), copy: true})
            }
            else { // Editing a past recipe
                res.render('add', {title: 'Test', message: 'Add', data: db.getRecipe(id), tags: db.getTags(id), copy: false})
            }
        }
    })
}