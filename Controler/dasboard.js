const express = require("express")
const Customer = require('../Models/customerModel')
const productCategry = require("../Models/productCategory")
const Product = require("../Models/productModel")
const Order = require("../Models/orderModel")






// CALCULATING THE DALY INCOME
const DailyIncome = async (req, res) => {
    try {
        // Get the current date in the user's timezone
        const currentDate = new Date();

        // Extract year, month, and day
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1; // Months are 0-indexed
        const day = currentDate.getDate();

        // Create a formatted date string in "YYYY-MM-DD" format
        const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

        // Define the start and end of the current day
        const startDate = new Date(`${formattedDate}T00:00:00`);
        const endOfDay = new Date(`${formattedDate}T23:59:59.999`);

        // Your MongoDB aggregation pipeline
        const pipeline = [
            {
                $match: {
                    orderDate: {
                        $gte: startDate,
                        $lte: endOfDay
                    },
                    returnRequest: 'Completed'
                }
            },
            {
                $group: {
                    _id: null,
                    dailyRevenue: { $sum: '$totalAmount' }
                }
            },
            {
                $project: {
                    _id: 0,
                    dailyRevenue: 1
                }
            }
        ];

        // Assuming you have a model named Order
        const result = await Order.aggregate(pipeline);

        return result

        // Send the result as a JSON response
        // res.json({ dailyRevenue: result[0]?.dailyRevenue || 0 });
    } catch (error) {
        console.error(error.message);
        // res.status(500).json({ error: 'An error occurred' });
    }
};
//CALCULATING THE MONTHLY INCOME 
const MonthlyIncome = async (req, res) => {
    try {
        const currentDate = new Date()
        //supperating the year and month
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth() + 1 //month index stating at 0 

        const formattedDate = `${year}-${month.toString().padStart(2, '0')}`; //create the actual format year/month/day

        const startDate = new Date(`${formattedDate}-01T00:00:00`);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

        const pipeline = [
            {
                $match: {
                    orderDate: {
                        $gte: startDate,
                        $lte: endOfMonth
                    },
                    returnRequest: 'Completed'
                }
            },
            {
                $group: {
                    _id: null,
                    monthlyRevenue: { $sum: '$totalAmount' }
                }
            },
            {
                $project: {
                    _id: 0,
                    monthlyRevenue: 1
                }
            }
        ];

        // SEARCHING THE DATA
        const result = await Order.aggregate(pipeline);

        return result


    } catch (error) {
        console.log("error.message")
    }
}
//CALICULATING THE YEARLY INCOME
const YearlyIncome = async (req, res) => {
    try {
        const currentDate = new Date()

        const year = currentDate.getFullYear()

        const startDate = new Date(`${year}-01-01T00:00:00`);
        const endOfYear = new Date(`${year}-12-31T23:59:59.999`);

        const pipeline = [
            {
                $match: {
                    orderDate: {
                        $gte: startDate,
                        $lte: endOfYear
                    },
                    returnRequest: 'Completed'
                }
            },
            {
                $group: {
                    _id: null,
                    yearlyIncome: { $sum: '$totalAmount' }
                }
            },
            {
                $project: {
                    _id: 0,
                    yearlyIncome: 1
                }
            }
        ];


        const result = await Order.aggregate(pipeline);
        return result
    } catch (error) {

        console.log(error.message);
    }

}
//EVERY MONTH INCOME
const everyMonthIncome = async (req, res) => {
    try {
        const currentDate = new Date();
        const year = currentDate.getFullYear();

        const startDate = new Date(`${year}-01-01T00:00:00`);
        const endOfYear = new Date(`${year}-12-31T23:59:59.999`);

        const pipeline = [
            {
                $match: {
                    orderDate: {
                        $gte: startDate,
                        $lte: endOfYear
                    },
                    returnRequest: 'Completed'
                }
            },
            {
                $group: {
                    _id: { $month: '$orderDate' },
                    monthlyIncome: { $sum: '$totalAmount' }
                }
            },
            {
                $project: {
                    _id: 1,
                    month: '$_id',
                    monthlyIncome: 1
                }
            }
        ];

        const result = await Order.aggregate(pipeline);
        return result
    } catch (error) {
        console.error(error.message);
        // res.status(500).json({ error: 'An error occurred' });
    }
}

//finding the best 5 selling products
const findBestSellingProducts = async (req, res) => {
    try {
        const pipeline = [
            {
                $match: {
                    returnRequest: "Completed",
                }
            },
            {
                $unwind: "$products"
            },
            {
                $group: {
                    _id: "$products.product",
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "products", // Replace with the actual name of the products collection
                    localField: "_id",
                    foreignField: "_id",
                    as: "product"
                }
            },
            {
                $unwind: "$product"
            },
            {
                $project: {
                    _id: 1,
                    name: "$product.product_name", // Assuming product_name is a field in the products collection
                    count: 1
                }
            }
        ];
        
        const result = await Order.aggregate(pipeline);
        return result
   
    } catch (error) {
        console.log(error.message);
    }
}
//loadDashboaed
const loadDash = async (req, res) => {
    try {
        const pipeline = [
            {
                $match: {

                    returnRequest: 'Completed'
                }
            },
            {
                $group: {
                    _id: null,
                    lifeTimeRevenue: { $sum: '$totalAmount' }
                }
            },
            {
                $project: {
                    _id: 0,
                    lifeTimeRevenue: 1
                }

            }
        ];
        const paymentOptionsPipeline = [
            {
                $match: {
                    returnRequest: "Completed"
                }
            },
            {
                $group: {
                    _id: "$paymentOption",
                    count: {
                        $sum: 1
                    },
                    totalAmount: {
                        $sum: "$totalAmount"
                    }
                }
            }
        ];

        const outofstock = await Product.find({ stock_count: { $lt: 0 } });

        console.log(outofstock);
        const allMonths = await everyMonthIncome()
        const alltime = await Order.aggregate(pipeline);
        const DailyI = await DailyIncome()
        const MonthlyI = await MonthlyIncome()
        const yearlyI = await YearlyIncome()
        const bestProducts = await findBestSellingProducts()
        //FINDING THE PENDING ORDERS
        const PendingOrders = await Order.find({ returnRequest: "Pending", orderCanceled: false }).populate("user")
        const paymentoptins = await Order.aggregate(paymentOptionsPipeline)
        //FINDING THE BLOCKED USERD
        const blockUsers = await Customer.find({ is_block: true })
        const allUsers = await Customer.find()    
        console.log(allMonths)
        res.render("admin/index", {
            daily: DailyI,
            monthly: MonthlyI,
            yearly: yearlyI,
            lifeTime: alltime,
            orders: PendingOrders,
            BlockedUsers: blockUsers,
            paymentoptins,
            allMonths,
            bestProducts,
            allUsers,
            outofstock
        })

    } catch (error) {
        console.log(error.message);
    }
}



module.exports = {
    loadDash
}