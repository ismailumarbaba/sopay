const axios = require('axios');
const { User, sequelize, History, Item } = require('../database/models');
const MSG = require('../helpers/messages');

axios.defaults.headers.common['Authorization'] = `Bearer ${process.env.RAVE_TOKEN}`;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

require('dotenv').config();

const payForItem = (psid, amount, phone_number, options = {gift: false}) => {
  // Buy airtime
   if(!phone_number || !amount) return {status: false, message: 'INTERNAL: Invalid call'};
   return axios.post('https://api.flutterwave.com/v3/bills', {
            "country":"NG",
            "customer":phone_number,
            amount,
            "recurrence":"ONCE",
            "type":"AIRTIME",
            "reference":`${'AIDA_AIRTIME_'+Math.floor((Math.random() * 1000000000) + 1)}`
        })
      .then((response) => {
        if (response.data.status === 'success') {
          //update user account
          if(options.gift === false) sequelize.query(`UPDATE Users SET balance = balance - ${amount} WHERE psid = '${psid}'`)
          History.create({
            product: 'Airtime VTU',
            psid,
            profit: 3,
            description: `${phone_number} was sent ${amount} airtime via AT gateway`,
            amount 
          })
          return `Sent NGN${amount} to ${phone_number}`;
        }else {
          //just return me
          return `Unable to send ${amount} to ${phone_number}. Please check if you have sufficient balance.`;
        }
      })
      .catch((error) => {
        // console.log(error)
        return 'Unable to process request. Kindly check back with us later';
    });
 }


module.exports = {
  async addItem(owner, cost, name) {
    //add item
    const item_id = `${'ITM'+Math.floor((Math.random() * 10000000) + 1)}`
    const name_owner = `${name}_${owner}`

    return Item.create({owner, cost, name: name.replace(/_/g, ' '), item_id, name_owner})
      .then((data) => {
        let rply = `Item added successfully..!! \n\n  ITEM name: *${name.replace(/_/g, ' ')}*\n`
        rply += `  ITEM ID: *${item_id}*\n  ITEM payment link: `
        rply += `https://wa.me/${process.env.TWILIO_PHONE}/?text=PAY%20${item_id}\n\n`
        rply += `Reply with *STORE* to manage items in store`
        return rply;
      }).catch((e)=>{
        // consoleog(e);
        return 'Could not add item.\nIt seems an item with same name already exist. Try again'
      })
  },
  async getItems(psid={}){
    return Item
    .findAll({ where: {owner : psid} })
    .then((result) => {
      // console.log(JSON.stringify(result));
      return (result[0] && result[0].id) ? result : {}
    })
    .catch(() => {
      return {}
    });
  },
  async getHistories(psid={}){
    return History
    .findAll({ where: {psid} })
    .then((result) => {
      // console.log(JSON.stringify(result));
      return (result[0] && result[0].id) ? result : {}
    })
    .catch(() => {
      return {}
    });
  },
  async getItem(item_id){
    return Item
    .findOne({ where: { item_id } })
    .then((result) => {
        return (result && result.id) ? result : {}
    })
    .catch(() => {
      return {}
    });
  },
  paymentRequest(txt = '') {
    // check if format is for vtu
    let msg = txt.toUpperCase();
    let err = '';
    const filteredMsg = msg.split(' ').filter(function (el) {
      return el != '';
    });
    let [keyword, itemID] = (filteredMsg[1]) ? filteredMsg : ['', ''];
    
    if (itemID.length < 5 || itemID.slice(0, 3) !== 'ITM') err = MSG.error.incorrectPayCommand
    else if (keyword !== 'PAY') err = MSG.error.incorrectPayCommand
    else itemID = itemID
  
    return {
      status: keyword === 'PAY' && itemID.length > 3,
      data: {itemID },
      err
    }
  },
  addingItemReq(txt = ''){
    let msg = txt.toUpperCase();
    let err = '';
    let itemCmd = msg.split('ADD ITEM')
    if(itemCmd[1] === undefined) error = MSG.error.WRONG_ITEM_CMD

    const filteredMsg = itemCmd[1].split(' ').filter(function (el) {
       return el != '';
    });

    let [itemName, costPrice] = (filteredMsg) ? filteredMsg : ['', ''];
    
    if (itemName.length < 3 || isNaN(Number(costPrice)) || Number(costPrice)< 1 ) err = MSG.error.WRONG_ITEM_CMD
  
    return {
      status: err.length >= 1,
      data: {itemName, costPrice: Number(costPrice) || 0 },
      err
    }
  }, 
  payForItem
};
