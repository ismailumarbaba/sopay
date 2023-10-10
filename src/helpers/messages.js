const menu = `
  *Menu* - To display menu 
  *Wallet* - To see wallet information/balance
  *Pay* - To pay for an item
  *Store* - To manage merchant store
  *History* - To see history of ransaction
  *About* - About Sopay`;

const incorrectInput = `I dont understand what you said :(
Not to worry, lets do it again :)
Hi, my name is SOPAY. I am a bot. How may I help you?
use the following commands and leave the rest to me ;)`;

const moreOptions = ``;
const dataVariations = {};
const getDataValues = () => {};

const initial = (salute) => {
  return `${salute}, my name is SOPAY. I am a bot. How may I help you?
use the following commands and leave the rest to me ;)
${menu}
`;}

const response = {
  'MORE': moreOptions,
  'Hi': initial('Hello'),
  'hi': initial('Hello'),
  'HI': initial('Hello'),
  'menu': initial('Hello'),
  'Menu': initial('Hello'),
  'MENU': initial('Hello'),
  'HELLO': initial('Hi'),
  'Hello': initial('Hi'),
  'HOWDY': initial('Yo..!!'),
  'YO': initial('Howdy..!!'),
  'YAHNE': initial('Kalau fa..!!'),
  'HAFA': initial('Doing fine ooo..'),
  'HOW FAR': initial('Omo fine ooo'),
  'XUP': initial('Cool'),
  'STORE': 'Welcome to your store. To add a new item, use the command *Add item ITEMNAME ITEMCOST* e.g: *Add item headphone 2000* to add a headphone that costs 2000\nTo manage (edit/delete) existing items, click on this temporary link:\n',
  'ITEM': 'Welcome to your store. To add a new item, use the command *Add item ITEMNAME ITEMCOST* e.g: *Add item headphone 2000* to add a headphone that costs 2000\nTo manage (edit/delete) existing items, click on this temporary link:\n',
  'ITEMS': 'Welcome to your store. To add a new item, use the command *Add item ITEMNAME ITEMCOST* e.g: *Add item headphone 2000* to add a headphone that costs 2000\nTo manage (edit/delete) existing items, click on this temporary link:\n',
  'WHAT IS YOUR NAME': initial('Me?'),
  'FUCK YOU': initial('Opps ;('),
  'FUCK': initial('Opps ;('),
  'THANKS': 'You are welcome. ^_^',
  'THANK YOU': 'Glad I could help. ^_^',
  'RECEIVED': 'OK..!!',
  'CREATOR': 'ismailumar4all@gmail.com | https://github.com/ismailumarbaba',
  'TK': 'tasiukwaplong@gmail.com | https://github.com/tasiukwaplong',
  'PAY': 'To pay for an item, enter command in the following format *PAY ITEM_ID* e.g: *PAY ITM1234567*'
}

const error = {
  incorrectPayCommand: 'Item ID incorrectly entered.',
  WRONG_ITEM_CMD: 'Wrong command enetered. To add item to store, use the format: *Add item ITEMNAME ITEMCOST* e.g: *Add item headphone 2000*. DO NOT include space in the item name, use *_* (underscore) instaead',
  lessAmount: 'Amount must not less be than 100',
  couponFormatIncorrect: 'Keyword of TRANSFER has to be used. Format: [Transfer Quantity Amount]. To buy 4 git codes that cost NGN 100 each E.g: Transfer 100 4',
  couponQuanytityError: 'Transfer quantity incorrect. Kindly enter a number. Format: [Transfer Quantity Amount]. To buy 4 gitc codes that cost NGN 100 each E.g: Transfer 100 4',
  couponAmountError: 'Transfer amount must be a number higher than 100. Kindly enter a number. Format: [Transfer Quantity Amount]. To buy 4 Transfer codes that cost NGN 100 each E.g: Transfer 100 4',
  whoops: 'Whooops..!! Something went wrong.',
  InsufficientBalanceForCoupon: 'Cannot make purchase. Insufficient balance. You currently have:',
  redeemCouponFormatIncorrect: `Keyword of REDEEM has to be used. Format: [Redeem code]. E.g: Redeem EMOS-EDOC\n${menu}`,
  dataPurchaseError: 'Unable to process data purchase. Try again later',
  giftRequestFormatError: `Format for gift code incorrectly entered.\n${response.TRANSFER}`,
  NOT_A_NUMBER: 'Phone number has to be entered correctly in the format: e.g: 080xxx..'
};

module.exports = {menu, incorrectInput, response, error, dataVariations};
