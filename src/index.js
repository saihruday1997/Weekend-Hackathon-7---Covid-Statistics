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
    }]).then((result) => {
        let response = {
            _id: "total",
            recovered: result[0].total.$sum
        }

        res.send(response);
    }).catch(err => res.send(err));
});




app.listen(port, () => console.log(`App listening on port ${port}!`))

module.exports = app;