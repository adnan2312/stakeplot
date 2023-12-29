const UserModel = require('../models/model.js');

const bcrypt = require('bcrypt')
const Jwt = require('jsonwebtoken')
const ENV = require('../config.js')
const otpGenerator = require('otp-generator')

// async function register(req,res){
//     try{
//         const { username,password,email} = req.body;
//         //check existing user
//         const existUsername = new Promise((resolve,reject) => {
//             UserModel.User.findOne({ username }, function(err,user){
//                 if(err) reject (new Error(err))
//                 if(user) reject ({error : "Use Unique username"})

//                 resolve();
//             })
//         });
//         const existEmail = new Promise((resolve,reject) => {
//             UserModel.User.findOne({ email }, function(err,email){
//                 if(err) reject (new Error(err))
//                 if(email) reject ({error : "Email already exist"})

//                 resolve();
//             })
//         })

//         Promise.all([existUsername, existEmail])
//              .then(() => {
//                 if(password){
//                     bcrypt.hash(password,10)
//                        .then( hashedPassword => {

//                           const user = new UserModel.User({
//                             username,
//                             password: hashedPassword,
//                             email
//                           })
//                           //return and save result as response
//                           user.save()
//                               .then(result => res.status(201).send({msg:"user register successfull"}))
//                               .catch(error => res.status(500).send({error}))

//                        }).catch(error => {
//                            return res.status(500).send({
//                               error:"Enable to hashed password"
//                            })
//                        })
//                 }

//              }).catch(error => {
                
//                 return res.status(500).send({ error:error.message || "check again" })
//              })
//     } catch (error) {
//         return res.status(500).send({error:"errorrr"})
//     }
//  }

 
async function register(req, res) {
    try {
        if (!req.body) {
            return res.status(400).json("Post HTTP Data not Provided");
        }

        let { username, password, email } = req.body;

        // Check if username exists
        const existingUsername = await UserModel.User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ error: "Username already exists" });
        }

        // Check if email exists
        const existingEmail = await UserModel.User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ error: "Email already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new UserModel.User({
            username,
            password: hashedPassword,
            email
        });

        // Save the user to the database
        const savedUser = await newUser.save();

        // Respond with the saved user data
        return res.json({msg : 'registered successfully'});
    } catch (error) {
        return res.status(500).json({ error: "An error occurred" });
    }
}

//middleware to verify user
async function verifyUser(req,res,next){
    try{

        const { username } = req.method == "GET" ? req.query : req.body;

        let exist = await UserModel.User.findOne({ username });
        if(!exist) return res.status(404).send({ error : "cant find user"})
        next();

    } catch (error) {
        return res.status(404).send({ error : 'auth error'})
    }
}


async function login(req, res) {
    const { username, password } = req.body;

    try {
        const user = await UserModel.User.findOne({ username });

        if (!user) {
            return res.status(400).send({ error: "User not found" });
        }

        const passwordCheck = await bcrypt.compare(password, user.password);

        if (!passwordCheck) {
            return res.status(400).send({ error: "Incorrect password" });
        }

        // JWT token
        const token = Jwt.sign({
            userId: user._id,
            username: user.username,
        }, ENV.JWT_SECRET, { expiresIn: '24h' });

        return res.status(200).send({
            msg: 'Login successful',
            username: user.username,
            token
        });
    } catch (error) {
        return res.status(500).send({ error: "Internal server error" });
    }
    
}


async function getuser(req,res){

    const { username } = req.params;
    try{

        if(!username) return res.status(400).send({error:"Invalid Username"})

        const user = await UserModel.User.findOne({ username }, {password: 0});

        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }


        return res.status(200).send(user);

    } catch (error){
        console.log(error)
        return res.status(500).send({error:"cannot find user data"})
    }
}

//middleware for auth user update
async function Auth(req,res, next){
    try{

        const token = req.headers.authorization.split(" ")[1]
        //retrive the user details of logged in user
        const decodedToken = await Jwt.verify(token, ENV.JWT_SECRET)

        req.user = decodedToken
        next()
    } catch (error) {
        res.status(401).json({error : "Auth Failed"})
    }
}

async function updateuser(req, res) {
    try {
        const { userId } = req.user;

        if (userId) {
            const body = req.body;

            // Check if the user exists
            const existingUser = await UserModel.User.findById(userId);

            if (!existingUser) {
                return res.status(404).send({ error: "User not found" });
            }

            // Update user details
            await UserModel.User.updateOne({ _id: userId }, { $set: body });

            return res.status(201).send({ msg: "Record updated..!" });
        } else {
            return res.status(401).send({ error: "User ID not provided" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: "Internal server error" });
    }
}
//middleware for local variable
async function localvariable (req,res,next){
    req.app.locals = {
        OTP : null,
        resetSession : false 
    }
    next()
}

async function generateotp(req,res){
   req.app.locals.OTP = await otpGenerator.generate(6, { lowerCaseAlphabets : false, upperCaseAlphabets : false, specialChars:false})
   res.status(201).send({ code: req.app.locals.OTP})
}

async function verifyotp(req,res){
    const { code } = req.query;
    if(parseInt(req.app.locals.OTP) == parseInt(code)){
        req.app.locals.OTP = null
        req.app.locals.resetSession = true; //start session for reset password
        return res.status(201).send({msg : "verfied successfully"})
    }
    return res.status(400).send({ error: "Invalid OTP"})
}

async function createresetsession(req,res){
    if(req.app.locals.resetSession){
        
        return res.status(201).send({ flag : req.app.locals.resetSession})
    }
    return res.status(440).send({error : "session expired"})
}


async function resetpassword(req, res) {
    try {
        if(!req.app.locals.resetSession) return res.status(440).send({error:"session expired"})
        
        const { username, password } = req.body;

        try {
            const user = await UserModel.User.findOne({ username });

            if (!user) {
                return res.status(404).send({ error: "Username not found" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            await UserModel.User.updateOne(
                { username: user.username },
                { password: hashedPassword }
            );
            req.app.locals.resetSession = false;
            return res.status(201).send({ msg: "Record updated..!" });
        } catch (e) {
            return res.status(500).send({ error: "Unable to hash password" });
        }
    } catch (error) {
        return res.status(401).send({ error });
    }
}


module.exports = { 
    register,
    login,
    getuser,
    updateuser,
    generateotp,
    verifyotp,
    createresetsession,
    resetpassword,
    verifyUser,
    Auth,
    localvariable
}