// const config = require('config')
const express = require('express')
const app = express()

// require('./routes/test')(app);
require('./routes/home')(app);
require('./routes/addPage')(app);
require('./routes/add')(app);
require('./routes/recipe')(app);
require('./routes/dishSearch')(app);

app.set('view engine', 'pug')
app.use(express.static(__dirname + '/static'));
// app.use('/uploads', express.static('uploads'));

// app.get('/', (req, res) => {
//     res.render('_layout', { title: 'Hey', message: 'Input' })
// })

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})