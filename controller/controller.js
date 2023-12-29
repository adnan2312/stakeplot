const model = require('../models/model.js');
const cron = require('node-cron')

async function create_Categories(req, res) {
  const username = req.params.username;
  const Create = new model.Categories({
    type: "Shopping",
    color: '#fff8ff',
    username : username
  });

  await Create.save(res.json(Create))
}
//get req
async function get_Categories(req,res){
  let data = await model.Categories.find()
  
  let filter = await data.map(v =>Object.assign({},{type:v.type,color:v.color}))
  return res.json(filter);
}

//post transaction
async function create_Transaction(req,res){
  if(!req.body) return res.status(400).json("post http data not provided")
  let {username,name,type,amount} = req.body;
  const create = await new model.Transaction(
    {
      username,
      name,
      type,
      amount,
      date:new Date()
    }
  )

 return create.save(res.json(create))
}

//get transaction

async function get_Transaction(req,res){
    try {
        const data = await model.Transaction.find();
        if (!data) {
            return res.status(404).json({ error: 'No transaction found for the provided username' });
        }

        return res.json(data);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

//delete transaction
async function delete_Transaction(req,res){
  if(!req.body) res.status(400).json({message:"req body not found"})
  await model.Transaction.deleteOne(req.body,res.json("record deleted"))
}
//delete one month
async function delete_It(){
  await model.Transaction.deleteMany()
}
cron.schedule('1 0 0 1 * *', () => {
  console.log("to be deleted")
  delete_It();
})
//get labels
async function get_Labels(req,res){
  const username = req.params.username;
  model.Transaction.aggregate([ 
    {
      $match: { username: username } 
    },
    {
      $lookup:{
        from:'categories',
        localField:'type',
        foreignField:'type',
        as:'categories_info'
      }
    },
    {
      $unwind:'$categories_info',
    }
  ]).then(result=>{
    let data = result.map(v => Object.assign({},{_id:v._id,name:v.name,type:v.type,username:v.username,amount:v.amount,color:v.categories_info['color']}))
    res.json(data);
  }).catch(error => {
    res.status(400).json("lookup collection")
  })
}

// Example route definition in Express assuming you have a route for this endpoint

module.exports = { 
    create_Categories,
    get_Categories,
    create_Transaction,
    get_Transaction,
    delete_Transaction,
    get_Labels
};
