const routes = require('express').Router();
const controller = require('../controller/controller')
const controller2 = require('../controller/controller2')
const controller3 = require('../controller/controller3')
const mail = require('../controller/mailer')


routes.route('/api/monthmode')
   .post(controller2.create_monthmode)
   .put(controller2.update_monthmode)
routes.route('/api/monthmode/:userid')
   .get(controller2.get_monthmode)
routes.route('/api/target')
   .post(controller2.create_target)
   .delete(controller2.delete_Target)
routes.route('/api/target/:userid')
   .get(controller2.get_target)

routes.route('/api/categories/:username')
   .post(controller.create_Categories)
   .get(controller.get_Categories)

routes.route('/api/transaction')
   .get(controller.get_Transaction)
   .post(controller.create_Transaction)
   .delete(controller.delete_Transaction)


routes.route('/api/labels/:username')
   .get(controller.get_Labels)

routes.route('/api/wallet')
    .post(controller2.create_wallet)
    .delete(controller2.delete_Wallet)

routes.route('/api/userwallet/:username')
    .get(controller2.get_Wallet)

routes.route('/api/singlewallet/:id')
    .get(controller2.get_SingleWallet)

//not used apis 2
routes.route('/api/singlepaid')
      .get(controller2.get_SinglePaid)
routes.route('/api/paidinfo')
     .get(controller2.get_PaidInfo)

routes.route('/api/bill/:username')
      .get(controller2.get_Bill)
routes.route('/api/bill')
      .post(controller2.create_Bill)
      .delete(controller2.delete_Bill)
//auth routes
routes.route('/api/register')
       .post(controller3.register)
routes.route('/api/registermail')
       .post(mail.registermail)
routes.route('/api/authenticate')
       .post(controller3.verifyUser,(req,res) => res.end())
routes.route('/api/login')
       .post(controller3.verifyUser ,controller3.login)

routes.route('/api/user/:username')
       .get(controller3.getuser)
routes.route('/api/generateotp')
       .get(controller3.verifyUser, controller3.localvariable ,controller3.generateotp)
routes.route('/api/verifyotp')
       .get(controller3.verifyUser,controller3.verifyotp)
routes.route('/api/createResetSession')
       .get(controller3.createresetsession)

routes.route('/api/updateuser')
       .put(controller3.Auth,controller3.updateuser)
routes.route('/api/resetpassword')
       .put(controller3.verifyUser,controller3.resetpassword)

routes.route('/api/quizgame')
       .post(controller2.quiz_Game)
       .get(controller2.get_Game)

module.exports = routes;