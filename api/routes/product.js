const express  = require('express');;
const router  = express.Router();
const Product = require('../models/product');
const mongoose = require('mongoose');
const multer  = require('multer');
const checkAuth = require('../middleware/check-auth');
const storage  = multer.diskStorage(
    {
        destination : function(req, file , cb){
            cb(null, './uploads/')
        },
        filename : function(req , file , cb){
            cb(null, file.originalname)
        }
    }
);


const fileFilter = function(req, file , cb){
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png')
    {
        cb(null,true);
    }
    else{
        cb(null,false);
    }
}

const upload = multer({
    storage : storage,
    limits : {
        fileSize : 1024*1024*5,
    },
    fileFilter : fileFilter
});


router.get('/',(req,res,next)=>
{
    Product.find()
    .exec()
    .then(doc => 
        {
            const response = {
                count : doc.length,
                products : doc.map(item => {
                    return {
                        _id: item._id,
                        name: item.name,
                        price: item.price,
                        productImage  : item.productImage,
                        request :{
                            type : "GET",
                            url : 'http://localhost:3000/products/'+ item._id
                        }
                    }
                })
            }
            res.status(200).json(response);
        })
    .catch(err => {
        res.status(500).json(
            {
                error : err
            }
        )
    })
})

router.post('/',checkAuth ,upload.single('productImage'),(req,res,next)=>
{
    console.log(req.file);
    const product = new Product({
        _id : new mongoose.Types.ObjectId(),
        name: req.body.name,
        price : req.body.price,
        productImage : req.file.path
    })

    product.save().then(result => 
        {
            res.status(200).json({
                message : 'Product object created successfully',
                product : {
                    name : result.name,
                    price : result.price,
                    _id : result._id,
                    request : {
                        type : "GET",
                        url : "http://localhost:3000/products/"+ result._id
                    }
                }
            })
          
        }).catch(err => {
            res.status(500).json({
                error : err
            })
        });
})

router.get('/:id' , (req,res,next)=>
{
    const productId  = req.params.id;
    console.log(productId);
    Product.findById(productId).exec()
    .then(result =>
        {
            if(result)
            {
                res.status(200).json(
                    {
                        name: result.name,
                        price : result.price,
                        _id: result._id,
                        request : {
                            type:'GET',
                            url:'http://localhost:3000/products/'+result._id
                        }
                    }
                );
            }
            else{
                res.status(404).json({
                    message : 'No valid entry found for the provided id'
                })
            }
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

router.patch('/:id' , (req,res,next)=>
{
    const updateForm = {};
    for(const props of req.body)
    {
        updateForm[props.key] = props.value;
    }
    const productId = req.params.id;

    Product.update({
        _id : productId},
        { $set : updateForm}
    ).exec()
    .then(result => 
        {
            res.status(200).json({
                id : result._id,
                name : result.name,
                price : result.price,
                request : {
                    type : "GET",
                    url : 'http://localhost:3000/products/'+ result._id
                }
            });
        })
    .catch(err =>
       {
           res.status(500).json({
               error : err
           })
       });
})

router.delete('/:id' , (req,res,next)=>
{
    const productId = req.params.id;
    Product.remove({
        _id : productId
    }).exec()
    .then(result =>
        {
            res.status(200).json({
                message : 'product deleted sucessfully'
            });
        })
    .catch(err => 
        {
            res.status(500).json({
                error: err
            })
        })
})


module.exports  = router;

