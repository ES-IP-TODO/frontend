let HOST, BASE_URL, WS_SCHEME;

const scheme = {
    HTTP: "http://",
    HTTPS: "https://",
};

HOST = 'es-ua.ddns.net';
BASE_URL = `${scheme.HTTPS}${HOST}`;

const config = {
    PRODUCTION: import.meta.env.PROD,
    HOST,
    BASE_URL,
    API_USER_URL: `${BASE_URL}/api/auth`,
    API_TASK_URL: `${BASE_URL}/api/tasks`,
};
export default config;