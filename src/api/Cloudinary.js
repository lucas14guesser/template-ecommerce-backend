const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;

cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET, })

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
function getPublicIdFromUrl(url) {
  const parts = url.split('/');
  const uploadIndex = parts.indexOf('upload');
  const relevantParts = parts.slice(uploadIndex + 2);
  const file = relevantParts.pop();
  return `${relevantParts.join('/')}/${file.split('.')[0]}`;
}
async function deleteImage(publicId) {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Erro ao deletar imagem do Cloudinary', error);
        throw error;
    }
}

module.exports = { cloudinarySignature, getPublicIdFromUrl, deleteImage }