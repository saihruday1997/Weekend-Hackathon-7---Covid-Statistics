const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const port = 8080

// Parse JSON bodies (as sent by API clients)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }))
const { connection } = require('./connector')

app.get("/totalRecovered", (req, res) => {
    connection.aggregate([{
        $group: {
            _id: null,
            total: {
                $sum: "$recovered"
            }
        }
    }]).then((result, err) => {
        let response = {
            data: {
                _id: "total",
                recovered: result[0].total
            }
        };

        if(!err) {
            res.send(response);
        }
    });
});

app.get("/totalActive" , (req, res) => {
   connection.aggregate([{
       $group: {
           _id: null,
           total: {
               $sum :{
                   $subtract: ["$infected", "$recovered"]
               }
           }
       }
   }]).then((result, err) => {
       let response = {
           data: {
               _id: "total",
               active: result[0].total
           }
       }

       if(!err) {
           res.send(response);
       }
   })
});

app.get("/totalDeath", (req, res) => {
    connection.aggregate([{
        $group: {
            _id: null,
            total: {
                $sum: "$death"
            }
        }
    }]).then((result, err) => {
        let response = {
            data: {
                _id: "total",
                death: result[0].total
            }
        }

        if(!err) {
            res.send(response);
        }
    })
});

app.get("/hotspotStates", ((req, res) => {
    connection.aggregate([{
        $project: {
            state: 1,
            rate: {
                $round: [
                    {
                    $divide: [{
                        $subtract: ["$infected", "$recovered"]
                    }, "$infected"]
                },5]
            }
        }
    },{
        $match: {rate: {
            $gt: 0.1
            }}
    }]).then((result, err) => {
        if(!err) {
            res.send({data: result});
        }
    })
}));

app.get("/healthyStates", (req, res) => {
    connection.aggregate([{
        $project: {
            state: 1,
            mortality: {
                $round: [{
                    $divide: ["$death", "$infected"]
                },5]
            }
        }
    }, {
        $match: {mortality: {$lt: 0.005}}
    }]).then((result, err) => {
        if(!err) {
            res.send({data: result});
        }
    })
});

app.listen(port, () => console.log(`App listening on port ${port}!`))

module.exports = app;