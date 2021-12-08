
const Product = require('../models/product')

const ErrorHandler = require('../utils/errorHandler')
//#create new product => /api/v1/product/new

const catchAsyncErrors = require('../middlewares/catchAsyncErrors')

const APIFeatures  = require('../utils/apiFeatures')

exports.newProduct = catchAsyncErrors(async (req, res, next) => {
	try{

	req.body.user = req.user.id;	
	
	const product = await Product.create(req.body);

 		res.status(201).json({
 			success: true,
 			product
 		})
	} catch(error){

		console.log(error)
	} 

 	
})

//# get all products => /api/v1/products
//async and await/ then chainblock to use comunicate between diffrent servers mongo and express 
exports.getProducts = catchAsyncErrors(async (req, res, next) => {
	
	const resPerPage =4;
	const productCount = await Product.countDocuments() 

	const apiFeatures = new APIFeatures(Product.find(), req.query)
						.search().filter().pagination(resPerPage).sort()

	const products = await apiFeatures.query;
	//await bcz data are coming from server 
	// const products = await Product.find();

	res.status(200).json({
		success: true,
		// count:  products.length,
		productCount,
		products
	})
})

// Get single product
exports.getSingleProduct = catchAsyncErrors(async (req, res, next) => {
	//await bcz data are coming from server 
	const productById = await Product.findById(req.params.id);


	if(!productById){

		return next(new ErrorHandler('Product Not Found', 404));
		// return res.status(404).json({success: false, message: 'Product Not Found'})
	}

	res.status(200).json({
		success: true,
		productById
	})
})
  
  //Update single product single

  exports.updateProduct =  catchAsyncErrors(async (req, res, next) => {

  		// here we can use let bcz we reassign the data or you can say update the data.  
  		let product = await Product.findById(req.params.id);

  		if(!product){
  			return res.status(404).json({
  				success:false,
  				message: 'Product Not Found'
  			})

  		}
  		// here we are using req.body bcz we pass new data and use {} obj  
  		product = await Product.findByIdAndUpdate(req.params.id, req.body, {
  			new: true,
  			runValidators: true,
  			useFindAndModify: false

  		});

  			res.status(200).json({
  				success: true,
  				product

  			})

  })


  //Delete Products  = /api/v1/admin/product/:id

  exports.deleteProduct = async (req, res, next) => {

	const product = await Product.findById(req.params.id);

		if(!product){

			return res.status(404).json({
				success: false,
				message: 'Product Not Found'
			})

	}

	await product.remove();

	res.status(200).json({
		success: true,
		message: 'Product is Successfully Deleted'
	})

  }



exports.createProductReview = catchAsyncErrors(async (req, res, next) => {


	const { rating, comment, productId } = req.body;

	const review = {

		user: req.user._id,
		name: req.user.name,
		rating: Number(rating),
		comment
	}

const product =  await Product.findById(productId);

const isReviewed = product.reviews.find( r => r.user.toString() === req.user._id.toString())



if (isReviewed) {
        product.reviews.forEach(review => {
            if (review.user.toString() === req.user._id.toString()) {
                review.comment = comment;
                review.rating = rating;
            }
        })

    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length
    }

    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true
    })

})

      // Get Product Reviews   =>   /api/v1/reviews
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.id);

    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
})

// Delete Product Review   =>   /api/v1/reviews
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {

    const product = await Product.findById(req.query.productId);

    console.log(product);

    const reviews = product.reviews.filter(review => review._id.toString() !== req.query.id.toString());

    const numOfReviews = reviews.length;

    const ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numOfReviews
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true
       
    })
})