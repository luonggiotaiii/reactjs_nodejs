var express = require('express');
var router = express.Router();
const ordersController = require("../controllers/orders.controller");

router.get('/', ordersController.getAll);
router.post('/orders', ordersController.createOrder);
router.put('/status/:id', ordersController.updateStatus);
router.get('/pending', ordersController.getPending);
router.get('/non-pending', ordersController.getNonPending);

module.exports = router;
