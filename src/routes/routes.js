const express = require('express');
const router = express.Router();
const UserControllers = require('../controllers/UserControllers');
const ProdutoControllers = require('../controllers/ProdutoControllers');
const { authMiddleware } = require('../middlewares/AuthMiddleware');
const { roleMiddleWare } = require('../middlewares/RoleMiddleware');
const { cloudinarySignature } = require('../api/Cloudinary');

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

//PRODUTO ROUTES
//PUBLIC ROUTES
router.get('/produtos', ProdutoControllers.getAllProdutos);
//PRIVATE ROUTES
router.post('/cad-produto', authMiddleware, roleMiddleWare('admin'), ProdutoControllers.postProduto);

//API ROUTES
router.post('/cloudinary-signature', cloudinarySignature);

module.exports = router;