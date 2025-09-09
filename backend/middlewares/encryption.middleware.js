import { encrypt } from '../utils/utils.js';

export function encryptResponse(req, res, next) {
  const originalJson = res.json;
  res.json = function (data) {
    const text = JSON.stringify(data);
    const { encryptedData, iv } = encrypt(text);
    return originalJson.call(this, { encryptedData, iv });
  };
  next();
}
