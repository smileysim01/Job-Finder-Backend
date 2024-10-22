const express = require("express")
const router = express.Router()
const {z} = require("zod")
const {validateRequest} = require("zod-express-middleware")
const Job = require("../schema/job.schema")
const authMiddleware = require("../middlewares/auth")
const isAuth = require("../utils/index")

router.post("/create", authMiddleware, async (req, res) => {
    try {
        const {name, logo, position, salary, jobType, remote, location, description, about, skills, information} = req.body
        const {user} = req;
        const jobs = skills.split(",").map((skill) => skill.trim())
        const job = new Job({name, logo, position, salary, jobType, remote, location, description, about, skills: jobs, information, creator: user})
        await job.save()
        res.status(200).json({message: "Job created successfully"})
    } catch(error) {
        res.status(400).json({message: "Job not created", error})
    }
})

router.get("/", async (req,res) => {
    const isAuthenticated = isAuth(req);
    const jobs = isAuthenticated ? await Job.find() : await Job.find().select("-_id -creator -__v -about -information");
    res.status(200).json(jobs);
})

router.get("/:id", validateRequest({
        params: z.object({
            id: z.string().uuid(),
        }),
    }), authMiddleware, async (req,res) => {
        const {id} = req.params;
        const job = await Job.findById(id);
        if(!job) {
            return res.status(404).json({message: "Job not found."})
        }
        res.status(200).json(job)
})

// router.get("/:id", authMiddleware, async (req,res) => {
//     const {id} = req.params;
//     const job = await Job.findById(id);
//     if(!job) {
//         return res.status(404).json({message: "Job not found."})
//     }
//     res.status(200).json(job)
// })

router.get("/search/:title", authMiddleware, async (req,res) => {
    const {title} = req.params;
    const jobs = await Job.find({name: new RegExp(title, "i")}).select("-_id -creator -__v -about -information");
    res.status(200).json(jobs);
})

router.put("/:id", authMiddleware, async (req,res) => {
    try {
        const {id} = req.params;
        const {name, logo, position, salary, jobType, remote, location, description, about, skills, information} = req.body
        const skillsArray = skills ? skills.split(",").map((skill) => skill.trim()) : []
        let job = await Job.findById(id);
        if(!job) {
            return res.status(404).json({message: "Job not found."})
        }
        if(job.creator.toString() !== req.user.toString()) {
            return res.status(401).json({message: "You are not authorized to update this job."})
        }
        job = await Job.findByIdAndUpdate(id, {name, logo, position, salary, jobType, remote, location, description, about, skills: skillsArray, information}, {new: true})
        res.status(200).json(job)
    }
    catch(error) {
        res.status(400).json({message: "Job not updated", error})
    }
})

router.delete("/:id", async (req,res) => {
    const {id} = req.params;
    const job = await Job.findById(id);
    if(!job) {
        return res.status(404).json({message: "Job not found."})
    }
    if(job.creator.toString() !== req.user.toString()) {
        return res.status(401).json({message: "You are not authorized to delete this job."})
    }
    await Job.findByIdAndDelete(id)
    res.status(200).json({message: "Job deleted successfully."})
})

module.exports = router;