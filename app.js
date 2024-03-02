const express = require("express")
const app = express()
const cors = require("cors")
const cookieParser = require("cookie-parser")
const blogRouter = require("./routes/Blog.routes.js")
const userRouter = require("./routes/User.routes.js")

app.use(express.urlencoded({ extended : true}))
app.use(express.json())
app.use(cors())
app.use(cookieParser())
app.use("/blog",blogRouter)
app.use("/user",userRouter)


module.exports = app
