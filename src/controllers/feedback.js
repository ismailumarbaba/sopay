const item = require('./item');
const MSG = require('../helpers/messages');
const user = require('./user');
const mailer = require("./mailer");


const checkOtherResponses = async (psid, userRequest_, userData = {}) => {
  const userRequest = userRequest_.toUpperCase();
  if (MSG.response[userRequest.toUpperCase()]) return MSG.response[userRequest.toUpperCase()]
  // #########################################################################
  // #                    CUSTOM REPLY STARTS HERE                           #
  // #########################################################################
  console.log(userData.expected_response);
  if(userRequest.slice(0,3) === 'PAY'  || 
    (userData.expected_response !== null && userData.expected_response.slice(0,7) === 'PAY-ITM')){
    // Payment for an item
    const {itemID} = item.paymentRequest(userRequest)['data'];
    const err = item.paymentRequest(userRequest)['err'];
    const errReply =  `${err}\n${MSG.response.PAY}\n${MSG.menu}`;
    
    if(err.length > 1 && userData.expected_response !== null && userData.expected_response.slice(0,7) !== 'PAY-ITM') return errReply
    
    const item_ = (userRequest.toUpperCase() !== 'Y')
    ?  await item.getItem(itemID)
    : await item.getItem(userData.expected_response.slice(4));
    
    // console.log(JSON.stringify(item.getItems(userData.psid)));
    item.getHistories(userData.psid);
    
    if (item_.id === undefined) return 'Item does not exist or has been removed from store. Kindly inform the merchant on this.\n'+MSG.menu
    //######################################################################
    //#                          condition for pay                         #
    //######################################################################
    if(userData.expected_response !== null && 
      userData.expected_response.slice(0,6) !== 'PAY-ITM' && 
      userRequest.toUpperCase() === 'Y') {
        // user accepted to pay
        let replyInsufficient = 'Insufficient balance to carry out the is transaction. '
        replyInsufficient += 'Reply with *N* to cancel this transaction'
        if(Number(item_.cost) > Number(userData.balance)) return replyInsufficient // low balance
        
        const payStatus = await user.userMadePayment(
          psid, 
          (Number(userData.balance) - Number(item_.cost)), 
          item_
        );

        if(payStatus ===true){
          // payment was successful
          const owner = await user.user(item_.owner);

          let mailBody = `Hello ${owner.firstName}<br>You have just received payment of <b>$${item_.cost}</b> `
          mailBody += `from <b>+${psid}</b> for <b>${item_.name} (${item_.item_id})</b>.<br> You may `
          mailBody += `contact the customer via whatsApp by clicking  on this link: `
          mailBody += `https://wa.me/+${psid}?text=Hello.%20Your%20payment%20for%20${encodeURIComponent(item_.name)}%20at%20the%20cost%20of%20${item_.cost}%20%20has%20been%20receieved`
          
          let saleReply = `Payment for ${item_.name}(${item_.item_id}) was successful. You may contact the `
          saleReply += `seller for further details: *[${owner.firstName} ${owner.lastName}]* `
          saleReply += `https://wa.me/+${owner.psid}?text=Hello,%20I%20just%20made%20payment%20for%20${encodeURIComponent(item_.name)}(${item_.item_id})`
          
          // send store owner notification
          mailer.send(
            owner.email,
            `PAYMENT FOR ${item_.name} WAS SUCCESSFUL`,
            mailBody
          )
          // send customer notification (receipt)
          mailer.send(
            userData.email,
            `YOU JUST PAID FOR ${item_.name}`,
            `Hello ${userData.firstName},<br>${saleReply}`
          )

          saleReply += '\nReply with *MENU* to see menu items or *WALLET* to see wallet balance'

          user.clearExpectedResponse(psid)
          return saleReply;
        }else{
          // couldnt make payment
          user.clearExpectedResponse(psid)
          const reply = '\nReply with *MENU* to see menu items or *WALLET* to see wallet balance'
          return 'Payment was not successful. Please try again'+reply
        }

    }else if(userData.expected_response !== null && 
      userData.expected_response.slice(0,6) !== 'PAY-ITM' && 
      userRequest.toUpperCase() === 'N') {
        // user cancels traction
        user.clearExpectedResponse(userData.psid);
        return `Transaction cancelled. \n${MSG.menu}`

    }else if(item_.cost !== undefined && item_.cost > userData.balance){
        // user balance is low
        let reply = `Insufficient balance to pay for *${item_.name.replace(/_/g, ' ')}* which `
        reply += `costs *$${Intl.NumberFormat('en-US').format(item_.cost)}*. Your current balance is: `
        reply += `$${Number(userData.balance)}\n${MSG.menu}`
        return reply;

    }else if(item_.cost < userData.balance){
        // can be bought
        user.addExpectedResponse(psid, 'PAY-'+item_.item_id)
        let reply = `You are about to pay for *${item_.name.replace(/_/g, ' ')}* at the cost of `
        reply += `*$${Intl.NumberFormat('en-US').format(item_.cost)}*. If you wish to proceed, `
        reply += `reply *Y* otherwise, reply *N* to cancel payment`
        return reply

    }else{
        //Pending payment
        if(userRequest.slice(0,3) === 'PAY') return 'Incorrect Item ID entered. Item IDs starts with *ITM..* \n Reply with *MENU* to see menu options'
        let reply = `You have a pending payment on an item. Kindly reply with *Y* to complete `;
        reply+= `the payment or *N* to cancel.\n *NOTE:* You must reply `
        reply += `to this transaction before you can do any other thing`
        return reply;
    }
    //######################################################################
    //#                          condition for pay stops here              #
    //######################################################################

    

  } else if(userRequest.slice(0,8) === 'ADD ITEM'){
    const {itemName, costPrice} = item.addingItemReq(userRequest)['data'];
    const err = item.addingItemReq(userRequest)['err'];
    
    if(err.length > 1) return `${err}\n${MSG.menu}`;
    
    return item.addItem(psid, costPrice, itemName)
      .then((result) => {
        return `${result}${MSG.menu}`;
    }).catch((err) => {
        return `${err}${MSG.menu}`;
    });

  }else {
    return `${MSG.incorrectInput}${MSG.menu}`
  }
  // #########################################################################
  // #                    CUSTOM REPLY STARTS HERE                           #
  // #########################################################################
};

