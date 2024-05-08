const axios = require('axios')

async function saySmth(data) {
  const options = {
    method: 'GET',
    url: `https://api.telegram.org/bot6173056848:${process.env.API_TOKEN_TELEGRAM}/sendMessage?chat_id=@edetalRequests&text=${data}`,
  }

  axios
    .request(options)
    .then(response => {
      return response
    })
    .catch(error => {
      return 'Помилка'
    })
}

const LeaveRequest = async function (req, res, next) {
  try {
    const { article, brand, phone, vin, name } = req.body
    await saySmth(
      `Новий запит на перевірку. Вінкод ${vin} Артикул ${article} Бренд ${brand} Телефон ${phone} Клієнт ${name}`
    )
    res.status(200).json('request created')
  } catch (error) {
    res.status(500).json(error)
  }
}

const LeaveRequestForSearch = async function (req, res, next) {
  try {
    const { part, phone, vin, name } = req.body
    await saySmth(
      `Новий запит на пошук. Вінкод ${vin} Запчастина ${part} Телефон ${phone} Клієнт ${name}`
    )
    res.status(200).json('request created')
  } catch (error) {
    res.status(500).json(error)
  }
}

module.exports = { LeaveRequest, LeaveRequestForSearch }
