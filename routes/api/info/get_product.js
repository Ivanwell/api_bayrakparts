const {
  Item_whole,
  Category,
  Item_direct,
} = require('../../../models/models.js')
const axios = require('axios')
var fs = require('fs')

const GetProduct = async function (req, res, next) {
  const brand = req.query.brand || null
  let filter = { article: req.query.article }
  if (brand) {
    filter = {
      article: req.query.article,
      brand: { $regex: req.query.brand, $options: 'i' },
    }
  }

  try {
    const product = await Item_whole.findOne(filter)
      .populate('link')
      .populate({
        path: 'supliers',
        match: { amount: { $ne: '0' } },
        options: { sort: { price: 1 } },
        perDocumentLimit: 1,
      })
      .populate({
        path: 'reviews',
        populate: {
          path: 'comments',
        },
      })
      .populate({
        path: 'categories',
        populate: {
          path: 'relatedArticles',
        },
      })
      .exec()

    let list = []
    let broadList = []

    if (product.categories.length > 0) {
      list = product.categories[0].fullPath.map((category, index) => {
        return {
          '@type': 'ListItem',
          position: index + 2,
          item: {
            '@id': `https://bayrakparts.com/categories/${category.eng}`,
            name: category.ukr,
          },
        }
      })

      const defaultAllCat = {
        '@type': 'ListItem',
        position: 1,
        item: {
          '@id': `https://bayrakparts.com/categories`,
          name: 'Автозапчастини',
        },
      }

      list.unshift(defaultAllCat)

      const broadItem = {
        '@type': 'ListItem',
        position: list.length + 1,
        item: {
          '@id': `https://bayrakparts.com/product/${product.link[0].link}`,
          name: product.title,
        },
      }
      list.push(broadItem)

      broadList = {
        '@context': 'http://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: list,
      }
    }

    let reviewsArr = []
    let rating = 0

    let dataPage = {
      '@context': 'http://schema.org',
      '@type': 'Product',
      image: product.image,
      //   description: product.unicTitle || product.title,
      name: product.title,
      category: product.categoryName,
      mpn: product.article,
      sku: product.article,
      brand: { '@type': 'Brand', name: product.brand },
      itemCondition: 'https://schema.org/NewCondition',
      offers: {
        '@type': 'Offer',
        availability:
          product.supliers.length === 0
            ? 'https://schema.org/OutOfStock'
            : 'https://schema.org/InStock',
        price: product.supliers[0]?.price || 1,
        priceCurrency: 'UAH',
        priceValidUntil: '2025-10-15',
        url: `https://bayrakparts.com/product/${product.link[0].link}`,
      },
    }

    if (product.reviews.length > 0) {
      reviewsArr = product.reviews.map(review => {
        return {
          '@type': 'Review',
          author: { '@type': 'Person', name: review.person },
          datePublished: review.createdDate,
          reviewBody: review.message,
          reviewRating: {
            '@type': 'Rating',
            ratingValue: review.stars,
          },
        }
      })

      const sum = product.reviews.reduce(
        (accumulator, currentValue) => accumulator + +currentValue.stars,
        0
      )
      const itemRating = sum / product.reviews.length

      rating = {
        '@type': 'AggregateRating',
        ratingCount: product.reviews.length,
        ratingValue: itemRating,
      }

      dataPage = {
        '@context': 'http://schema.org',
        '@type': 'Product',
        aggregateRating: rating,
        image: product.image,
        description: product.unicTitle || product.title,
        name: product.title,
        category: product.categoryName,
        mpn: product.article,
        sku: product.article,
        brand: { '@type': 'Brand', name: product.brand },
        itemCondition: 'https://schema.org/NewCondition',
        offers: {
          '@type': 'Offer',
          availability:
            product.supliers.length == 0
              ? 'https://schema.org/OutOfStock'
              : 'https://schema.org/InStock',
          price: product.supliers[0]?.price || 1,
          priceCurrency: 'UAH',
          priceValidUntil: '2025-10-15',
          url: `https://bayrakparts.com/product/${product.link[0].link}`,
        },
        review: reviewsArr,
      }
    }

    res
      .status(200)
      .json({ product: product, broadList: broadList, dataPage: dataPage })
  } catch (error) {
    res.status(500).json(error)
  }
}