module.exports = {
  async response(psid, userRequest, userData = {}) {
    // generate response for user
  
    let response = `${MSG.error.whoops}${MSG.menu}`
    userRequest = userRequest.trim();

    switch (userRequest.toUpperCase()) {
      case 'WALLET':
        response = `Your wallet balance is *$${userData.balance}*.`
        
        if (userData.acc_number !== null) { 
          // response += '\nTo fund your wallet, make deposit to this account:'
          // response +=  '\nAccount number: ' + userData.acc_number
          // response += '\nBank: ' + userData.bank
          // response += '\nAccount name: '+ userData.acct_name
          response += `\n\nFund your wallet online via: ${process.env.URL}/fund/${userData.psid}`
          // response += `\nTo withdraw from your wallet, click on this link: ${process.env.URL}/withdraw/${userData.psid}`
        }

        response += '\n\nPlease note, we charge 3% + N0.5 of deposit for each deposit.'
        response += 'If you face any issue funding your wallet, you may contact'
        response += '\nhttps://wa.me/+2348039262966/?text=hello%20I%20want%20to%20fund%20my%20wallet '
        response += 'for any funding issues.\n\nReply with *MENU* to see the menu options available'
        break;
        
      case 'MENU':
        response = `SOCIAL-PAY MENU:\n\n${MSG.menu}`
        break;
      case 'PAY':
          response = `${MSG.response.PAY}\n${MSG.menu}`
          break;
      case 'HISTORY':
          response = `${MSG.response.STORE}${user.generateTempLink(psid, true)}\n\n${MSG.menu}`
          break;
      case 'STORE':
          response = `${MSG.response.STORE}${user.generateTempLink(psid)}\n\n${MSG.menu}`
          break;
      case 'ITEM':
          response = `${MSG.response.STORE}${user.generateTempLink(psid)}\n\n${MSG.menu}`
          break;
      case 'ITEMS':
          response = `${MSG.response.STORE}${user.generateTempLink(psid)}\n\n${MSG.menu}`
          break;
      default:
        response = await checkOtherResponses(psid, userRequest, userData);
        break;
    }
    return response;
  },
  isEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  },
  getFullName(name) {
    const fn = name.trim().split(" ");
    if (fn.length !== 2) return false;
    return fn[0].charAt(0).toUpperCase() + fn[0].substr(1).toLowerCase() + ' ' + fn[1].charAt(0).toUpperCase() + fn[1].substr(1).toLowerCase();;
  },
  generateCode(phone){
    // generate random numbers
    const decoder = Math.floor(Math.random() * (99 - 11 + 1) + 11);
    const firstTwoStr = phone.slice(-1) + phone.slice(-2) + phone.slice(-3)
    return 'VER-'+((firstTwoStr * decoder) + 111) + '-' + decoder
  },  
  async sendWarningMessage(email = process.env.DEVELOPER_EMAIL){
    // comes without + sign
    mailer.send(email, 'LOW BALANCE', 'Your balance is low. The social-pay bot may not reply you again. This is due to low (or no transaction) from your account. To continue using our service, make a deposit using ');
  },
  decodeCode(code, phone){
    // decode
    const decoder = code.split('-')[2]
    const firstTwoStr = phone.slice(-1) + phone.slice(-2) + phone.slice(-3)
    return 'VER-'+(((firstTwoStr * decoder) + 111) + '-' + decoder) === code
  },
  async sendVerificationCode(phone, email){
    // verification for whatsapp
    const generatedCode = this.generateCode(phone);
    const body = `Hello, your verification code is: <b>${generatedCode}</b>. 
    Send this code to ${process.env.TWILIO_PHONE} or 
    click on this link: <a href='https://wa.me/${process.env.TWILIO_PHONE}/?text=${generatedCode}'>
    https://wa.me/${process.env.TWILIO_PHONE}/?text=${generatedCode}'</a>`
    
    const mailStatus = await mailer.send(
      email, 
      'SOPAY BOT verification code', body)
      
    
      return (mailStatus === false) 
        ? 'Verification code could not be sent to that email. Try again with a valid email address' 
        : 'Verification message sent to your email. If you have not received it yet, enter your email address again' 
  }
}