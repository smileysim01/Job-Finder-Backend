const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const jsonwebtoken = require("jsonwebtoken")
const dotenv = require("dotenv")
const User = require("../schema/user.schema")
const validator = require("../middlewares/validate")

dotenv.config()

// router.use(validator);

// register a user
router.post(("/register"), async (req,res) => {
    const {name, email, mobile, password} = req.body
    // const result = await checkSchema({
    //     email: {isEmail: true, errorMessage: "Please enter a valid email"},
    //     password: {isLength: {options: {min: 8}}, errorMessage: "Password must be at least 8 characters long."}
    // }).run(req);
    // if(!result.isEmpty()){
    //     console.log("Failed validation")
    //     return res.status(400).json({message: result.map((err) => err.context.message).join(". ")});
    // }
    // const emailResult = await check("email").isEmail().run(req.body)
    // const passwordResult = await check("password").isLength({min: 8}).run(req.body)
    console.log(name, email, password);
    const ifUserExists = await User.findOne({email}) || await User.findOne({mobile})
    if(ifUserExists) {
        return res.status(400).json({message: "User already exists."})
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = new User({name, email, mobile, password: hashedPassword})
    await user.save()
    res.status(201).json({message: "User created successfully."})
})

// get all users
router.get("/", async (req,res) => {
    const users = await User.find().select("-password -_id -__v")
    res.status(200).json(users)
})

// get user by email
router.get("/:email", async(req,res) => {
    const email = req.params
    const user = await User.find(email).select("-password -_id -__v")
    if(!user) {
        return res.status(404).json({message: "User does not exist."})
    }
    return res.status(200).json(user)
})

// login a user
router.post("/login", async (req,res) => {
    const {email, password} = req.body
    const user = await User.findOne({email})
    if(!user) {
        return res.status(400).json({message: "Incorrect email or password."})
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if(!isPasswordMatch) {
        return res.status(400).json({message: "Incorrect email or password."})
    }
    const payload = {id: user._id}
    const token = jsonwebtoken.sign(payload,process.env.JWT_SECRET)
    res.status(200).json({token})
})

module.exports = router