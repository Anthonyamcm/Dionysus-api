const { validationResult } = require('express-validator')
const config = require('config.json');
const bcrypt = require('bcryptjs')
const db = require('_helpers/db');
const jwt = require('jsonwebtoken')

const User = db.User;

exports.signup = (req, res, next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        const error = new Error('Validation failed')
        error.statusCode = 422
        error.data = errors.array()
        throw error
    }

    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const email = req.body.email;
    const password = req.body.password
    bcrypt
        .hash(password, 12)
        .then(hashedPw => {
            const user = new User({
                first_name: first_name,
                last_name: last_name,
                email: email,
                password: hashedPw
            })
            return user.save()
        })
        .then(result => {
            res.status(200).json({message: 'User created succesfully!', result: {userId: result._id, first_name: result.first_name, last_name: result.last_name, email: result.email}})
        })
        .catch(err => {
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err)
        })
}

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password
    let loadedUser
    User.findOne({email: email})
        .then(user => {
            if(!user){
                const error = new Error('Wrong email or password')
                error.statusCode = 401
                throw error
            }
            loadedUser = user
            return bcrypt.compare(password, user.password)
        })
        .then(match => {
            if(!match){
                const error = new Error('Wrong email or password')
                error.statusCode = 401
                throw error
            }
            const token = jwt.sign({
                first_name: loadedUser.first_name,
                last_name: loadedUser.last_name,
                email: loadedUser.email,
                userId: loadedUser._id
            }, config.secret, {expiresIn: '1d'})
            res.status(200).json({message: 'Login success!', result: {userId: loadedUser._id, first_name: loadedUser.first_name, last_name: loadedUser.last_name, email: loadedUser.email, token: token, }})
        })
        .catch(err => {
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err)
        })

}

