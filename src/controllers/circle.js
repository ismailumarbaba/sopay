const { Payment, sequelize } = require("../database/models");
const MSG = require("../helpers/messages");
const axios = require("axios");
const mailer = require("./mailer");
const user = require("./user");
require("dotenv").config();

module.exports = {
  async createWallet(email = 'user1@aida', phone = '', options = {fromTwitter: false}) {
    const shortEmail = email
    const data = {
      tx_ref: `reff_${Math.random().toString(36).slice(2)}${Math.floor(
        Math.random() * 100
      )}`,
      amount: "50000",
      email,
      phone_number: phone,
      currency: "NGN",
      bvn: process.env.BVN,
      narration: `${shortEmail}`,
      is_permanent: true
    };

    const config = {
      method: "post",
      url: "https://api-sandbox.circle.com/v1/banks/wire",
      headers: {
        Authorization: ``,
        "Content-Type": "application/json",
      },
      data: JSON.stringify(data),
    };

    return axios(config)
      .then(function (response) {
        // if (response.data && response.data.status === "success"){
          return {
            tx_ref: 'tracking_'+Math.floor(Math.random() * 100000),
            bank: 'Test bank',
            acc_number: Math.floor(Math.random() * 1000000000),
            acct_name: 'TEST ACC',
            psid: phone,
            phone: phone,    
            email: email
          };
      })
      .catch(function (error) {
        return user.updateUserWithWallet({
          tx_ref: 'tracking_'+Math.floor(Math.random() * 100000),
          bank: 'Test bank',
          acc_number: Math.floor(Math.random() * 1000000000),
          acct_name: 'TEST ACC'+Math.floor(Math.random() * 100000),
          psid: phone,
          phone: phone,
          email: email
        })
      });
  },
};
