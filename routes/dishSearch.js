var bodyParser = require('body-parser');
const dbUtil = require('./db');

module.exports = function(app){
  
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    app.post('/dishSearch', (req, res) => {
        res.send(dbUtil.getDish(req.body.name));
    })
}