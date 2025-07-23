require("dotenv").config('.env');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const router = require('../src/routes/routes');

const app = express();
const corsOption = {
    origin: 'http://localhost:5173', // https://template-ecommerce-website.vercel.app/
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
}

app.use(cors(corsOption));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/ecommerce', router);

app.listen(process.env.PORT , () => {
    console.log(`Servidor rodando na url http://localhost:${process.env.PORT}`);
})
