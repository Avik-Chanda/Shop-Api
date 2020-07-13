const express = require('express');
const app = express();
const productsRoute = require('./api/routes/product')
const orderRoutes = require('./api/routes/order');
const userRoutes= require('./api/routes/user')
const morgan = require('morgan');
const bodyParser  = require('body-parser');
const mongoose  = require('mongoose');

mongoose.connect('mongodb+srv://newuser:newuser@pssocial-vjvbx.mongodb.net/PSSOCIAL?retryWrites=true&w=majority'
,  { useNewUrlParser: true,useUnifiedTopology: true })



// app.use(bodyParser({extended : false}));
app.use(express.static('uploads'))
app.use(bodyParser.json());

app.use((req,res,next)=> {
    res.header('Access-Control-Allow-Origin' , '*');
    res.header('Access-Control-Allow-Headers' , 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if(req.method === 'OPTIONS')
    {
        res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,PUT');
        return res.status(200).json({});
    }
    next();
})

app.use('/products',productsRoute);
app.use('/orders', orderRoutes);
app.use('/users',userRoutes);



//loggin what we are doing
app.use(morgan('dev'));

//error handling
app.use((req,res,next) =>
{
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error,req,res,next) =>
{
    res.status(error.status || 500);
    res.json(
        {
            error : {
                message : error.message
            }
        }
    )
})


module.exports = app;
