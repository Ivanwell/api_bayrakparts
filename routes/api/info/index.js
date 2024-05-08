const ApiProductRouter = require('express').Router()
const {
  GetProduct,
  GetProductsByFullInfo,
  GetProductsByCategory,
  GetCategories,
  CheckCompatibility,
  GetDetailsByUuid,
} = require('./get_product.js')
const {
  GetReviews,
  AddReview,
  AddReviewToProduct,
  AddCommentToReview,
} = require('./reviews_and_comments.js')
const {
  LeaveRequest,
  LeaveRequestForSearch,
  CreateOrder,
} = require('./request_order.js')

ApiProductRouter.route('/get_product').get(GetProduct)
ApiProductRouter.route('/get_products_arr_by_full_info').post(
  GetProductsByFullInfo
)
ApiProductRouter.route('/get_products_arr_by_category').get(
  GetProductsByCategory
)
ApiProductRouter.route('/get_categories').get(GetCategories)
ApiProductRouter.route('/get_details_by_uuid').get(GetDetailsByUuid)
ApiProductRouter.route('/check_compatibility').post(CheckCompatibility)
ApiProductRouter.route('/get_reviews').get(GetReviews)
ApiProductRouter.route('/add_review').post(AddReview)
ApiProductRouter.route('/add_review_to_product').post(AddReviewToProduct)
ApiProductRouter.route('/add_comment_to_review').post(AddCommentToReview)
ApiProductRouter.route('/leave_check_request').post(LeaveRequest)
ApiProductRouter.route('/leave_search_request').post(LeaveRequestForSearch)
ApiProductRouter.route('/create_order').post(CreateOrder)

module.exports = ApiProductRouter
