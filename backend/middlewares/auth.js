const User             = require('../models/user');
const jwt              = require("jsonwebtoken");
const ErrorHandler     = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");

//check if user is authenticated or not 
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {

	const { token } = req.cookies

	if(!token){

		return next(new ErrorHandler('Login first to access this resources.', 401))
	}

	const decoded = jwt.verify(token, process.env.JWT_SECRET)
	req.user = await User.findById(decoded.id);

	next()
	console.log(token);
	console.log(req.user);


})

//User Roles 
exports.authorizeRoles = (...roles) => {

	return (req, res, next) => {

		if(!roles.includes(req.user.role))
		{

		 return next(new ErrorHandler(`Role (${req.user.role}) is not allowed to access this resouce`, 403))
		
		}

		next()
	}
}