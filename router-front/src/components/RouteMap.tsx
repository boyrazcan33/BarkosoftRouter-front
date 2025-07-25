import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { RouteResponse } from '../types';
import './RouteMap.scss';

// Fix default markers and create numbered icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface RouteMapProps {
    startLatitude: number;
    startLongitude: number;
    customers: Array<{ myId: number; latitude: number; longitude: number; }>;
    result: RouteResponse;
}

const RouteMap: React.FC<RouteMapProps> = ({ startLatitude, startLongitude, customers, result }) => {
    const [visibleCount, setVisibleCount] = useState(20);
    const LOAD_MORE_COUNT = 20;

    // Create customer lookup map
    const customerMap = new Map(customers.map(c => [c.myId, c]));

    // Get visible customers based on current count
    const visibleCustomerIds = result.optimizedCustomerIds.slice(0, visibleCount);
    const hasMore = visibleCount < result.optimizedCustomerIds.length;

    // Build route coordinates for visible customers only
    const routeCoordinates: [number, number][] = [];
    routeCoordinates.push([startLatitude, startLongitude]); // Start point

    visibleCustomerIds.forEach(customerId => {
        const customer = customerMap.get(customerId);
        if (customer) {
            routeCoordinates.push([customer.latitude, customer.longitude]);
        }
    });

    // Calculate map bounds for visible customers
    const allLatitudes = routeCoordinates.map(coord => coord[0]);
    const allLongitudes = routeCoordinates.map(coord => coord[1]);
    const bounds: [[number, number], [number, number]] = [
        [Math.min(...allLatitudes), Math.min(...allLongitudes)],
        [Math.max(...allLatitudes), Math.max(...allLongitudes)]
    ];

    // Create numbered icon for customers
    const createNumberedIcon = (number: number) => {
        return L.divIcon({
            html: `<div class="numbered-marker">${number}</div>`,
            className: 'custom-div-icon',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
    };

    // Create start icon
    const startIcon = L.divIcon({
        html: '<div class="start-marker">Başlangıç</div>',
        className: 'custom-div-icon',
        iconSize: [60, 30],
        iconAnchor: [30, 15]
    });

    const loadMoreCustomers = () => {
        setVisibleCount(prev => Math.min(prev + LOAD_MORE_COUNT, result.optimizedCustomerIds.length));
    };

    const showAllCustomers = () => {
        setVisibleCount(result.optimizedCustomerIds.length);
    };

    const resetView = () => {
        setVisibleCount(20);
    };

    return (
        <div className="route-map">
            <div className="map-header">
                <h3>Optimize Edilmiş Rota Haritası</h3>
                <div className="map-controls">
          <span className="route-info">
            Gösterilen: {visibleCount} / {result.optimizedCustomerIds.length} müşteri
          </span>
                    {hasMore && (
                        <button
                            className="load-more-btn"
                            onClick={loadMoreCustomers}
                        >
                            Sonraki {Math.min(LOAD_MORE_COUNT, result.optimizedCustomerIds.length - visibleCount)} Müşteriyi Göster
                        </button>
                    )}
                    {visibleCount < result.optimizedCustomerIds.length && (
                        <button
                            className="show-all-btn"
                            onClick={showAllCustomers}
                        >
                            Tümünü Göster ({result.optimizedCustomerIds.length})
                        </button>
                    )}
                    {visibleCount > 20 && (
                        <button
                            className="reset-btn"
                            onClick={resetView}
                        >
                            İlk 20'yi Göster
                        </button>
                    )}
                </div>
            </div>

            <MapContainer
                key={visibleCount} // Force re-render to update bounds
                bounds={bounds}
                style={{ height: '500px', width: '100%' }}
                className="leaflet-container"
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Route line for visible customers */}
                <Polyline
                    positions={routeCoordinates}
                    pathOptions={{ color: "#3388ff", weight: 4, opacity: 0.7 }}
                />

                {/* Start marker */}
                <Marker
                    position={[startLatitude, startLongitude]}
                    icon={startIcon}
                >
                    <Popup>
                        <strong>Başlangıç Noktası</strong><br />
                        Koordinat: {startLatitude.toFixed(6)}, {startLongitude.toFixed(6)}
                    </Popup>
                </Marker>

                {/* Visible customer markers */}
                {visibleCustomerIds.map((customerId, index) => {
                    const customer = customerMap.get(customerId);
                    if (!customer) return null;

                    return (
                        <Marker
                            key={customerId}
                            position={[customer.latitude, customer.longitude]}
                            icon={createNumberedIcon(index + 1)}
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