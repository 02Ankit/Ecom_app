const User = require('../models/user');
const ErrorHandler =require('../utils/errorHandler');
const catchAsyncError = require('../middlewares/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const cloudinary = require('cloudinary');

// Register a user   => /api/v1/register
exports.registerUser = catchAsyncError(async (req, res, next) => {
	const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
	  folder: "avatars",
	  width: 150,
	  crop: "scale",
	});
  
	const { name, email, password } = req.body;
  
	const user = await User.create({
	  name,
	  email,
	  password,
	  avatar: {
		public_id: result.public_id,
		url: result.secure_url,
	  }
	 
	});

  // const token = user.getjwtToken();
	
	// res.status(201).json({
	// 	success: true,
	// 	token
	// })
	
	sendToken(user, 200, res);
  });

	



//login User => /api/v1/login

exports.loginUser = catchAsyncError( async(req, res, next) => {

const { email, password } = req.body;

if(!email || !password){
   
   return next(new ErrorHandler('Please enter email & password', 400))
}

//Finding  userDetail in database 

const userDetail = await User.findOne({ email }).select('+password')

	if(!userDetail){
		return next(new ErrorHandler("Invalid Email or Password1", 401))//401 is use for UnAuthorized request. 
	}

 	// Check if password is correct or not or

 	const isPasswordMatched = await userDetail.comparePassword(password); 

 	if(!isPasswordMatched)
 	{
 		return next(new ErrorHandler('Invalid Email or Password2', 401));
 	}


	sendToken(userDetail, 200, res);

 	// const token = userDetail.getjwtToken();

 	// res.status(200).json({

 	// 	success: true,
 	// 	token
 	// })
})




//Forgot password Password2

exports.forgotPassword = catchAsyncError(async (req, res, next) => {

    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler('User not found with this email', 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset password url
	// req.protocol}://${req.get('host')}
    const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

    const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`

    try {

        await sendEmail({
            email: user.email,
            subject: 'ShopIT Password Recovery',
            message
        })

        res.status(200).json({
            success: true,
            message: `Email sent to: ${user.email}`
        })

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(error.message, 500))
    }

})



//Reset password => /api/v1/resetpassword
exports.resetPassword = catchAsyncError(async (req, res, next) => {
console.log(req.params.token);
    // Hash URL token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
   // const resetPasswordToken = req.params.token
console.log(resetPasswordToken);

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }

    })
console.log(user);

    if (!user) {
        return next(new ErrorHandler('Password reset token is invalid or has been expired', 400))
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler('Password does not match', 400))
    }

    // Setup new password
    user.password = req.body.password;
    console.log(user);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();

    sendToken(user, 200, res)

})

// Get Currently logged in user details => /api/v1/my_profile

exports.getUserProfile =  catchAsyncError( async (req, res, next) => {

 
const user = await User.findById(req.user.id)


res.status(200).json({

	success: true,
	user
})


})

//Update / Change password => /api/v1/password/update

exports.updatePassword = catchAsyncError( async (req, res, next) => {

const user =  await User.findById(req.user.id).select('+password');

const isMatched = await user.comparePassword(req.body.oldPassword)

	if(!isMatched){ return next(new ErrorHandler('Old Password is Wrong Please Type Correct Old Password', 400))}

	user.password = req.body.password;

	await user.save();

	sendToken(user, 200, res)

})
// Update user profile => /api/v1/my_profile/update

exports.updateProfile =  catchAsyncError( async (req, res, next) => {

	const newUserData = {name: req.body.name, email: req.body.email}

    // Update avatar
    if (req.body.avatar !== '') {
        const user = await User.findById(req.user.id)

        const image_id = user.avatar.public_id;
        const res = await cloudinary.v2.uploader.destroy(image_id);

        const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: 'avatars',
            width: 150,
            crop: "scale"
        })

        newUserData.avatar = {
            public_id: result.public_id,
            url: result.secure_url
        }
    }


	const user = await User.findByIdAndUpdate(req.user.id, newUserData, {	

			new:true, 
			runValidators: true,
			useFindAndModify: false
		})
	res.status(200).json({
		success: true,
		user
	})

})


exports.updateUser =  catchAsyncError( async (req, res, next) => {

	const newUserData = {name: req.body.name, email: req.body.email, role: req.body.role}

	//update avatar:TODO

	const user = await User.findByIdAndUpdate(req.user.id, newUserData, {	

			new:true, 
			runValidators: true,
			useFindAndModify: false
		})
	res.status(200).json({
		success: true,
		user
	})

})

// Get All Users and Specific Users

exports.allUsers = catchAsyncError( async (req, res, next) => {

	const users = await User.find();
	res.status(200).json({
		success:true,
		users
	})
})

//Get user detail => /api/v1/admin/user/:id

exports.getUserDetails = catchAsyncError( async (req, res, next) => {

	const user = await User.findById(req.params.id);

	if(!user){

		return next(new ErrorHandler(`does not found with id: ${req.params.id}`))
	}

	res.status(200).json({
		success: true,
		user
	})


})

// Delete user => /api/v1/admin/user/:id
exports.deleteUser = catchAsyncError( async (req, res, next) => {

	const user = await User.findById(req.params.id);

	if(!user){

		return next(new ErrorHandler(`does not found with id: ${req.params.id}`))
	}

	await user.remove();
	
	res.status(200).json({
		success: true,
		user
	})

})


//Logout User => /api/v1/logout

exports.logout =  catchAsyncError( async (req, res, next) => {

	res.cookie('token', null, {expires: new Date(Date.now()), 
				httpOnly: true
	})

	res.status(200).json({
		success: true,
		message: 'Logged Out'
	})
})
