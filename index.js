require("dotenv").config()

const app = require("./app")
const port = process.env.PORT
require("./db/dbConnect")


app.listen(port,() => {
    console.log("Server Connected",port)
})