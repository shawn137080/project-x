const passport = require('passport');
const axios = require('axios');
const moment = require('moment');
const apiNews = require('./config/key').news;

module.exports = (express, knex) => {
    const router = express.Router();

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/');
    }

    router.get('/signed', (req, res) => {
        res.send('signed in !');
    });

    router.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/dashboard',
        failureRedirect: '/error'
    }));

    router.get('/', (req, res) => {
        res.sendFile(__dirname + '/index.html');
    });
    router.get('/hiit', (req, res) => {
        res.sendFile(__dirname + '/hiit.html');
    });

    router.get('/testing', (req, res) => {
        res.sendFile(__dirname + '/testing.html');
    });

    router.post('/login', passport.authenticate('local-login', {
        successRedirect: '/dashboard',
        failureRedirect: '/error',
    }));
    router.get('/error', (req, res) => {
        res.send('failed');
    });

    //log out
    // router.get('/logout', function (req, res) {
    //     console.log('HI');
    //     req.logout();
    //     res.redirect('/');
    // });

    //check food  VVV
    router.post('/api/get-calories', (req, res) => {
        axios({
            url: 'https://trackapi.nutritionix.com/v2/natural/nutrients',
            method: 'post',
            headers: {
                'x-app-key': '0cc29202aed5d97a53a5d8a530346f87',
                'x-app-id': 'a0662efe',
                'Content-Type': 'application/json'
            },
            data: {
                "query": req.body.query
            },
            responseType: 'json'
        }).then((body) => {
            let calories = body.data.foods[0].nf_calories;
            let fat = body.data.foods[0].nf_total_fat;
            let carb = body.data.foods[0].nf_total_carbohydrate;
            let protein = body.data.foods[0].nf_protein;
            res.json([calories, fat, carb, protein]);
            console.log([calories, fat, carb, protein]);

        }).catch((err) => {
            console.log(err)
        })
    });
    //save food VVV
    router.post('/api/save-result', (req, res) => {
        knex('get').insert({
            record: parseFloat(req.body.calories),
            user_idkey: req.user.id
        }).then((data) => { //.then() is for insert the result 
            console.log("good save");
        }).catch((err) => {
            console.log(err);
        })
    });

    router.get('/dashboard', isLoggedIn, (req, res) => {
        res.sendFile(__dirname + '/dashboard.html');
    })

    router.get('/api/getExe', (req, res) => {
        knex.select('id', 'name', 'MET').from('activity')
            .then((data) => {
                res.json(data);
            }).catch((err) => {
                console.log(err)
            })
    })

    router.get('/cal', (req, res) => {
        let user = req.user
        knex.select('weight').from('user_profile').where({
                id: user.id
            })
            .then((data) => {
                res.json(data[0].weight);
            }).catch((err) => {
                console.log(err)
            })
    })

    router.post('/api/save-burnresult', (req, res) => {
        console.log(req.body)
        knex('burn').insert({
            record: parseFloat(req.body.calories),
            user_idkey: req.user.id
        }).then((data) => {
            res.json({
                msg: 'saved calories!'
            });
        }).catch((err) => {
            console.log(err);
            res.status(409).json({
                msg: "cannot save"
            }) //correct syntax
        })
    });

    router.get('/show', (req, res) => {
        res.sendFile(__dirname + '/chart.html');
    });

    router.get('/burn-chart', (req, res) => {
        knex.from('burn').sum('record').innerJoin('user_profile', 'burn.user_idkey', 'user_profile.id').where('burn.user_idkey', req.user.id).whereNot({
                record: 'NaN'
            }).groupBy('date').orderBy('date', 'aesc')
            .then((data) => {
                res.json(data)
            }).catch((err) => {
                console.log(err)
            })
    })

    router.get('/get-chart', (req, res) => {
        knex.from('get').sum('record').innerJoin('user_profile', 'get.user_idkey', 'user_profile.id').where('get.user_idkey', req.user.id).whereNot({
                record: 'NaN'
            }).groupBy('date').orderBy('date', 'aesc')
            .then((data) => {
                res.json(data)
            }).catch((err) => {
                console.log(err)
            })
    })

    router.get('/users-info', (req, res) => {
        knex('user_profile').where('id', req.user.id)
            .then((data) => {
                res.json(data[0]);
            }).catch((err) => {
                console.log(err)
            })
    })


    router.get('/api/news', (req, res) => {
        axios.get('https://newsapi.org/v2/everything?sources=bbc-news,cnn&q=fitness&language=en&apiKey=e9e8d764eb2548fc9ae7a1f0a613c9f5').then((body) => {
            let title = body;
            let description = body
            // console.log(`this is title : ${title}, this is description: ${description}`)
            res.json(body.data.articles)
        }).catch((err) => {
            console.log(err)
        })

    });

    router.post('/api/fav-food', (req, res) => {
        knex('fb_food').insert({
            name: this.props.checkFood,
            quantity: this.props.checkFood,
            carb: this.props.showItemInfo.carb,
            fats: this.props.showItemInfo.fat,
            protein: this.props.showItemInfo.protein,
            calories: this.props.showItemInfo.calories,
            user_id: req.user.id,
        }).then((data) => { //.then() is for insert the result 
            res.json(data);
            console.log("good save");
        }).catch((err) => {
            console.log(err);
        })
    });

    router.post('/api/fav-food', (req, res) => {
        knex('fb_food').insert({
            name: this.props.checkFood,
            quantity: this.props.checkFood,
            carb: this.props.showItemInfo.carb,
            fats: this.props.showItemInfo.fat,
            protein: this.props.showItemInfo.protein,
            calories: this.props.showItemInfo.calories,
            user_id: req.user.id,
        }).then((data) => { //.then() is for insert the result 
            res.json(data);
            console.log("good save");
        }).catch((err) => {
            console.log(err);
        })
    });

    router.post('/api/fav-workout', (req, res) => {
        knex('fb_workout').insert({
            name: this.props.checkFood,
            weight: this.props.checkFood,
            rep: this.props.showItemInfo.carb,
            set: this.props.showItemInfo.fat,
            user_id: req.user.id,
        }).then((data) => { //.then() is for insert the result 
            res.json(data);
            console.log("good save");
        }).catch((err) => {
            console.log(err);
        })
    });


    return router;
};