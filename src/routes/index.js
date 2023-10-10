const whatsappController = require('../controllers/whatsapp');
const storeController = require('../controllers/store');
const userController = require('../controllers/user');

module.exports = (app) => {
  app.post('/whatsapp/webhook', whatsappController.handleRequest);
  app.post('/store/edit', storeController.edit);
  app.post('/store/delete', storeController.delete);
  app.get('/store/:user_token?', storeController.index);
  app.get('/fund/:psid', storeController.fundWalletUI);
  app.post('/fund/', userController.fundWallet);
  app.post('/store/withdraw', userController.withdraw);
};
