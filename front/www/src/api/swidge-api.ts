import axios from 'axios';
import HttpClient from './http-base-client';
import { indexedErrors } from './models/get-quote-error';
import GetQuoteRequest from './models/get-quote-request';
import GetQuoteResponse from './models/get-quote-response';
import { ApiErrorResponse } from "@/api/models/ApiErrorResponse";

class SwidgeAPI extends HttpClient {
    public constructor() {
        super(import.meta.env.VITE_APP_API_HOST);
    }

    public async getQuote(getQuotePayload: GetQuoteRequest): Promise<GetQuoteResponse> {
        try {
            const response = await this.instance.get('/path', { params: getQuotePayload });
            return response.data;
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const getQuoteErrorResponse = e.response?.data as ApiErrorResponse
                const errorMessage = indexedErrors[getQuoteErrorResponse.message] ?? 'Unhandled error!'
                throw new Error(errorMessage)
            }
            throw new Error('UnknowError no axios error')
        }
    }
}

// TODO: Let's see if worth it to expose just one instance of the API
export default new SwidgeAPI()
