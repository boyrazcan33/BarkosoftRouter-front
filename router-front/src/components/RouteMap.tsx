import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { RouteResponse } from '../types';
import './RouteMap.scss';

interface RouteMapProps {
    startLatitude: number;
    startLongitude: number;
    customers: Array<{ myId: number; latitude: number; longitude: number; }>;
    result: RouteResponse;
}

const RouteMap: React.FC<RouteMapProps> = ({ startLatitude, startLongitude, customers, result }) => {

    // Create customer lookup map
    const customerMap = new Map(customers.map(c => [c.myId, c]));

    // Build route coordinates in optimization order
    const routeCoordinates: [number, number][] = [];
    routeCoordinates.push([startLatitude, startLongitude]); // Start point

    result.optimizedCustomerIds.forEach(customerId => {
        const customer = customerMap.get(customerId);
        if (customer) {
            routeCoordinates.push([customer.latitude, customer.longitude]);
        }
    });

    // Calculate map bounds
    const allLatitudes = routeCoordinates.map(coord => coord[0]);
    const allLongitudes = routeCoordinates.map(coord => coord[1]);
    const bounds: [[number, number], [number, number]] = [
        [Math.min(...allLatitudes), Math.min(...allLongitudes)],
        [Math.max(...allLatitudes), Math.max(...allLongitudes)]
    ];

    return (
        <div className="route-map">
            <h3>Optimize Edilmiş Rota Haritası</h3>
            <MapContainer
                bounds={bounds}
                style={{ height: '500px', width: '100%' }}
                className="leaflet-container"
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Route line */}
                <Polyline
                    positions={routeCoordinates}
                    pathOptions={{ color: "#3388ff", weight: 4, opacity: 0.7 }}
                />

                {/* Start marker */}
                <Marker position={[startLatitude, startLongitude]}>
                    <Popup>
                        <strong>Başlangıç Noktası</strong><br />
                        Koordinat: {startLatitude.toFixed(6)}, {startLongitude.toFixed(6)}
                    </Popup>
                </Marker>

                {/* Customer markers */}
                {result.optimizedCustomerIds.map((customerId, index) => {
                    const customer = customerMap.get(customerId);
                    if (!customer) return null;

                    return (
                        <Marker
                            key={customerId}
                            position={[customer.latitude, customer.longitude]}
                        >
                            <Popup>
                                <strong>Müşteri {index + 1}</strong><br />
                                ID: {customer.myId}<br />
                                Koordinat: {customer.latitude.toFixed(6)}, {customer.longitude.toFixed(6)}
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default RouteMap;