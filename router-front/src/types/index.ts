// Customer structure
export interface Customer {
    myId: number;
    latitude: number;
    longitude: number;
}

// Input JSON structure that will be uploaded
export interface RouteRequest {
    startLatitude: number;
    startLongitude: number;
    customers: Customer[];
}

// Backend API response structure with geometry
export interface RouteResponse {
    optimizedCustomerIds: number[];
    totalDistance: string;
    status: string;
    routeGeometry?: number[][]; // [longitude, latitude] pairs for the route path
    customerGeometryMapping?: Record<number, [number, number]>; // Maps customer ID to [startIndex, endIndex] in routeGeometry
}

// Component state types
export interface AppState {
    isLoading: boolean;
    error: string | null;
    result: RouteResponse | null;
    uploadedData: RouteRequest | null;
}