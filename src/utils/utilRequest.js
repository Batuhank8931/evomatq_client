import axios from "axios";

// Runtime config yükleme
let configCache = null;
async function loadConfig() {
    if (!configCache) {
        try {
            const res = await fetch("/config.json");
            if (!res.ok) throw new Error(`Config fetch failed: ${res.status}`);
            configCache = await res.json();
        } catch (err) {
            console.error("Config yüklenemedi:", err);
            configCache = { API_HOST: "127.0.0.1", API_PORT: 5173 }; // fallback
        }
    }
    return configCache;
}

// Base URL ve Auth URL dinamik
async function getUrls() {
    const config = await loadConfig();
    const baseUrl = `http://${config.API_HOST}:${config.API_PORT}/api/`;
    const AuthUrl = `http://${config.API_HOST}:${config.API_PORT}/auth/`;
    return { baseUrl, AuthUrl };
}

//const baseUrl = " http://192.168.1.37:3008/api/"
//const AuthUrl = " http://192.168.1.37:3008/auth/"

// Headers
async function headersLogin() {
    return {
        "Content-Type": "application/json",
        Accept: "*/*",
    };
}

async function headersAuth() {
    const token = localStorage.getItem("authToken");
    return {
        "Content-Type": "application/json",
        Accept: "*/*",
        Authorization: `Bearer ${token}`,
    };
}

// Axios wrapper
const API = {

    login: async (body) => {
        const { AuthUrl } = await getUrls();
        return axios.post(`${AuthUrl}login`, body, { headers: await headersLogin() });
    },

    dashboard_data: async () => {
        const { baseUrl } = await getUrls();
        return axios.get(`${baseUrl}dashboard_data`, { headers: await headersAuth() });
    },

    rack_data: async () => {
        const { baseUrl } = await getUrls();
        return axios.get(`${baseUrl}rack_data`, { headers: await headersAuth() });
    },

    create_rack: async (body) => {
        const { baseUrl } = await getUrls();
        return axios.post(`${baseUrl}rack_data`, body, { headers: await headersAuth() });
    },

    update_rack: async (id, body) => {
        const { baseUrl } = await getUrls();
        return axios.put(`${baseUrl}rack_data/${id}`, body, { headers: await headersAuth() });
    },

    delete_rack: async (id) => {
        const { baseUrl } = await getUrls();
        return axios.delete(`${baseUrl}rack_data/${id}`, { headers: await headersAuth() });
    },

    get_flash_light: async (body) => {
        const { baseUrl } = await getUrls();
        return axios.post(`${baseUrl}get_flash_light`, body, { headers: await headersAuth() });
    },

    get_mail_settings: async () => {
        const { baseUrl } = await getUrls();
        return axios.get(`${baseUrl}mail_settings`, { headers: await headersAuth() });
    },

    update_mail_settings: async (body) => {
        const { baseUrl } = await getUrls();
        return axios.put(`${baseUrl}mail_settings`, body, { headers: await headersAuth() });
    },

    get_password_settings: async () => {
        const { baseUrl } = await getUrls();
        return axios.get(`${baseUrl}password_settings`, { headers: await headersAuth() });
    },

    update_password_settings: async (body) => {
        const { baseUrl } = await getUrls();
        return axios.put(`${baseUrl}password_settings`, body, { headers: await headersAuth() });
    },

    add_new_user: async (body) => {
        const { baseUrl } = await getUrls();
        return axios.post(`${baseUrl}add_new_user`, body, { headers: await headersAuth() });
    },

    product_detail: async (body) => {
        const { baseUrl } = await getUrls();
        return axios.post(`${baseUrl}product_detail`, body, { headers: await headersAuth() });
    },

    post_requests: async (body) => {
        const { baseUrl } = await getUrls();
        return axios.post(`${baseUrl}requests`, body, { headers: await headersAuth() });
    },

    get_requests: async () => {
        const { baseUrl } = await getUrls();
        return axios.get(`${baseUrl}requests`, { headers: await headersAuth() });
    },

    get_active_requests: async () => {
        const { baseUrl } = await getUrls();
        return axios.get(`${baseUrl}getactivereqeusts`, { headers: await headersAuth() });
    },

    delete_request: async (adding_number) => {
        const { baseUrl } = await getUrls();
        return axios.delete(`${baseUrl}requests/${adding_number}`, { headers: await headersAuth() });
    },

    update_request: async (adding_number, body) => {
        const { baseUrl } = await getUrls();
        return axios.put(`${baseUrl}requests/${adding_number}`, body, { headers: await headersAuth() });
    },


    update_request_quantity: async (adding_number, product_code, id, body) => {
        const { baseUrl } = await getUrls();
        return axios.put(`${baseUrl}updaterequestquantity/${adding_number}/${product_code}/${id}`, body, { headers: await headersAuth() });
    },

    update_request_item: async (adding_number, product_code, id, body) => {
        const { baseUrl } = await getUrls();
        return axios.put(`${baseUrl}updaterequests/${adding_number}/${product_code}/${id}`, body, { headers: await headersAuth() });
    },

    get_reviewers: async () => {
        const { baseUrl } = await getUrls();
        return axios.get(`${baseUrl}getreviewers`, { headers: await headersAuth() });
    },

    delete_user: async (user_id) => {
        const { baseUrl } = await getUrls();
        return axios.delete(`${baseUrl}deleteuser/${user_id}`, { headers: await headersAuth() });
    },
};

export default API;
