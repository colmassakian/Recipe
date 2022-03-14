var bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const db = new Database('./database/recipes.db', { verbose: console.log });
const dbUtil = require('./db');
const multer = require('multer');
// TODO: Use multer code from other folder
// const upload = multer({dest: __dirname + '/static/images'});

module.exports = function(app){
  
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, './static/images')
        },
        filename: function (req, file, cb) {
          cb(null, file.originalname)
        }
    })
    var upload = multer({ storage: storage })

    app.post('/add/:id?', upload.single('image'), function (req, res) {
        var id = req.params.id;
        // No id indicates a new entry or a template, id indicates an edit
        if(!id) {
            insertRecipe(req.body, req.file.path);
        }
        else {
            if(req.file)
                updateRecipe(req.body, id, req.file.path);
            else
                updateRecipe(req.body, id, false);
        }
        // TODO: Save user preference for number of items to view
        res.render('home', { title: 'Test', message: 'Home', data: dbUtil.getNRecipes()})
    })

    // Insert data into recipes and create mapping for tags
    function insertRecipe(data, path) {
        // Date format: 2022-03-07
        // Path.substring to remove \static from the path, important to leave the leading \, image won't show on recipe route otherwise
        let position = db.prepare('SELECT COUNT(*) FROM recipes').get()['COUNT(*)'] + 1;
        // const insertRecipe = db.prepare('INSERT INTO recipes(name, image, ingredients, steps) VALUES(?, ?, ?, ?)').run(data.title, path.substring(7), data.ingredients, data.steps);
        const insertRecipe = db.prepare('INSERT INTO recipes(position, name, description, image, ingredients, steps, notes, rating, ttc, date) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(position, data.title, data.description, path.substring(6), data.ingredients, data.steps, data.notes, data.rating, data.ttc, data.date);
        let recipeID = insertRecipe.lastInsertRowid;
        var tagID;
        
        let tags = data.tags.split(',');
        for(let i = 0; i < tags.length; i ++) {
            let tag = tags[i].trim();
            // Map to existing tag if one exists
            let tagSearch = db.prepare('SELECT id FROM tags WHERE name=?').get(tag);
            if(tagSearch == undefined) {
                const insertTag = db.prepare('INSERT INTO tags(name) VALUES(?)').run(tag);
                tagID = insertTag.lastInsertRowid;
            }
            else {
                tagID = tagSearch.id
            }
            const insertTagMap = db.prepare('INSERT INTO TagMap(recipeid, tagid) VALUES(?, ?)').run(recipeID, tagID);
        }
    }

    // TODO: Update with new values
    // TODO: Update new image will require reupload, might happen automatically
    // TODO: Maybe leave image the same unless a new one is uploaded, won't have to find the old picture again
    function updateRecipe(data, id, path) {
        if(path) {
            const updateRecipe = db.prepare('UPDATE recipes SET name=?, description=?, image=?, ingredients=?, steps=?, notes=?, rating=?, ttc=?, date=? WHERE id=?').run(data.title, data.description, path.substring(6), data.ingredients, data.steps, data.notes, data.rating, data.ttc, data.date, id);
        }
        else {
            const updateRecipe = db.prepare('UPDATE recipes SET name=?, description=?, ingredients=?, steps=?, notes=?, rating=?, ttc=?, date=? WHERE id=?').run(data.title, data.description, data.ingredients, data.steps, data.notes, data.rating, data.ttc, data.date, id);
        }
        let recipeID = updateRecipe.lastInsertRowid;
        let tagmapids = [];

        let tags = data.tags.split(',');
        for(let i = 0; i < tags.length; i ++) {
            let tag = tags[i].trim();

            let tagSearch = db.prepare('SELECT id FROM tags WHERE name=?').get(tag);
            if(tagSearch == undefined) {
                const insertTag = db.prepare('INSERT INTO tags(name) VALUES(?)').run(tag);
                tagID = insertTag.lastInsertRowid;
            }
            else {
                tagID = tagSearch.id
            }

            // Create new mapping in the event of a new tag or an edited tag, save all the tags in the current edit
            let tagmapSearch = db.prepare('SELECT id FROM TagMap WHERE recipeid=? AND tagid=?').get(id, tagID);
            if(tagmapSearch == undefined) {
                let insertTagMap = db.prepare('INSERT INTO TagMap(recipeid, tagid) VALUES(?, ?)').run(id, tagID);
                tagmapids.push(insertTagMap.lastInsertRowid);
            }
            else {
                tagmapids.push(tagmapSearch.id);
            }
        }
        
        // Delete all tag mappings that are not part of the saved set
        let tagmapSearch = db.prepare('SELECT id FROM TagMap WHERE recipeid=?').all(id);
        for(var i = 0; i < tagmapSearch.length; i ++) {
            let currID = tagmapSearch[i].id;
            if(!tagmapids.includes(currID)) {
                db.prepare('DELETE FROM TagMap WHERE id=?').run(currID);
            }
        }
    }
}