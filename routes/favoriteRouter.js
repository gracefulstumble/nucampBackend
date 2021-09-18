const express = require('express');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Favorite = require('../models/favorite');
const { findOneAndDelete } = require('../models/favorite');

const favoriteRouter = express.Router();


favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({user: req.user._id})
    .populate('user')
    .populate('campsites')
    .then(favorites =>{
        res.statusCode = 200; 
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id })
    .then(favorite => { 
        if (favorite) { 
           req.body.forEach( reqCampsite => { 
               if (!favorite.campsites.includes(reqCampsite._id)) {  
                   favorite.campsites.push(reqCampsite._id)
                   favorite.save()
                   .then(favorite => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite); 
                   })
                   .catch(err => next(err));
               } else { 
                    err = new Error(`All Campsites are already in list of favorites!`); 
                    err.status = 404;
                    return next(err);
               }
           })
        } else {
            new Favorite({user: req.user._id, campsites: req.body})
            .save()
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({user: req.user._id})
    .then(favorite => {
        res.statusCode = 200;
        if (favorite) {
            
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);  
        } else {
            res.setHeader('Content-Type', 'text/plain');
            res.end('You do not have any favorites to delete.');
        }
    })
    .catch(err => next(err));
})


favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`GET operation not supported on /favorites/${req.params.campsiteId}`);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        if (favorite) {
            if (favorite.campsites.includes(req.params.campsiteId)) {
                res.setHeader('Content-Type', 'text/plain');
                res.end(`That campsite (${req.params.campsiteId}) is already in the list of favorites!`);
            } else {
                favorite.campsites.push(req.params.campsiteId)
                favorite.save()
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch(err => next(err));
            }
        } else {
            new Favorite({user: req.user._id, campsites: req.params.campsiteId})
            .save()
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id}) 
    .then(favorite => { 
        if (favorite.campsites.includes(req.params.campsiteId)) {
            favorite.campsites.splice(favorite.campsites.indexOf(req.params.campsites));
            favorite.save()
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
        } else {
            res.setHeader('Content-Type', 'text/plain');
            res.end('There are no favorites to delete.');
        }
    })
    .catch(err => next(err));
})

module.exports = favoriteRouter;