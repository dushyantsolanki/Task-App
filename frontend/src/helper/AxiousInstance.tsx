import axios from 'axios';
import CryptoJS from 'crypto-js';

function decryptResponse(encryptedData: string, iv: string) {
  const decrypted = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY, {
    iv: CryptoJS.enc.Base64.parse(iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
}


const SECRET_KEY = CryptoJS.SHA256("158XWQ@&bdhsVVSMKZALI__ANDG%$_Vdtwyx");
const AxiousInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://task-mate-full-stack.onrender.com/api/v1',
  withCredentials: true, // har request ke sath cookies jayengi
});

let isRefreshing = false;
let requestQueue: {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}[] = [];

const processQueue = (error: any) => {
  requestQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(null);
  });
  requestQueue = [];
};

AxiousInstance.interceptors.response.use(
  (response) => {
    // Decrypt if response contains encryptedData + iv
    // if (response.data?.encryptedData && response.data?.iv) {
    //   response.data = decryptResponse(
    //     response.data.encryptedData,
    //     response.data.iv
    //   );
    // }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          requestQueue.push({
            resolve: () => resolve(AxiousInstance(originalRequest)),
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        await axios.post(`${AxiousInstance.defaults.baseURL}/auth/refresh-token`, null, {
          withCredentials: true,
        });

        processQueue(null);

        // retry the original request
        return AxiousInstance(originalRequest);
      } catch (err) {
        processQueue(err);

        if (error.response && error.response.status === 401) {
          localStorage.clear();
          window.location.href = '/login';
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default AxiousInstance;
