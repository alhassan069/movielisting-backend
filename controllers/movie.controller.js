const express = require("express");
var async = require("async");

const Movie = require("../models/movie.model");
const Actor = require("../models/actor.model");
const Producer = require("../models/producer.model");

const authenticate = require("../middlewares/authenticate");

const router = express.Router();

router.post(
    "/",
    authenticate,
    async (req, res) => {
        // try {
        //     // async.series([])
        //     const movie = await Movie.create(req.body);
        //     console.log("this is the movie", movie)
        //     return res.status(201).json({ movie });
        // } catch (e) {
        //     return res.status(500).json({ status: "failed", message: e.message });
        // }
        let movie;

        async.series([
            function (callback) {
                Movie.create(req.body).then((data) => {
                    movie = data;
                    // console.log("movie after creation", movie)
                    callback(null);
                }).catch(err => {
                    callback(err)
                })
            }, function (callback) {
                async.eachSeries(movie.actors, function (actor, callback) {
                    Actor.findByIdAndUpdate(actor._id, { $push: { movies: movie._id } }).then(data => {
                        // console.log("updated actor", data);
                        callback(null)
                    }).catch(err => {
                        callback(err);
                    })

                }, function (err) {
                    if (err) {
                        callback(err);
                    } else callback(null);
                })
            }, function (callback) {
                Producer.findByIdAndUpdate(movie.producer, { $push: { movies: movie._id } }).then(data => {
                    // console.log("updated producer", data);
                    callback(null)
                }).catch(err => {
                    callback(err);
                })
            }
        ], function (err, results) {
            if (err) {
                res.status(500).json({ status: "failed", message: err.message });
            } else {
                res.status(201).json({ movie });
            }
        })
    }
);

router.get("/", async (req, res) => {

    const movie = await Movie.find().populate(['actors', 'producer']).lean().exec();
    // console.log("get all movie:", movie[0].actors);
    return res.status(201).json(movie);
});

router.get("/:id", async (req, res) => {
    const movie = await Movie.findById(req.params.id).populate(['actors', 'producer']).lean().exec();
    // console.log(req.params.id)
    // console.log(movie)
    return res.send(movie);
});

router.post("/update/:id", async (req, res) => {
    let newMovie = {
        _id: req.body.id,
        name: req.body.name,
        release_year: req.body.release_year,
        plot: req.body.plot,
        poster: req.body.poster,
        actors: req.body.actors,
        producer: req.body.producer
    }
    let prevMovie;
    let updatedMovie;

    let AddArr = [];
    let DeleteArr = [];

    async.series([
        function (callback) {
            Movie
                .findOne({ _id: req.body.id })
                .then((data) => {
                    prevMovie = {
                        name: data.name,
                        release_year: data.release_year,
                        plot: data.plot,
                        poster: data.poster,
                    };
                    prevMovie._id = data._id.toHexString();
                    prevMovie.actors = data.actors.map(el => el.toHexString());
                    prevMovie.producer = data.producer.toHexString();
                    callback(null);
                })
                .catch(err => callback(err));
        },
        function (callback) {
            if (newMovie.actors == prevMovie.actors) {
                callback(null);
            } else {
                let newMovieObj = {};
                let prevMovieObj = {};

                prevMovie.actors.forEach(actor => {
                    if (!!prevMovieObj[actor]) prevMovieObj[actor]++;
                    else prevMovieObj[actor] = 1;
                });

                newMovie.actors.forEach(actor => {
                    if (!prevMovieObj[actor]) AddArr.push(actor);
                    if (!!newMovieObj[actor]) newMovieObj[actor]++;
                    else newMovieObj[actor] = 1;
                });

                prevMovie.actors.forEach(actor => {
                    if (!newMovieObj[actor]) DeleteArr.push(actor);
                });

                // console.log("AddArr,DeleteArr", AddArr, DeleteArr)

                if (AddArr.length !== 0) {
                    async.eachSeries(AddArr, function (actor, callback) {
                        // console.log("add actor and prevmovie", actor, prevMovie._id)
                        Actor.findByIdAndUpdate(actor, { $push: { movies: prevMovie._id } }).then(data => {
                            callback(null)
                        }).catch(err => {
                            callback(err);
                        });
                    }, function (err) {
                        if (err) {
                            callback(err);
                        } else callback(null);
                    })
                } else callback(null);

            }

        },
        function (callback) {
            if (DeleteArr.length !== 0) {
                // console.log("I am inside delete actors", DeleteArr)
                async.eachSeries(DeleteArr, function (actor, callback) {
                    // console.log("delete actor and prevmovie", actor, prevMovie._id)
                    Actor.findByIdAndUpdate(actor, { $pull: { movies: prevMovie._id } }).then(data => {
                        // console.log("deleted actor data", data)
                        callback(null)
                    }).catch(err => {
                        callback(err);
                    });
                }, function (err) {
                    if (err) {
                        callback(err);
                    } else callback(null);
                })
            } else callback(null);
        },
        function (callback) {
            if (prevMovie.producer != newMovie.producer) {

                async.series([
                    function (callback) {
                        Producer.findByIdAndUpdate(newMovie.producer, { $push: { movies: prevMovie._id } }).then(data => {
                            callback(null)
                        }).catch(err => {
                            callback(err);
                        });
                    },
                    function (callback) {
                        Producer.findByIdAndUpdate(prevMovie.producer, { $pull: { movies: prevMovie._id } }).then(data => {
                            callback(null)
                        }).catch(err => {
                            callback(err);
                        });
                    }
                ], function (err, results) {
                    if (err) {
                        callback(err);
                    } else callback(null); F

                });
            }
            else
                callback(null);
        },
        function (callback) {
            Movie.findByIdAndUpdate(newMovie._id, newMovie, { new: true }).populate(['actors', 'producer'])
                .then((data) => {
                    updatedMovie = data;
                    callback(null);
                })
                .catch(err => callback(err));
        },
    ], function (err, results) {
        if (err) {
            // console.log("errorrrrr", err)
            res.status(500).json({ status: "failed", message: err });
        } else {
            res.status(201).json(updatedMovie);
        }
    })
})

module.exports = router;