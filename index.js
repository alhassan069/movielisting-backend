const express = require('express');
const cors = require('cors');
const path = require('path');

const { register, login } = require('./controllers/auth.controller');
const actorController = require('./controllers/actor.controller');
const movieController = require('./controllers/movie.controller');
const producerController = require('./controllers/producer.controller');

const app = express();
app.use(express.json());
app.use(cors({
    origin: '*'
}));

// the next two lines are only important if you are serving 
// the static frontend from the express app

app.use(express.static(path.join(__dirname, "frontend", 'build')));
app.get("", async (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", 'build', 'index.html'));
})


app.post("/api/register", register);
app.post("/api/login", login);

app.use('/api/actor', actorController);
app.use('/api/producer', producerController);
app.use('/api/movie', movieController);


module.exports = app;