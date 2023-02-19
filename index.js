const express = require('express');
const cors = require('cors');

const { register, login } = require('./controllers/auth.controller');
const actorController = require('./controllers/actor.controller');
const movieController = require('./controllers/movie.controller');
const producerController = require('./controllers/producer.controller');

const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:8081'
}));

app.post("/register", register);
app.post("/login", login);

app.use('/actor', actorController);
app.use('/producer', producerController);
app.use('/movie', movieController);

app.use('/', (req, res) => {
    res.send("Hello World")
})

module.exports = app;