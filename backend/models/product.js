const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({

	name:{
		type: String,
		required: [true, 'please enter product name'],
		trim: true,
		maxLength: [100, 'product name cannot exceed 100 characters']
	},

	price:{
		type: String,
		required: [true, 'please enter product price'],
		maxLength: [8, 'product name cannot exceed 8 characters']
	},

	description:{
		type: String,
		required: [true, 'please enter product description'],
		
	},

	ratings: {
		type:Number,
		default: 0
	},

	images: [
		{
			public_id: {

				type:String,
				required:true
			},
			url: {
				type: String,
				required:true
			},
		}
	],

	category: {
		type: String,
		required: [true, 'please enter the category product'],
		enum: {
			values:[
				'Electronics', 
				'Cameras', 
				'Laptops', 
				'Accessories',
				'Headphones',
				'Food', 
				'Books', 
				'Clothes/Shoes', 
				'Beauty/Health', 
				'Sports', 
				'Outdoor',
				'Home'
			],
			message: 'please select correct categories'
		}
	},

	seller: {
		type: String,
		required: [true, 'please enter product sellers']
	},

	stock:{

		type: Number,
		required: [true, 'please enter product stock'],
		maxLength:[5, 'product name cannot exceed 5 characters'],
		default: 0
	},

	numofReviews: {
		type:Number,
		default: 0
	},

	reviews: [
		{	
			user: {

				type: mongoose.Schema.ObjectId,
				ref: 'User',
				required: true
			},
			
			name: {
				type:String,
				required: true
			},

			rating: {
				type:Number,
				required: true
			},

			comment: {
				type: String,
				required: true
			}

		}
	],



	createdAt: {
		type: Date,
		default: Date.now
	}

}) 


//module.export is originaly structered like----> { export: {object}}<---outside curly braces are module obj 

module.exports = mongoose.model('product', productSchema);