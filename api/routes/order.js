const express  = require('express');
const router  = express.Router();
const mongoose = require('mongoose');
const Order = require('./../models/order');


router.get('/',(req,res,next)=>
{
    Order.find()
    .populate('product','name')
    .exec()
    .then(result => {
        res.status(200).json(
            {
                count : result.length,
                orders : result.map(doc =>
                    {
                        return {
                            _id : doc._id,
                            product : doc.product,
                            quantity : doc.quantity,
                            request : {
                                type : "GET",
                                url : "http://localhost:3000/orders/"+doc._id
                            }
                        }
                })
            }
        )
    })
    .catch(err =>
        res.status(500).json(
            {
                error : err
            }
        )
    )
})

router.post('/',(req,res,next)=>
{
    const order = new Order({
        _id : new mongoose.Types.ObjectId(),
        product : req.body.productId,
        quantity : req.body.quantity
    }) ;

    order.save()
    .then(result => 
        {
            res.status(201).json(
                {
                    message : 'Order object created successfully',
                    productId : result.product,
                    quantity : result.quantity,
                    _id : result._id
                }
            )
        })
    .catch(err => {
        res.status(500).json(
            {
                error : err
            }
        )
    })
})

router.get('/:id' , (req,res,next)=>
{
    const orderId = req.params.id;
    Order.findById(orderId)
    .populate('product')
    .exec()
    .then(
        result =>
        {
            res.status(200).json(
                {
                    _id: result._id,
                    product : result.product,
                    quantity : result.quantity,
                    request : {
                        type : "GET",
                        url : 'https://localhost:3000/orders'
                    }
                }
            )
        }
    ).catch(err =>
        {
            res.status(500).json(
                {
                    error : err
                }
            )
        })
})

router.patch('/:id' , (req,res,next)=>
{
    const orderId = req.params.id;
    const updateOrderForm = {};
    for(const item of req.body)
    {
        updateOrderForm[item.key]=item.value;
    }
    Order.update({_id : orderId }, {$set : updateOrderForm})
    .exec()
    .then(result =>
        {
            res.status(200).json({
                message : 'Product with id ' + orderId + ' updated successfully',
                request : {
                    type:"GET",
                    url : "http://localhost:3000/orders/" + orderId
                }
            })
        })
    .catch(err => 
        {
            res.status(500).json(
                {
                    error : err
                }
            )
        })
})

router.delete('/:id' , (req,res,next)=>
{
    const orderId = req.params.id;
    Order.remove({_id : orderId}).exec()
    .then(result =>
        {
            res.status(200).json(
                {
                    message : 'Order deleted successfully'
                }
            )
        })
        .catch(err =>{
            res.status(500).json({
                error :err
            })
        })
})


module.exports  = router;

