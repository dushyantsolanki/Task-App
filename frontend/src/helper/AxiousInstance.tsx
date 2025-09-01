import axios from "axios";

const AxiousInstance = axios.create({
    baseURL:
        import.meta.env.VITE_API_BASE_URL ||
        "https://task-mate-full-stack.onrender.com/api/v1",
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
    (response) => response,
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
                await axios.post(
                    `${AxiousInstance.defaults.baseURL}/auth/refresh-token`,
                    null,
                    { withCredentials: true }
                );

                processQueue(null);

                // retry the original request
                return AxiousInstance(originalRequest);
            } catch (err) {
                processQueue(err);
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default AxiousInstance;