const GetProductsByFullInfo = async function (req, res, next) {
  try {
    const { category, brand, model, engine } = req.body

    const products = await getProductsByModelAndEngine(
      category,
      brand,
      model,
      engine
    )

    const categoryNameSplited = category.split('/')
    const categoryName =
      categoryNameSplited[categoryNameSplited.length - 1].toLowerCase()

    if (products.length === 0 || !products) {
      res.status(200).json({
        arr: [],
        amount: 0,
        title: `${categoryName} для ${brand} ${model}`,
        metaTitle: `Купити ${categoryName} до ${brand} ${model} ${engine} - BAYRAKPARTS`,
        metaDescr: `Замовте ${categoryName} до свого ${brand} ${model} та отримайте знижку. Якісні автозапчастини для ${brand}.`,
        category: category,
      })
    } else {
      const articlesArr = products.map(item =>
        item.article.replace(/[- ./]/g, '').toUpperCase()
      )

      const articlesBrands = products.map(item => item.brand.toUpperCase())

      const productsWhole = await Item_whole.find({
        article: articlesArr,
        brand: articlesBrands,
      })
        .limit(20)
        .populate({
          path: 'supliers',
          options: { sort: { price: 1 } },
          match: { amount: { $ne: '0' } },
          perDocumentLimit: 1,
        })
        .populate('categories')
        .populate('link')
        .exec()
      const productsCount = await Item_whole.find({
        article: articlesArr,
        brand: articlesBrands,
      }).countDocuments()

      const obj = {
        arr: productsWhole,
        amount: productsCount,
        title: `${categoryName} для ${brand} ${model}`,
        metaTitle: `Купити ${categoryName} до ${brand} ${model} ${engine} - BAYRAKPARTS`,
        metaDescr: `Замовте ${categoryName} до свого ${brand} ${model} та отримайте знижку. Якісні автозапчастини для ${brand}.`,
      }

      res.status(200).json(obj)
    }
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ message: error.message })
  }
}

const CheckCompatibility = async function (req, res, next) {
  try {
    const { category, brand, model, engine, partArticle, partBrand } = req.body

    const products = await getProductsByModelAndEngine(
      category,
      brand,
      model,
      engine
    )

    if (products.length === 0 || !products) {
      res.status(200).json('does not fit')
    } else {
      const isThereSuitable = products.find(
        item =>
          item.article.replace(/[- ./]/g, '').toUpperCase() === partArticle &&
          item.brand.toUpperCase() === partBrand
      )

      if (isThereSuitable) {
        fs.appendFile(
          './routes/api/info/test.txt',
          `Підходить ${partArticle} ${partBrand} до ${model}` + '\n',
          err => {
            if (err) {
              console.error(err)
            }
          }
        )

        res.status(200).json('true')
      } else {
        fs.appendFile(
          './routes/api/info/test.txt',
          `Не підходить ${partArticle} ${partBrand} до ${model}` + '\n',
          err => {
            if (err) {
              console.error(err)
            }
          }
        )

        res.status(200).json('does not fit')
      }
    }
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ message: error.message })
  }
}

async function getProductsByModelAndEngine(category, made, model, engine) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      url: `https://api.bm.parts/search/products?nodes=${category}&warehouses=all&cars=${made}>${model}>${engine}&products_as=arr&per_page=20`,

      headers: {
        Authorization: process.env.API_KEY_BM_PARTS,
      },
      'User-Agent':
        'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36',
    }

    axios
      .request(options)
      .then(response => {
        if (!response.data) {
          resolve(null)
        } else {
          resolve(response.data.products)
        }
      })
      .catch(error => {
        resolve(null)
      })
  })
}

