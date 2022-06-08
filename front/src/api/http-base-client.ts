import axios, { AxiosInstance, AxiosRequestHeaders } from 'axios';

export default abstract class HttpClient {
    protected readonly instance: AxiosInstance;

    public constructor(baseURL: string, headers?: AxiosRequestHeaders) {
        this.instance = axios.create({
            baseURL,
            headers
        });
    }
}

