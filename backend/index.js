const express = require("express")
const dotenv = require("dotenv")
const mongoose = require("mongoose")
const incomingRequestLogger = require("./middlewares/index")
const indexRouter = require("./routes/index")

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8000

app.use(incomingRequestLogger)
app.use("/recruity/api/vi", indexRouter)

app.listen(PORT, (err) => {
    console.log(`Server is running on ${PORT}`)
    mongoose.connect(process.env.MONGO_URI).then(() => {
        console.log(`Connected to MongoDB Server.`)
    }).catch((error) => {
        console.log("MongoDB connection error", error)
    })
})