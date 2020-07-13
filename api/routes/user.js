const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/user');
const jsonWebToken = require('jsonwebtoken');

router.get('/usersList',(req,res,next)=>
{
    User.find().exec()
    .then(user =>{
        console.log(user)
        res.status(200).json({
            count : user.length,
            users : user.map(item => {
                return {
                    _id : item._id,
                    email : item.email
                }
            })
        })
    })
    .catch(err => {
        res.status(500).json({
            err : error
        })
    })
})

router.post('/signup',(req,res,next)=>
{
    User.find({email:req.body.email})
    .exec()
    .then(result => {
        if(result.length >= 1)
        {
            return res.status(409).json({
                message  : 'User Exists'
            })
        }
        else{
             bcrypt.hash(req.body.password,10,(err , hash)=>
            {
                if(err)
                {
                    return res.status(500).json(
                       {
                        error : err
                       } 
                    )
                }
                else{
                    const user = new User({
                        _id : mongoose.Types.ObjectId(),
                        email : req.body.email,
                        password : hash
                    })

                    user.save()
                    .then(result => 
                        {
                            res.status(201).json({
                                message : 'User created cuccessfully'
                            })
                        })
                    .catch(err=>{
                        res.status(500).json({
                            error : err
                        })
                    })

                }
            })
        }
    })
})

router.post('/login',(req,res,next)=>
{
    User.find({email : req.body.email}).exec()
    .then(users => {
        if(users.length < 1)
        {
            return res.status(401).json(
                {message : 'Auth Failed'}
            )
        }
        bcrypt.compare(req.body.password , users[0].password , (err,result)=>{
            if(err)
            {
                return res.status(401).json(
                    {message : 'Auth Failed'}
                )
            }
            if(result)
            {
                const token = jsonWebToken.sign(
                    {
                        userId : users[0]._id,
                        email : users[0].email
                    },
                    'secret',
                    {
                        expiresIn : "1h"
                    }
                );
                return res.status(200).json(
                    {
                        message : 'Auth Succesful',
                        token : token
                    }
                )
            }
            res.status(401).json(
                {
                    message : "Auth Failed"
                }
            )
        })
    })
    .catch(err=>
        {
            res.status(401).json(
                {
                    message : "Auth Failed"
                }
            )
        })
})

router.delete('/:userId', (req,res,next)=>
{
    User.remove({_id : req.params.userId}).exec()
    .then(result =>
        {
            res.status(200).json(
                {
                    message  : 'User Deleted Succesfully'
                }
            )
        })
    .catch(err =>
        {
            res.status(500).json({
                error: err
            })
        })
})

module.exports = router;