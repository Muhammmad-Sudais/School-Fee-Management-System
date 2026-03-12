// backend_functionality/utils/generateReceiptId.js
const moment = require('moment');

let lastDate = null;
let counter = 0;

const generateReceiptId = () => {
    const today = moment().format('YYYYMMDD');
    if (today !== lastDate) {
        lastDate = today;
        counter = 1;
    } else {
        counter++;
    }
    return `RCP-${today}-${String(counter).padStart(3, '0')}`;
};

module.exports = generateReceiptId;