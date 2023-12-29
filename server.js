const express = require('express');
const app = express();
const cors = require('cors');
// import { delete_OldData } from './controller/controller.js';

require('dotenv').config({ path:'./config.env'})
const port = process.env.PORT || 8080;

//middlewares

app.use(cors());
app.use(express.json());  

//mongodb connection
const con = require('./db/connection.js');

//using routes 
// delete_OldData.start()
app.use(require('./routes/route'));

con.then(db => {
    if(!db) return process.exit(1);
    app.listen(port,() => {
        console.log(`server running ${port}`)
    })
    app.on('error', err => console.log(`Failed to connect`))
    //error in mongodb conn
}).catch(error => {
    console.log(`Connection Failed..! ${error}`)
})

