
const express = require('express');
const bodyParser= require('body-parser');
const mongoose = require('mongoose');
const keys = require('./config/keys');
require('./models/Users');




mongoose.connect(keys.mongoURI, { useNewUrlParser: true })
.then(() => {
    console.log('MongoDB is connected');
})
.catch((err) => {
    console.log('erro occured in connection to mongo');
    console.log(err);
});
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(require('./routes'));
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    
    res.send('Hello Shlomi');
} );

app.listen(PORT, () => {
    console.log(`Server listennig on http://localhost:${PORT}`)
});