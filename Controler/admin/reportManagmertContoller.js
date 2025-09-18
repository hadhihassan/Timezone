const PDFDocument = require('pdfkit');
const excelJs = require('exceljs');

//RENDER THE REPORT MANAGMENT PAGE
const loadReportManagemnt = async (req, res) => {
    try {
        const a = "Report";
        let data = 0
        let deliveredOrders
        let canceledOrders
        let returnedOrder
        let totalRevenue
        let starting
        let ending
        res.render("admin/Report", { data, deliveredOrders, canceledOrders, returnedOrder, totalRevenue, starting, a, ending })
    } catch (error) {

    }
}
//CALCULATE THE GIVEN DATE REPORT 
const calculateReport = async (req, res) => {
    try {
        const a = "Report";
        const { starting, ending } = req.body;
        const startDate = new Date(starting);
        startDate.setUTCHours(0, 0, 0, 0);
        const endDate = new Date(ending);
        endDate.setUTCHours(23, 59, 59, 999);

        req.session.startDate = startDate
        req.session.endingDate = endDate

        // Successfully delivered orders
        const deliveredOrdersPromise = Order.find({
            updatedAt: { $gte: startDate, $lte: endDate },
            orderCanceled: false,
            is_returned: false,
            returnRequest: 'Completed'
        }).populate("user").populate("products.product").populate('deliveryAddress').exec();
        // Canceled Orders
        const canceledOrdersPromise = Order.find({
            updatedAt: { $gte: startDate, $lte: endDate },
            orderCanceled: true
        }).populate("user").populate("products.product").populate('deliveryAddress').exec()
        // Returned Orders
        const returnedOrdersPromise = Order.find({
            updatedAt: { $gte: startDate, $lte: endDate },
            is_returned: true
        }).populate("user").populate("products.product").populate('deliveryAddress').exec()
        // Calculate total revenue for "Delivered" orders
        const totalRevenuePromise = Order.aggregate([
            {
                $match: {
                    updatedAt: { $gte: startDate, $lte: endDate },
                    orderCanceled: false,
                    is_returned: false,
                    returnRequest: 'Completed'
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' }
                }
            }
        ]).exec();
        // Handling promises
        Promise.all([deliveredOrdersPromise, canceledOrdersPromise, returnedOrdersPromise, totalRevenuePromise])
            .then(([deliveredOrders, canceledOrders, returnedOrders, totalRevenue]) => {
                // Here, you have the results for each type of order and total revenue
                let data = 1
                return res.render("admin/Report", {
                    a,
                    deliveredOrders,
                    canceledOrders,
                    returnedOrders,
                    totalRevenue,
                    data,
                    starting,
                    ending,
                })
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    } catch (error) {
        console.log(error.message);
    }
}
//DOWNLOAD THE REPORT INTO PDF
const reportDownload = async (req, res) => {
    try {
        const { totalRevenue, deliveredOrders, returnedOrders, canceledOrders, starting, ending } = req.body;

        // Create a PDF document
        const doc = new PDFDocument();

        // Set response headers to indicate a PDF file download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');

        // Pipe the PDF output to the response stream
        doc.pipe(res);

        // Add content to the PDF based on the form data
        doc.fontSize(20).text(`Report (${starting} to ${ending})`, 200, 50);
        doc.text(`Total Revenue: ${totalRevenue}`, 50, 100);
        doc.text(`Delivered Orders: ${deliveredOrders.length}`, 50, 150);
        doc.text(`Returned Orders: ${returnedOrders.length}`, 50, 200);
        doc.text(`Canceled Orders: ${canceledOrders.length}`, 50, 250);

        // Finalize the PDF and end the response
        doc.end();
    } catch (error) {
        console.log(error.message)
    }
}
const reportDownloadinExecle = async (req, res) => {
    try {
        let salesReport;
        if (req.session.startDate) {

            const startDate = req.session.startDate;
            const endDate = req.session.endingDate;

            const deliveredOrders = await Order.find({
                updatedAt: { $gte: startDate, $lte: endDate },
                orderCanceled: false,
                is_returned: false,
                returnRequest: 'Completed'
            }).populate("products.product").exec();

            const workbook = new excelJs.Workbook();
            const worksheet = workbook.addWorksheet('sales Report');

            worksheet.columns = [
                {
                    header: 'S no.',
                    key: 's_no',
                    width: 10,
                },
                { header: 'OrderID', key: '_id', width: 30 },
                { header: 'Date', key: 'orderDate', width: 20 },
                { header: 'Products', key: 'product_name', width: 30 },
                { header: 'Method', key: 'paymentOption', width: 10 },
                { header: 'Amount', key: 'totalAmount' },
            ];

            let counter = 1;

            deliveredOrders.forEach((product) => {

                product.s_no = counter;
                product.orderDate = product.orderDate
                product.paymentOption = product.paymentOption
                product.products.forEach((pro) => {
                    // Assuming 'product.product' is an object containing 'productName'
                    product.products.forEach((pro) => {
                        // Check if 'pro.product' exists and contains 'product_name' property
                        product.product_name = " "
                        if (pro.product && pro.product.product_name !== undefined) {
                            product.product_name += pro.product.product_name + ', ';
                        }
                    });
                });

                // product.product_name = product.product.product_name
                worksheet.addRow(product);
                counter++;
            });

            worksheet.getRow(1).eachCell((cell) => {
                cell.font = { bold: true };
            });
            
            res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.header('Content-Disposition', 'attachment; filename=report.xlsx');

            workbook.xlsx.write(res);
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    loadReportManagemnt, calculateReport, reportDownload, reportDownloadinExecle
}