const GetProductsByCategory = async function (req, res, next) {
  const { category, page } = req.query
  let step = 0
  if (page) {
    step = parseInt(req.query.page) * 20
  }

  try {
    const productsWhole = await Item_whole.find({ categoryName: category })
      .skip(step)
      .limit(20)
      .populate({
        path: 'supliers',
        match: { amount: { $ne: '0' } },
        options: { sort: { price: 1 } },
        perDocumentLimit: 1,
      })
      .populate('link')
      .exec()

    const productsCount = await Item_whole.find({
      categoryName: category,
    }).countDocuments()

    const obj = {
      arr: productsWhole,
      amount: productsCount,
      title: `${category}${page != 0 ? `, сторінка ${+page + 1}` : ''}`,
      metaTitle: `Купити ${category.toLowerCase()} до Вашого авто${
        page != 0 ? `, сторінка ${+page + 1}` : ''
      } - BAYRAKPARTS`,
      metaDescr: `Замовте ${category.toLowerCase()} до свого авто та отримайте знижку. Якісні автозапчастини для Вашого авто.`,
    }

    res.status(200).json(obj)
  } catch (error) {
    res.status(500).json(error)
  }
}

const GetCategories = async function (req, res, next) {
  try {
    const { link } = req.query
    const category = await Category.findOne({ link: link })
      .populate('categories')
      .exec()

    let list = category.fullPath.map((category, index) => {
      return {
        '@type': 'ListItem',
        position: index + 2,
        item: {
          '@id': `https://bayrakparts.com/categories/${category.eng}`,
          name: category.ukr,
        },
      }
    })

    const defaultAllCat = {
      '@type': 'ListItem',
      position: 1,
      item: {
        '@id': `https://bayrakparts.com/categories`,
        name: 'Автозапчастини',
      },
    }

    list.unshift(defaultAllCat)

    const broadList = {
      '@context': 'http://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: list,
    }

    res.status(200).json({
      category: category,
      broadList: broadList,
      title: `${category.name}`,
      metaTitle: `Купити ${category.name.toLowerCase()} до Вашого авто - BAYRAKPARTS`,
      metaDescr: `Замовте ${category.name.toLowerCase()} до свого авто та отримайте знижку. Якісні автозапчастини для Вашого авто.`,
    })
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ message: error.message })
  }
}

const getUuid = async (art, brand) => {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      url: `https://api.bm.parts/search/products?q=${art}&products_as=arr&search_mode=strict`,

      headers: {
        Authorization: process.env.API_KEY_BM_PARTS,
      },
      'User-Agent':
        'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36',
    }

    axios
      .request(options)
      .then(response => {
        if (response.data.products.length < 1) {
          res.json(null)
        } else {
          let finaldata
          if (!brand) {
            finaldata = response.data.products.find(
              product =>
                product.article.replace(/[- /]/g, '') ===
                art.replace(/[- /]/g, '')
            )
          } else {
            finaldata = response.data.products.find(
              product =>
                product.article.replace(/[- /]/g, '') ===
                  art.replace(/[- /]/g, '') && product.brand === brand
            )
          }

          resolve(finaldata.uuid)
        }
      })
      .catch(error => {
        resolve(error)
      })
  })
}

const getDetails = async uuid => {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      url: `https://api.bm.parts/product/${uuid}?oe=full`,

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
        resolve(error)
      })
  })
}

const GetDetailsByUuid = async function (req, res, next) {
  try {
    const uuid = await getUuid(req.query.article, req.query.brand)
    const detailsArr = await getDetails(uuid)
    res.status(200).json({
      fits: detailsArr.product?.cars,
      details: detailsArr.product?.details,
    })
  } catch (error) {
    res.status(500).json(error)
  }
}

const Test = async function (req, res, next) {
  try {
    const arr1 = await Item_direct.find({ price: { $type: 'string' } })

    res.status(200).json(arr1)
  } catch (error) {
    res.status(500).json(error)
  }
}

module.exports = {
  GetProduct,
  GetProductsByFullInfo,
  GetProductsByCategory,
  GetCategories,
  CheckCompatibility,
  GetDetailsByUuid,
  Test,
}
