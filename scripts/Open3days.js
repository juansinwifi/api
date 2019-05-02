const {Reports} = require('../models/reports');

function doubleAfter2Seconds(x) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(x * 2);
      }, 2000);
    });
  }
  
  async function addAsync() {
    const dropCustomers =  await Reports.collection.drop();
    return 'Drop';
  }
  
  
  addAsync().then((sum) => {
    console.log(sum);
  });