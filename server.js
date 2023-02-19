require('dotenv').config();
const connect = require('./configs/db')
const app = require('./index')

const port = process.env.PORT; //port number



app.listen(port, async function() {
    await connect().then(() => console.log("Db connected")).catch(err => console.log(err));
    console.log("listening on port:", port)
})