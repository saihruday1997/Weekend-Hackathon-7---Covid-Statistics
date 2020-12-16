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

        res.send(response);
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

       res.send(response);
   })
});




app.listen(port, () => console.log(`App listening on port ${port}!`))

module.exports = app;