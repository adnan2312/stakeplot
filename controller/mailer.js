const nodemailer = require("nodemailer")
const mailgen = require("mailgen")
const { EMAIL , PASSWORD } = require('../config')
const Mailgen = require("mailgen")
const cron = require('node-cron')
const {User,Bill} = require('../models/model')

let nodeConfig = {
    service : 'gmail',
    auth : {
        user: EMAIL,
        pass: PASSWORD
    }
}

let transporter = nodemailer.createTransport(nodeConfig)

let mailgenerattor = new Mailgen({
    theme:"default",
    product:{
        name:"Stakeplot",
        link:"https://stakeplot.com"
    }
})


const registermail = async (req,res) => {
    const { username,userEmail ,text, subject } = req.body;
    let email = {
        body : {
            name: username,
            intro:text || "You are welcome",
            outro : "Thanks for signing up for the stakeplot.Looking forward for the journey"
        }
    }
     let mail = mailgenerattor.generate(email)
     let message = {
        from : EMAIL,
        to : userEmail,
        subject:subject,
        html:mail
     }
    
    transporter.sendMail(message).then(() => {
        return res.status(201).json({
            msg:"you received the mail"
        })
    }).catch(error => {
        return res.status(500).json({ error })
    })
}


const billsemail = async(username,useremail,billdate,billname) => {
    //const fixedDate = '2023-12-10'
    let email = {
        body : {
            name: username,
            intro:billname + " is due to pay on",
            outro : billdate || "Looking forward to do more"
        }
    }
     let mail = mailgenerattor.generate(email)
     let message = {
        from : EMAIL,
        to : useremail,
        subject:billname,
        html:mail
     }
         try {
    await transporter.sendMail(message);
    console.log(`Email sent for ${billname} to ${message.to}`);
  } catch (error) {
    console.error(`Error sending email for ${billname}:`, error);
  }
}


async function fetchBillsAndScheduleEmails() {
    try {
      const bills = await Bill.find().exec();
  
      for (const bill of bills) {
        const user = await User.findOne({ username: bill.username }).exec();
  
        if (user) {
          const currentDate = new Date();
          const billDueDate = new Date(bill.billdate);
  
          // Schedule an email reminder if the billdate is today
          if (
            currentDate.toDateString() === billDueDate.toDateString()
          ) {
            cron.schedule(`0 20 * * *`, async () => { // Example: Send email reminder every day at 8 AM
              console.log(`Scheduled email sending task for bill with name: ${user.email}`);
              await billsemail(user.username, user.email, bill.billdate, bill.billname);
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching bills and users:', error);
    }
  }
 fetchBillsAndScheduleEmails()
module.exports = {
    registermail
    
}