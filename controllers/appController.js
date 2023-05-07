import UserModel from '../model/User.model.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import otpGenerator from 'otp-generator'

export async function verifyUser(req, res, next){
    try {
        const { username } = req.method == "GET"? req.query: req.body

        let exist = await UserModel.findOne({ username})
        if(!exist)
            return res.status(404).send({ error: " Cannot find uesr"})
        next()

    } catch (error) {
        return res.status(404).send({ error: "Authentication Error"});
    }
}

export async function register(req, res) {
    try {
        const { username, password, profile, email } = req.body
        const existingUser = await UserModel.findOne({ username })
        if (existingUser)
            return res.status(200).send({ message: "user already exists" })

        const existingEmail = await UserModel.findOne({ email });
        if (existingEmail) {
            return res.status(500).send({ message: "email already exists" })
        }

        const newPassword = await bcrypt.hash(password, 10)

        const newUser = {
            username,
            password: newPassword,
            profile: profile || '',
            email
        }
        const user = new UserModel(newUser)
        await user.save()
        res.status(201).send({ message: "registerd successfully", user })



    } catch (error) {
        return res.status(500).send({error})
    }
}

export async function login(req, res){
    const { username, password} = req.body
    try {
        const user = await UserModel.findOne({ username})
        if(!user)
            return res.status(400).send({error: 'Username does not exist'})

        const passwordMatch = await bcrypt.compare(password, user.password)
        if(!passwordMatch)
            return res.status(400).send({error: 'password does not match'})

        const token = jwt.sign({
            userId: user._id,
            username: user.username
        }, 'secret', { expiresIn: '24h'})

        return res.status(200).send({
            msg: "login successfully",
            username: user.username,
            token
        })

    } catch (error) {
        return res.status(400).send({error})   
    }
}


export async function getUser(req, res){
    const { username } = req.params 

    try {
        if(!username)
            return res.status(501).send({ error: "Invalid username"})
        
        const user =await UserModel.findOne({ username})
        if(!user)
            return res.status(501).send({ error: "username does not exist"})

        const { password, ...rest } = user._doc 
         
        return res.status(201).send(rest)

    } catch (error) {
        return res.status(404).send({ error: " error in getuser function "})
    }
}

export async function updateUser(req,res){
    try {
        const { userId } = req.user
        if(userId){
            const body = req.body
            await UserModel.updateOne({ _id: userId}, body)
            return res.status(201).send({message: "record updated...!"})
        } else {
            return res.status(402).send({ msg: "user not found ...!"})
        }
    } catch (error) {
        return res.status(401).send({ error })
    }
}

export async function generateOTP(req, res){
    req.app.locals.OTP = await otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false })
    res.status(201).send({ code: req.app.locals.OTP})
}

export async function verifyOTP(req, res){
    const { code } = req.query
    if(parseInt(req.app.locals.OTP) === parseInt(code)){
        req.app.locals.OTP = null
        req.app.locals.resetSession = true 
        return res.status(201).send({ msg: 'Verified successfully'})
    }
    return res.status(400).send({ error: "Invalid OTP"})
}

export async function createResetSession(req, res){
    if(req.app.locals.resetSession){
        return res.status(201).send({ flag: req.app.locals.resetSession})
    }
    return res.status(440).send({ error: "Session expired"})
}

export async function resetPassword(req, res){
    try {
        if(!req.app.locals.resetSession)  return res.status(440).send({ error: "Session expired"})

        const { username, password} = req.body
        const user =await UserModel.findOne({ username})
        if(!user) return res.status(404).send({msg: "User not found"})
        const hashedPassword = await bcrypt.hash(password, 10)
        await UserModel.updateOne({ username: user.username}, { password: hashedPassword})
        return res.status(201).send({ msg: "record updated"})
    } catch (error) {
        return res.status(500).send({ error: "enble to set reset password"})
    }
}