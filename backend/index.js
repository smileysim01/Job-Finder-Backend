const express = require("express")
const dotenv = require("dotenv")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const incomingRequestLogger = require("./middlewares/index")
const indexRouter = require("./routes/index")
const userRouter = require("./routes/user")

dotenv.config()

const app = express()
const PORT = process.env.PORT

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(incomingRequestLogger)
app.use("/recruity/api/v1", indexRouter)
app.use("/recruity/api/v1/user", userRouter)

app.listen(PORT, (err) => {
    console.log(`Server is running on ${PORT}`)
    mongoose.connect(process.env.MONGO_URI).then(() => {
        console.log(`Connected to MongoDB Server.`)
    }).catch((error) => {
        console.log("MongoDB connection error", error)
    })
})