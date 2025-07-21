const crypto = require('crypto');

function cloudinarySignature(req, res) {
    const { timestamp, folder } = req.body;

    if (!timestamp || !folder || !process.env.CLOUDINARY_API_SECRET) {
        return res.status(400).json({ error: 'Parâmetros inválidos ou segredo não definido' });
    }

    const paramsToSign = { timestamp, folder, upload_preset: 'ecommerce_signed' };
    const queryString = Object.keys(paramsToSign).sort().map(key => `${key}=${paramsToSign[key]}`).join('&');
    const signature = crypto.createHash('sha1').update(queryString + process.env.CLOUDINARY_API_SECRET).digest('hex');

    return res.json({ signature, timestamp, apiKey: process.env.CLOUDINARY_API_KEY });
}

module.exports = { cloudinarySignature }