const mongoose = require('mongoose')

const Schema = mongoose.Schema;

//monthmode
const monthmode_model = new Schema({
    userid:{type:String},
    allowance:{type : Number},
    mode:{type:String}
})
const target_model = new Schema({
    userid:{type:String},
    target:{type:String},
    targetamount:{type:Number}
})
//category
const categories_modal = new Schema({
    type:{type : String, default:"Investment"},
    color: {type : String,default: '#FCBE44'},
    username: { type: String},
    typeinfo:{type: Array}
})
//transactions
const transaction_model = new Schema({
    name: { type : String, default:"Anonymous"},
    type: { type : String, default:"Investment"},
    amount:{ type:Number},
    username: { type: String},
    date: { type:Date,default:Date.now}
})
//wallet
const wallet_model = new Schema({
    username : {type : String},
    name:{ type: String, default:"Adam"},
    amount:{ type:Number},
    cleared:{type:Number},
    interest:{type:Number},
    duration:{type:Number},
    date: { type:Date,default:Date.now}
})

const bill_model = new Schema({
    billname : {type:String},
    billamount : {type:Number},
    billdate : {type:String},
    monthly:{type:Boolean},
    username: { type: String},
})

const quiz_model = new Schema({
    questionText : {type:String},
    answerOptions : [
        {answerText: String, isCorrect: Boolean}
    ]
})

const user_model = new Schema({
    username:{
        type:String,
        required : [true,"need unique username"],
        unique:[true,"Username Exist"]
    },
    password:{
        type:String,
        required : [true, "Provide Strong Password"],
        unique:false,
    },
    email:{
        type:String,
        required: [true, "email already registered"],
        unique:true,
    },
    firstname:{type:String},
    lastname:{type:String}
})

const MonthMode = mongoose.model(`monthmode`,monthmode_model)
const TargetMode = mongoose.model(`targetmode`,target_model)
const Categories = mongoose.model(`categories`,categories_modal)
const Transaction = mongoose.model(`transaction`,transaction_model)
const WalletAdd = mongoose.model(`wallet`,wallet_model)
const Bill = mongoose.model(`bill`,bill_model)
const User = mongoose.model(`user`,user_model)
const Quiz = mongoose.model(`quiz`,quiz_model)

exports.default = Transaction;
module.exports = {
    MonthMode,
    TargetMode,
    Categories,
    Transaction,
    WalletAdd,
    Bill,
    Quiz,
    User
}