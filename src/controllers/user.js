const { User, sequelize, History } = require("../database/models");
const MSG = require('../helpers/messages');
const mailer = require("./mailer");
require("dotenv").config();

module.exports = {
  async insertUser(data) {
    // Create or update user
    // if (!data.psid || data.status !== 'successful') return {errored: true, message: 'Incomplete data provided'};
    const userToken = `TOKEN_${new Date().getTime()}_${Math.random()
      .toString(36)
      .slice(2)}${Math.floor(Math.random() * 100)}`;

    let query =
      data.status && data.status === "successfull"
        ? `INSERT INTO Users (psid, firstName, lastName, email, phone, balance, userToken) VALUES ('${data.psid}', '${data.firstName}', '${data.lastname}', '${data.email}', '${data.phone}', '${data.amount}', '${userToken}') ON DUPLICATE KEY UPDATE firstName=VALUES(firstName), lastName=VALUES(lastName), email=VALUES(email), phone=VALUES(phone), balance=balance + VALUES(balance)`
        : `INSERT INTO Users (psid, balance, userToken) VALUES ('${data.psid}', '${data.amount}', '${userToken}') ON DUPLICATE KEY UPDATE balance=balance + VALUES(balance)`;

    if (data.internal === true)
      query = `INSERT INTO Users (email, temp_phone, userToken) VALUES ('${data.email}', '${data.temp_phone}', '${userToken}') ON DUPLICATE KEY UPDATE email=VALUES(email), chat_balance=chat_balance - 2`;
    if (data.internal2 === true)
      query = `INSERT INTO Users (temp_phone, userToken) VALUES ('${data.temp_phone}', '${userToken}') ON DUPLICATE KEY UPDATE chat_balance=chat_balance - 2`;

    const reslt = await sequelize
      .query(query)
      .then(() => {
        return {
          errored: false,
          message: "Updated successfully",
        };
      })
      .catch((err) => {
        return {
          errored: true,
          message: "Unable to update",
        };
      });
    return reslt;
  },
  deductFromUserAcount(psid, amount) {
    // update user balance
    return sequelize
      .query(
        `UPDATE Users set balance = balance - '${amount}' WHERE psid = '${psid}'`
      )
      .then(() => {
        return { errored: false };
      })
      .catch(() => {
        return { errored: true };
      });
  },
  addToUserChatBalance(psid, amount) {
    // update user balance
    return sequelize
      .query(
        `UPDATE Users set chat_balance = chat_balance + ${amount} WHERE psid = '${psid}'`
      )
      .then(() => {
        return { errored: false };
      })
      .catch(() => {
        return { errored: true };
      });
  },
  user(psid) {
    return User.findOne({ where: { psid } });
  },
  balance(psid) {
    return User.findOne({ where: { psid } })
      .then((result) => {
        return (result && result.balance !== undefined)
          ? `Your account balance is NGN ${result.balance}\n ${MSG.menu}`
          : "User does not exist. Not to worry, reply 1 to start";
      })
      .catch((err) => {
        // console.log(err);
        return "Unable to fetch user balance";
      });
  },
  get(psid, withToken = false) {
    // duplication of user(). Pls delete user() but find where it is used
    return (withToken === true) ? User.findOne({ where: { userToken: psid } }) : User.findOne({ where: { psid } });
  },
  getByPhone(phone) {
    const query = `SELECT * FROM Users WHERE phone = '${phone}' OR temp_phone = '${phone}' LIMIT 1`;
    return sequelize.query(query).then(([result]) => {
      return !result || !result[0] || !result[0].id || result.length <= 0
        ? { errored: true, message: "" }
        : { errored: false, message: result[0] };
    });
  },
  userMadePayment(psid, balance, item_){
    return User.update({balance}, {where: { psid }})
      .then((rowsAffected) => {
        // add to history
        if(rowsAffected[0] === 1){
          // user balance deduted successfully
          const itemCost = Number(item_.cost);
          let updtQuery = `UPDATE Users SET balance = balance + ${(itemCost - (itemCost * 0.02)).toFixed(2)} `
          updtQuery +=  `WHERE psid = '${item_.owner}'`

          sequelize.query(updtQuery)
          History.create({
            product : item_.name,
            description: `${psid} paid for ${item_.name} at $${itemCost} on ${new Date()}`,
            psid : item_.owner,
            amount : itemCost,
            profit : itemCost * 0.02
          }).catch((e) => {
            mailer.send('ismailumar4all@gmail.com', 'ERROR paying for item', JSON.stringify(e))
            return true
          });

          return true
        }

        return (rowsAffected[0] === 1)
      })
      .catch((error) => {
        mailer.send('ismailumar4all@gmail.com', 'ERROR paying for item', JSON.stringify(error))
        return false
    });
  },
  addExpectedResponse(phone, resp){
    return sequelize
      .query(
        `UPDATE Users set expected_response = '${resp}' WHERE temp_phone = '${phone}'`
      )
      .then(() => {
        return { errored: false };
      })
      .catch(() => {
        return { errored: true };
      });
  },
  clearExpectedResponse(phone){
    return sequelize
      .query(
        `UPDATE Users set expected_response = NULL WHERE psid = '${phone}'`
      )
      .then(() => {
        return { errored: false };
      })
      .catch(() => {
        return { errored: true };
      });
  },
  addName(phone, names){
    // console.log(names);
    return sequelize
      .query(`UPDATE Users set firstName = '${names.firstName}', lastName = '${names.lastName}', expected_response = NULL WHERE temp_phone = '${phone}'`)
      .then(() => {
        return { errored: false };
      })
      .catch(() => {
        return { errored: true };
      });
  },
  generateTempLink(phone, isHistory = false){
    // console.log(phone);
    const userToken = `${new Date().getTime()}${Math.random()
      .toString(36)
      .slice(2)}${Math.floor(Math.random() * 100)}`;

    sequelize.query(`UPDATE Users set userToken = '${userToken}' WHERE psid = '${phone}'`)
    .then(() => {
      return (isHistory === true) ? `${process.env.URL}/${userToken}/#history`:`${process.env.URL}/store/${userToken}`;
    })
    .catch(() => {
      return '[ERR_GENERATING_LINK]';
    });

    return `${process.env.URL}/store/${userToken}`;

  },
  updateUserWithWallet(data){
    return User
      .update(data, {
        where: { temp_phone: data.psid }
      })
      .then((rowsAffected) => {
        return (rowsAffected[0] === 1) ? data : false
      })
      .catch((error) => {
        // console.log(error);
        return false
      });
  },
  fundWallet(req, res) {
    return sequelize.query(`UPDATE Users set balance = balance + ${req.body.amount} WHERE psid = '${req.body.psid}'`)
      .then(() => {
        return res.status(200).send('Wallet updated successfully')
      })
      .catch(() => {
        return res.status(200).send('Could not fund your wallet. Try again later')
      });

  },
  withdraw(req, res) {
    const amount_ = Number(req.body.amount)
    const amountWithfee = amount_ + (amount_ * 0.01)
    return sequelize.query(`UPDATE Users set balance = balance - ${amountWithfee} WHERE psid = '${req.body.psid_}'`)
      .then(() => {
        return res.status(200).send('Withdrawal is processing. Kindly give us a few minutes to process your request')
      })
      .catch(() => {
        return res.status(200).send('Could not withdraw from your wallet. Try again later')
      });
  }
};
