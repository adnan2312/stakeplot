

async function Auth(req,res, next){
    try{

        const token = req.headers.authorization
        res.json(token)
    } catch (error) {
        res.status(401).json({error : "Auth Failed"})
    }
}

module.exports = {
    Auth
}