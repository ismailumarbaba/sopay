const feedback = require("./").feedback;
const mailer = require("./mailer");
const request = require("request");
const util = require("util");
const post = util.promisify(request.post);
const user = require('./user')
const wallet = require('./circle')
const MSG = require('../helpers/messages');

require("dotenv").config();

async function sendReply(phone, body) {

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = require('twilio')(accountSid, authToken);
// return body //test
  if(body.length < 1) return 'EMPTY_BODY_MESSAGE'
  if (phone.length < 13) return 'PHONE_NUMBER_INCOMPLETE'
  client.messages
      .create({
         from: `whatsapp:${process.env.TWILIO_PHONE}`,
         body,
         to: `whatsapp:${phone}`
       })
      // .then(message => console.log(message))
      .catch((e) => {
        // console.log(e);
        return mailer.send(
          process.env.DEVELOPER_EMAIL,
          "An error occured from whatsapp bot",
          body
        );
      });
}

module.exports = {
  async handleRequest(req, res) {
    // console.log(req.body);
    const { From = false, Body = false } = req.body || data;

    let phone = From.split('whatsapp:')[1];
    
    if(phone === undefined || phone.length !== 14){
      return res.status(200).send("PHONE NUMBER MISENTERED OR NOT NIGERIAN");
    }

    let message = Body;
    
    if (!phone || !message) return res.status(200).send("PHONE NUMBER OR MESSAGE EMPTY");
    if (message.length < 1) return res.status(200).send("MESSAGE EMPTY");
    
    phone = phone.slice(1); // to remove +

    const userInfo = await user.getByPhone(phone);
    
    // if(userInfo.message.chat_balance <= 4 && userInfo.message.chat_balance > 2) feedback.sendWarningMessage(userInfo.message.email);
    // if(userInfo.message.chat_balance <= 0) return res.status(200).send('Cannot send message. Chat balance is empty');

    //GET USER NAME STARTS HERE
    if(userInfo.errored === true || (userInfo.message.psid === null && userInfo.message.firstName === null)){
      
      if(userInfo.message.expected_response === null  && feedback.getFullName(message) !== false){
        // name entered
        user.addExpectedResponse(phone, feedback.getFullName(message))
        await sendReply(phone, `Your name is *${feedback.getFullName(message)}*. Is that true? Reply with *Y* to confirm or *N* to clear this name and enter a new one`)
        return res.status(200).send(`Your name is ${feedback.getFullName(message)}. Is that true? Reply with *Y|N* to confirm otherwise, enter the correct name`)
      }else if(userInfo.message.expected_response !== undefined && userInfo.message.expected_response !== null  && message.toUpperCase() === 'Y'){
        // Replied yes to name
        user.addName(phone, {firstName: userInfo.message.expected_response.split(' ')[0], lastName: userInfo.message.expected_response.split(' ')[1]})
        await sendReply(phone, `Name has been registered as *${userInfo.message.expected_response}*. One last step, please provide a valid email address.`)
        return res.status(200).send(`Name has been registered as ${userInfo.message.expected_response}. One last step, please provide a valid email address.`)
      }else if(userInfo.message.expected_response !== undefined && userInfo.message.expected_response !== null  && message.toUpperCase() === 'N'){
        // If mistake
        user.clearExpectedResponse(phone)
        await sendReply(phone, `Initial name entered has been cleared. \n Please provide your name in the format: FirstName LastName e.g: *John Doe*`)
        return res.status(200).send(`NAME of ${userInfo.message.expected_response || 'no-name'} cleared`)
      }else{
        // NAme has not been provided yet
        if(userInfo.message.chat_balance === undefined) await sendReply(phone, 'Hello there \n Welcome to SOPAY. \n I can help with your bills payment, setting your merchant store and payment for items.\nYou are not registered yet. To begin the registration process, please provide your name in the format: FirstName LastName e.g: *John Doe*')
        else await sendReply(phone, 'You are not registered yet. To begin the registration process, please provide your name in the format: FirstName LastName e.g: *John Doe*')

        if(userInfo.message.chat_balance === undefined) user.insertUser({temp_phone: phone, internal2: true})
        return res.status(200).send('You are not registered yet. To begin the registration process, please provide your name in the format: FirstName LastName e.g: *John Doe*')
      }

    }
    //GET USER NAME STOPS HERE
    

    // EMIL VERIFICATION STARTS HERE
    if(userInfo.message.psid === null || userInfo.message.email === null){
      if (feedback.isEmail(message)) user.insertUser({email: message, temp_phone: phone, internal: true})

      if(message.slice(0,4) === 'VER-'){
        
        if (feedback.decodeCode(message, phone) === true){
          // verification is successful
          const walletInfo = await wallet.createWallet(userInfo.message.email, userInfo.message.temp_phone)

          let resp = `Your wallet is ready and account balance is *N0* \n`
          resp += 'To fund your wallet, reply with *WALLET* \n';
          resp += `Reply with any of the options:\n${MSG.menu}`

          if((walletInfo !== false)){
            // wallet create successful
            mailer.send(
              userInfo.message.email,
              "ACCOUNT VERIFIED SUCCESSFULLY",
              `${resp} \n Click on this link to start chatting with SOPAY: <a href='https://wa.me/${process.env.TWILIO_PHONE}/?text=hi'>
              https://wa.me/${process.env.TWILIO_PHONE}/?text=hi'</a>`
            );

          }
          

          (walletInfo !== false)
            ? await sendReply(phone, resp)
            : await sendReply(phone, 'Wrong verification code entered.');
          return res.status(200).send('ACCOUNT CREATION');
        }else{
          res.status(200).send('Verification code is invalid.');
          return await sendReply(phone, 'Verification code entered is wrong.')
        }

      }

      (feedback.isEmail(message) === false) 
        ? await sendReply(phone, 'Email address entered is wrong. Enter your correct email address to receive a verification code e.g *johndoe@gmail.com*')
        : await sendReply(phone, await feedback.sendVerificationCode(phone, message));
      return res.status(200).send('EMAIL VERIFICATION');
    }
    // NEW ACCOUNT ENDS
    
    user.insertUser({temp_phone: phone, internal2: true})
    
    await feedback
      .response(phone, message, userInfo.message)
      .then((r) => {
        return sendReply(phone, r)
          .then((rslt) => {
            res.status(200).send(rslt);
          })
          .catch((err) => {
              // console.log(err);
            res.status(200).send("SEND_UNSUCCESSFUL");
          });
      })
      .catch((e) => {
        // console.log(e);
        const body = `Hello boss, an error from handling sending whatsapp reply ==>>
            SENDER: , 
            MESSAGE: ${message},
            ERROR: ${JSON.stringify(e)}`;
        return mailer.send(
          process.env.DEVELOPER_EMAIL,
          "An error occured from whatsapp bot",
          body
        );
      });
  },
};
