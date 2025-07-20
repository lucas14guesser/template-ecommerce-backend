function roleMiddleWare(requiredRole) {
    return function (req, res, next) {
        if (!req.user || req.user.user_role !== requiredRole) {
            return res.status(403).json({ error: 'Acesso negado: Permissão insuficiente' });
        }
        next();
    }
}

module.exports = { roleMiddleWare }