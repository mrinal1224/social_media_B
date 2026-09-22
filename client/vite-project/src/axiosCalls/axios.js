// address - 8085
// cookies + credentials

import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: 'http://localhost:8085/',
    withCredentials: true
})
