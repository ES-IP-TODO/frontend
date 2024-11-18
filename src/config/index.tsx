let HOST, BASE_URL, WS_SCHEME;
const scheme = {
    HTTP: 'http://',
    HTTPS: 'https://',
};
if (import.meta.env.PROD) {
    HOST = 'load-balancer-iap-690512408.eu-north-1.elb.amazonaws.com:444';
    BASE_URL = `${scheme.HTTPS}${HOST}`;
} else {
    HOST = 'localhost';
    BASE_URL = `${scheme.HTTP}${HOST}:8000`;
}
const config = {
    PRODUCTION: import.meta.env.PROD,
    HOST,
    BASE_URL,
    API_USER_URL: `${BASE_URL}/auth`,
    API_TASK_URL: `${BASE_URL}/tasks`,
};
export default config;