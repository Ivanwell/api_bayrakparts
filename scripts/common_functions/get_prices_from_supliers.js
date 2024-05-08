const axios = require('axios')

async function getCsvPriceFromBM() {
  return new Promise((resolve, reject) => {
    let body = JSON.stringify({
      currency: 'A358000C2947F7AE11E23F5617780B16',
      warehouses: ['ACF9000C2947F7AE11E28A2B02C4AD32'],
    })

    const options = {
      method: 'POST',
      url: `https://api.bm.parts/prices/list`,
      data: body,
      headers: {
        Authorization: process.env.API_KEY_BM_PARTS,
      },
      'User-Agent':
        'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36',
    }

    axios
      .request(options)
      .then(response => {
        resolve(response.data)
      })
      .catch(error => {
        resolve('Помилка')
      })
  })
}

async function getJsonTechnoMirPrice() {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      url: 'https://api.tehnomir.com.ua/price/getStockPrice',
      data: {
        apiToken: process.env.API_TOKEN_TM,
      },
      headers: { 'Content-Type': 'application/json' },
    }

    axios.request(options).then(response => {
      resolve(response.data)
    })
  })
}

module.exports = { getCsvPriceFromBM, getJsonTechnoMirPrice }
