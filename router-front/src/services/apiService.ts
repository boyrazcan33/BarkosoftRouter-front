import axios from 'axios';
import { RouteRequest, RouteResponse } from '../types';

// Configure base URL for your Spring Boot backend
const API_BASE_URL = 'https://barko-router.onnoto.com/api';
// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 300000, // 300 seconds timeout
});

// API service for route optimization
export const routeService = {
    // Call the optimize route endpoint
    optimizeRoute: async (request: RouteRequest): Promise<RouteResponse> => {
        try {
            const response = await apiClient.post<RouteResponse>('/route/optimize', request);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                // Return localized error message
                throw new Error(`API Error: ${error.response?.data?.message || error.message}`);
            }
            throw new Error('An unexpected error occurred');
        }
    }
};