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
router.get('/produto/:id', ProdutoControllers.getProdutoById);

//PRIVATE ROUTES
router.post('/cad-produto', authMiddleware, roleMiddleWare('admin'), ProdutoControllers.postProduto);
router.post('/offer-produto/:id', authMiddleware, roleMiddleWare('admin'), ProdutoControllers.postOffer);
router.delete('/del-produto/:id', authMiddleware, roleMiddleWare('admin'), ProdutoControllers.deleteProduto);
router.delete('/ret-oferta/:id', authMiddleware, roleMiddleWare('admin'), ProdutoControllers.retirarOferta);
router.put('/edit-produto/:id', authMiddleware, roleMiddleWare('admin'), ProdutoControllers.editProdutoById);

//API ROUTES
router.post('/cloudinary-signature', cloudinarySignature);

module.exports = router;