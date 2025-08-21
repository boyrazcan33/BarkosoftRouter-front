import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { useLanguage } from '../contexts/LanguageContext';
import { RouteResponse } from '../types';
import './RouteMap.scss';

// Fix default markers
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
    const { t } = useLanguage();
    const [currentPage, setCurrentPage] = useState(0);
    const [showAllMarkers, setShowAllMarkers] = useState(false);
    const CUSTOMERS_PER_PAGE = 20;

    // Create customer lookup map
    const customerMap = new Map(customers.map(c => [c.myId, c]));

    // Get visible customer IDs based on pagination
    const visibleCustomerIds = showAllMarkers
        ? result.optimizedCustomerIds
        : result.optimizedCustomerIds.slice(currentPage * CUSTOMERS_PER_PAGE, (currentPage + 1) * CUSTOMERS_PER_PAGE);

    const totalPages = Math.ceil(result.optimizedCustomerIds.length / CUSTOMERS_PER_PAGE);
    const hasNext = currentPage < totalPages - 1;
    const hasPrevious = currentPage > 0;

    // Get route coordinates based on mode
    const getRouteCoordinates = (): [number, number][] => {
        const routeCoordinates: [number, number][] = [];

        if (!result.routeGeometry || result.routeGeometry.length === 0) {
            return routeCoordinates;
        }

        if (showAllMarkers || !result.customerGeometryMapping) {
            // Show full route
            result.routeGeometry.forEach(point => {
                if (point && point.length >= 2) {
                    routeCoordinates.push([point[1], point[0]]);
                }
            });
        } else {
            // Show route segment for current page using customerGeometryMapping
            let minIdx = Number.MAX_SAFE_INTEGER;
            let maxIdx = 0;

            // Find geometry range for visible customers
            visibleCustomerIds.forEach(customerId => {
                const mapping = result.customerGeometryMapping![customerId];
                if (mapping && mapping.length === 2) {
                    minIdx = Math.min(minIdx, mapping[0]);
                    maxIdx = Math.max(maxIdx, mapping[1]);
                }
            });

            // Include from start if first page
            if (currentPage === 0) minIdx = 0;

            // Extract segment
            if (minIdx !== Number.MAX_SAFE_INTEGER) {
                for (let i = minIdx; i <= Math.min(maxIdx, result.routeGeometry.length - 1); i++) {
                    const point = result.routeGeometry[i];
                    if (point && point.length >= 2) {
                        routeCoordinates.push([point[1], point[0]]);
                    }
                }
            }
        }

        return routeCoordinates;
    };

    const routeCoordinates = getRouteCoordinates();

    // Simple bounds calculation
    const calculateBounds = (): [[number, number], [number, number]] => {
        const points: [number, number][] = [[startLatitude, startLongitude]];

        visibleCustomerIds.forEach(customerId => {
            const customer = customerMap.get(customerId);
            if (customer) {
                points.push([customer.latitude, customer.longitude]);
            }
        });

        if (points.length === 1) {
            return [
                [startLatitude - 0.01, startLongitude - 0.01],
                [startLatitude + 0.01, startLongitude + 0.01]
            ];
        }

        let minLat = points[0][0], maxLat = points[0][0];
        let minLng = points[0][1], maxLng = points[0][1];

        for (const [lat, lng] of points) {
            if (lat < minLat) minLat = lat;
            if (lat > maxLat) maxLat = lat;
            if (lng < minLng) minLng = lng;
            if (lng > maxLng) maxLng = lng;
        }

        const padding = 0.005;
        return [
            [minLat - padding, minLng - padding],
            [maxLat + padding, maxLng + padding]
        ];
    };

    const bounds = calculateBounds();

    // Create numbered icon
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
        html: `<div class="start-marker">${t.startingPointMarker}</div>`,
        className: 'custom-div-icon',
        iconSize: [80, 30],
        iconAnchor: [40, 15]
    });

    // Polyline style
    const polylineOptions = {
        color: showAllMarkers ? "#3388ff" : "#9b59b6", // Blue for full, purple for segment
        weight: 4,
        opacity: 0.8,
        dashArray: showAllMarkers ? undefined : "10, 5" // Dashed for segments
    };

    return (
        <div className="route-map">
            <div className="map-header">
                <h3>{t.optimizedRouteMap}</h3>
                <div className="map-controls">
                    <span className="route-info">
                        {showAllMarkers
                            ? `${t.showing} ${result.optimizedCustomerIds.length} ${t.customers}`
                            : `${t.page} ${currentPage + 1} / ${totalPages} - ${t.showing} ${visibleCustomerIds.length} ${t.customers}`
                        }
                    </span>
                    <div className="pagination-controls">
                        {!showAllMarkers && hasPrevious && (
                            <button onClick={() => setCurrentPage(prev => prev - 1)} className="load-more-btn">
                                {t.previous}
                            </button>
                        )}
                        {!showAllMarkers && hasNext && (
                            <button onClick={() => setCurrentPage(prev => prev + 1)} className="load-more-btn">
                                {t.next}
                            </button>
                        )}
                        <button
                            onClick={() => {
                                setShowAllMarkers(!showAllMarkers);
                                if (!showAllMarkers) setCurrentPage(0);
                            }}
                            className={showAllMarkers ? "reset-btn" : "show-all-btn"}
                        >
                            {showAllMarkers ? t.showSegments : t.showAll}
                        </button>
                    </div>
                </div>
            </div>

            <MapContainer
                key={`${currentPage}-${showAllMarkers}`}
                bounds={bounds}
                style={{ height: '700px', width: '100%' }}
                className="leaflet-container"
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {/* Route based on mode */}
                {routeCoordinates.length >= 2 && (
                    <Polyline positions={routeCoordinates} pathOptions={polylineOptions} />
                )}

                {/* Start marker */}
                <Marker position={[startLatitude, startLongitude]} icon={startIcon}>
                    <Popup>
                        <strong>{t.startingPointMarker}</strong><br />
                        {t.coordinate} {startLatitude.toFixed(6)}, {startLongitude.toFixed(6)}
                    </Popup>
                </Marker>

                {/* Customer markers */}
                {visibleCustomerIds.map((customerId) => {
                    const customer = customerMap.get(customerId);
                    if (!customer) return null;
                    const actualNumber = result.optimizedCustomerIds.indexOf(customerId) + 1;

                    return (
                        <Marker
                            key={customerId}
                            position={[customer.latitude, customer.longitude]}
                            icon={createNumberedIcon(actualNumber)}
                        >
                            <Popup>
                                <strong>{t.customer} {actualNumber}</strong><br />
                                ID: {customer.myId}<br />
                                {t.coordinate} {customer.latitude.toFixed(6)}, {customer.longitude.toFixed(6)}
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default RouteMap;