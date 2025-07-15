const express = require('express');
const router = express.Router();
const UserControllers = require('../controllers/UserControllers');

// MAIN ROUTE
router.get('/', (req, res) => {
    res.send("BACKEND ECOMMERCE WEBSITE");
})

// USER ROUTES
router.get('/users', UserControllers.getAllUser);
router.get('/user/:id', UserControllers.getUserByID);
router.post('/user', UserControllers.postUser);

module.exports = router;