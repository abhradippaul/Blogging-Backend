require("dotenv").config()
const app = require("./app.js")
const port = process.env.PORT
require("./db/dbConnect.js")

app.get("/",(req,res) => {
    return res.status(statusList.statusOK.value).json({
        message : statusList.statusOK.name
    })
})

app.listen(port,() => {
    console.log("Server Connected",port)
})