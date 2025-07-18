// Updated types for new JSON structure
export interface Customer {
    myId: number;
    latitude: number;
    longitude: number;
}

export interface RouteRequest {
    startLatitude: number;
    startLongitude: number;
    customers: Customer[];
}

export interface RouteResponse {
    optimizedCustomerIds: number[];
    totalDistance: string;
    status: string;
}