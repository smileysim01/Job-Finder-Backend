const { checkSchema, check } = require("express-validator")

const validator = async (req,res,next) => {
    const result = await checkSchema({
    email: {
        isEmail: true, 
        errorMessage: "Please enter a valid email"
    },
    password: {
        isLength: {options: {min: 8}}, 
        errorMessage: "Password must be at least 8 characters long."
    }
    }).run(req.body);
    if(!result){
        console.log("Failed validation")
        return res.status(400).json({message: result.map((err) => err.context.message).join(". ")});
    }
    next()
}

module.exports = validator