require("dotenv").config()
const app = require("./app.js")
const port = process.env.PORT
require("./db/dbConnect.js")

app.get("/",(req,res) => {
    return res.status(200)
    .json({
        message : "Welcome to my blogging application"
    })
})

app.listen(port,() => {
    console.log("Server Connected",port)
})