var cron = require('node-cron');
// const { mainBM } = require('./bm_parts_updating/index.js')
const { mainTM } = require('./techno_mir_updating/index.js')
 
module.exports = () => {  
    cron.schedule('34 19 * * *', async () => {
    
        console.log('hello')
        await mainTM()
   
    }, {
      scheduled: true,
      timezone: "Europe/Kiev"
    });
}