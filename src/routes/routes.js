const express = require('express');
const router = express.Router();
const UserControllers = require('../controllers/UserControllers');
const { authMiddleware } = require('../middlewares/AuthMiddleware');
const { roleMiddleWare } = require('../middlewares/RoleMiddleware');

// MAIN ROUTE
router.get('/', (req, res) => {
    res.send("BACKEND ECOMMERCE WEBSITE");
})

// USER ROUTES
//PUBLIC ROUTES
router.post('/login', UserControllers.loginUser);
router.post('/cadastro', UserControllers.postUser);

//PRIVATE ROUTES
router.get('/user/:id', authMiddleware, UserControllers.getUserByID);
router.get('/users', authMiddleware, roleMiddleWare('admin'), UserControllers.getAllUser);
router.put('/user/:id', authMiddleware, UserControllers.editUser);

module.exports = router;