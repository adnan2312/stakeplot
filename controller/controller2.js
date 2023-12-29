const model = require('../models/model.js');

//post create wallet
// async function create_wallet(req,res){
//     if(!req.body) return res.status(400).json("Post HTTP Data not Provided")
//     let{name,amount,cleared,interest,duration,username} = req.body;

//     const create = await new model.WalletAdd(
//         {
//             username,
//             name,
//             amount,
//             cleared,
//             interest,
//             duration,
//             date:new Date() 
//         }
//     )

//    return create.save(res.json(create))
// }

//post create wallet
async function create_wallet(req, res) {
  if (!req.body) return res.status(400).json("Post HTTP Data not Provided");

  let { name, amount, payment, interest, duration, username } = req.body;

  // Check if 'payment' is provided
  if (payment !== undefined) {
    try {
      const existingWallet = await model.WalletAdd.findOne({ username, name });
      payment = parseFloat(payment)
      if (!existingWallet) {
        return res.status(404).json("Wallet not found");
      }

      // Incrementally update the 'cleared' field with the provided payment amount
      existingWallet.cleared = (existingWallet.cleared || 0) + payment;
      existingWallet.date = new Date();

      const updatedWallet = await existingWallet.save();
      return res.json(updatedWallet);
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  } else {
    // 'payment' is not provided, create a new wallet
    const create = await new model.WalletAdd({
      username,
      name,
      amount,
      cleared: payment, // Initialize 'cleared' to 0 for a new wallet
      interest,
      duration,
      date: new Date(),
    });

    try {
      const createdWallet = await create.save();
      return res.json(createdWallet);
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  }
}
//delete wallet
async function delete_Wallet(req,res){
    if(!req.body) res.status(400).json({message:"req body does not found"})
    await model.WalletAdd.deleteOne(req.body,res.json("record deleted"))
}
//post create month mode
async function create_monthmode(req,res){
    if(!req.body) return res.status(400).json("HTTP data not provided")
    let{userid,allowance,mode} = req.body;
    const create = await new model.MonthMode(
        {
            userid,
            allowance,
            mode
        }
    )

    return create.save(res.json(create))
}
//get month mode
async function get_monthmode(req,res){
    const userid = req.params.userid;
    let data = await model.MonthMode.find({userid})
    return res.json(data)
}
//update month mode
async function update_monthmode(req, res) {
    if (!req.body) return res.status(400).json("HTTP data not provided");
    const { userid, allowance, mode } = req.body;

    try {
        const existingDocument = await model.MonthMode.findOne({ userid });

        if (existingDocument) {
            existingDocument.allowance = allowance;
            existingDocument.mode = mode;

            const updatedDocument = await existingDocument.save();

            return res.json(updatedDocument);
        } else {
            return res.status(404).json({ error: "Document not found" });
        }
    } catch (error) {
        // Handle errors
        console.error("Error updating document:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

//post create targets
async function create_target(req,res){
    if(!req.body) return res.status(400).json("HTTP data not provided")
    let{userid,target,targetamount} = req.body;
    const create = await new model.TargetMode(
        {
            userid,
            target,
            targetamount
        }
    )

    return create.save(res.json(create))
}
//get target mode
async function get_target(req,res){
    const userid = req.params.userid;
    let data = await model.TargetMode.find({userid})
    return res.json(data)
}
//delete target
async function delete_Target(req,res){
    if(!req.body) res.status(400).json({message:"req body does not found"})
    await model.TargetMode.deleteOne(req.body,res.json("record deleted"))
}
//get wallet
async function get_Wallet(req,res){
    const username = req.params.username;
    let data = await model.WalletAdd.find({username})
    return res.json(data)
}
//get one wallet
async function get_SingleWallet(req,res){
    const id = req.params.id;
    let data = await model.WalletAdd.findById(id);
    return res.json(data)
}
//post paid amount

//get single paid 
async function get_SinglePaid(req,res){
    const name = req.params.name;
    let data = await model.PaidAmount.findOne();
    return res.json(data)
}
//get paid info 
async function get_PaidInfo(req,res){
    model.WalletAdd.aggregate([
        {
            $lookup:{
                from:'PaidAmount',
                localField:'name',
                foreignField:'name',
                as:'debt_info'
            }

        },
        {
            $unwind:'$debt_info'
        }
    ]).then(result=>{
        let data = result.map(v => Object.assign({},{_id:v.id,name:v.name,interest:v.interest,duration:v.duration,paid:v.debt_info['paid']}))
        res.json(data)
    }).catch(error => {
        res.status(400).json("lookup collection")
      })
}
//create bills
async function create_Bill(req,res){
    if(!req.body) return res.status(400).json("Post HTTP not Found")
    let {username,billname,billamount,billdate,monthly} = req.body;
    const dateObject = new Date(billdate);
    const formattedDate = formatDate(dateObject);
    const create = await new model.Bill(
        {
            username,
            billname,
            billamount,
            billdate:formattedDate,
            monthly
        }
    )
    return create.save(res.json(create))
}


function formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}
  
//get bill
async function get_Bill(req, res) {
    const username = req.params.username;

    try {
        const data = await model.Bill.find({ username :username });
        if (!data) {
            return res.status(404).json({ error: 'No bills found for the provided username' });
        }

        return res.json(data);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

//delete bill
async function delete_Bill(req,res){
    if(!req.body) res.status(400).json({message:"req body does not found"})
    await model.Bill.deleteOne(req.body,res.json("record deleted"))
}

//quiz game
async function quiz_Game(req,res){
        try {
            const quizQuestionData = req.body;
        
            const newQuizQuestion = new model.Quiz(quizQuestionData);
        
            const savedQuizQuestion = await newQuizQuestion.save();
        
            res.status(201).json(savedQuizQuestion);
          } catch (error) {
            console.error('Error saving quiz question:', error);
            res.status(500).json({ error: 'Internal Server Error' });
          }
}
//get the quiz game
async function get_Game(req,res){
    try {
        const data = await model.Quiz.find({});
        if (!data) {
            return res.status(404).json({ error: 'No bills found for the provided username' });
        }
        return res.json(data);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    create_monthmode,
    update_monthmode,
    create_target,
    get_target,
    delete_Target,
    get_monthmode,
    create_wallet,
    get_Wallet,
    get_SingleWallet,
    delete_Wallet,
    get_PaidInfo,
    get_SinglePaid,
    create_Bill,
    get_Bill,
    quiz_Game,
    get_Game,
    delete_Bill
}