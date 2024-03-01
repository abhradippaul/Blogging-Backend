const express = require("express")
const app = express()
const cors = require("cors")
const statusList = require("./BackendStatus")
const cookieParser = require("cookie-parser")
const blogRouter = require("./routes/Blog.routes")

app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(cors())
app.use(cookieParser())
app.use("/blog",blogRouter)
app.get("/",(req,res) => {
    return res.status(statusList.statusOK.value).json({
        message : statusList.statusOK.name
    })
})

module.exports = app
