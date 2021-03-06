const express = require("express");

const Product = require("../models/Product.js");
const User = require("../models/User.js");

const middleware = require("../middleware");

const router = express.Router({mergeParams: true}); 

//Index

router.get("/", middleware.isLoggedIn,
    (req, res) =>
    {
        User.findById(req.params.id).populate({path: "cart.product"}).exec(
            (err, user) =>
            {
                if(err)
                {
                    console.log(err);
                }
                else
                {
                    res.render("user/cart", {cart: user.cart});
                }
            }
        );	
    }
)

//Create 

router.post("/products/:product_id", middleware.isLoggedIn,  
	(req, res) =>
	{
        const quantity = req.body.quantity;
        Product.findById(req.params.product_id,
			(err, foundProduct) =>
			{
				if(err)
				{
					console.log(err);
				}
				else
				{
					User.findById(req.params.id,
                        (err, user) =>
                        {
                            if(err)
                            {
                                console.log(err);
                            }
                            else
                            {
                                let index = -1;
                                for(let i = 0; i < user.cart.length; i++)
                                {
                                    const {product} = user.cart[i];
                                    if(product.equals(foundProduct._id))
                                    {
                                        index = i;
                                    }
                                }
                                if(index >= 0)
                                {
                                    user.cart[index].quantity += 1;
                                }
                                else
                                {
                                    const newItem = {quantity: quantity, product: foundProduct._id};
                                    user.cart.push(newItem);
                                }
                                user.save();
                                res.redirect(`/users/${req.params.id}/cart`);
                            }
                        }
                    );	
				}
			}
		);
	}
)

//Update 

router.put("/products/:product_id", middleware.isLoggedIn,
	(req, res) =>
	{
        const quantity = req.body.quantity;
        Product.findById(req.params.product_id,
			(err, product) =>
			{
				if(err)
				{
					console.log(err);
				}
				else
				{
					User.findById(req.params.id,
                        (err, user) =>
                        {
                            if(err)
                            {
                                console.log(err);
                            }
                            else
                            {
                                let index = -1;
                                for(let i = 0; i < user.cart.length; i++)
                                {
                                    const {product} = user.cart[i];
                                    if(product.equals(foundProduct._id))
                                    {
                                        index = i;
                                    }
                                }
                                if(index >= 0)
                                {
                                    user.cart[index].quantity = quantity;
                                }
                                user.save();
                                res.redirect(`/users/${req.params.id}/cart`);
                            }
                        }
                    );	
				}
			}
		);
	}
)

//Destroy 

router.delete("/products/:product_id", middleware.isLoggedIn,
    (req,res) =>
    {
        User.findById(req.params.id,
            (err,user) =>
            {
                if(err)
                {
                    res.send("Error");
                }
                else
                {
                    Product.findById(req.params.product_id,
                        (err,foundProduct) =>
                        {
                            middleware.delete(user, "cart", foundProduct);
                            res.redirect(`/users/${req.params.id}/cart`);
                        }
                    )
                }
            }   
        );
    }
)

//Checkout

router.post("/checkout", middleware.isLoggedIn,
    (req, res) =>
    {
        User.findById(req.params.id).populate({path: "cart.product"}).exec(
            (err,user) =>
            {
                if(err)
                {
                    res.send("Error");
                }
                else
                {
                    const order = user.cart.slice();
                    for(let i = 0; i < user.cart.length; i++)
                    {
                        user.cart.pop();
                    }
                    user.save();
                    res.render("user/checkout", {order: order});
                }
            }   
        );
    }
)

//Authorization function

// const isAuthorized = (req, res, next) =>
// {
// 	if(req.isAuthenticated())
// 	{
// 		review.findById(req.params.review_id,
// 			function(err, foundreview)
// 			{
// 				if(err)
// 				{
// 					res.redirect("back");
// 				}
// 				else
// 				{
// 					if(foundreview.author.id.equals(req.user.id))
// 					{
// 						return next();
// 					}
// 					else
// 					{
// 						res.redirect("back");
// 					}
// 				}
// 			}
// 		)
// 	}
// 	else
// 	{
// 		res.redirect("back");
// 	}
// }

module.exports = router;