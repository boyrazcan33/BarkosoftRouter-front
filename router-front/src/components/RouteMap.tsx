import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { useLanguage } from '../contexts/LanguageContext';
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
    const { t } = useLanguage();
    const [currentPage, setCurrentPage] = useState(0);
    const CUSTOMERS_PER_PAGE = 20;

    // Create customer lookup map
    const customerMap = new Map(customers.map(c => [c.myId, c]));

    // Get visible customers for current page
    const startIndex = currentPage * CUSTOMERS_PER_PAGE;
    const endIndex = startIndex + CUSTOMERS_PER_PAGE;
    const visibleCustomerIds = result.optimizedCustomerIds.slice(startIndex, endIndex);
    const totalPages = Math.ceil(result.optimizedCustomerIds.length / CUSTOMERS_PER_PAGE);
    const hasNext = currentPage < totalPages - 1;
    const hasPrevious = currentPage > 0;

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
        html: `<div class="start-marker">${t.startingPointMarker}</div>`,
        className: 'custom-div-icon',
        iconSize: [80, 30],
        iconAnchor: [40, 15]
    });

    const nextPage = () => {
        if (hasNext) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const previousPage = () => {
        if (hasPrevious) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const showAllCustomers = () => {
        // Show all customers by setting a very high page that includes everything
        setCurrentPage(0);
        // We'll need to modify the slice logic for "show all"
    };

    const resetView = () => {
        setCurrentPage(0);
    };

    return (
        <div className="route-map">
            <div className="map-header">
                <h3>{t.optimizedRouteMap}</h3>
                <div className="map-controls">
          <span className="route-info">
            {t.page} {currentPage + 1} / {totalPages} - {t.showing} {startIndex + 1}-{Math.min(endIndex, result.optimizedCustomerIds.length)} / {result.optimizedCustomerIds.length} {t.customers}
          </span>
                    <div className="pagination-controls">
                        {hasPrevious && (
                            <button
                                className="prev-btn"
                                onClick={previousPage}
                            >
                                {t.previous}
                            </button>
                        )}
                        {hasNext && (
                            <button
                                className="next-btn"
                                onClick={nextPage}
                            >
                                {t.next}
                            </button>
                        )}
                        <button
                            className="show-all-btn"
                            onClick={showAllCustomers}
                        >
                            {t.showAll}
                        </button>
                    </div>
                </div>
            </div>

            <MapContainer
                key={currentPage} // Force re-render when page changes
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
                    // @ts-ignore
                    icon={startIcon}
                >
                    <Popup>
                        <strong>{t.startingPointMarker}</strong><br />
                        {t.coordinate} {startLatitude.toFixed(6)}, {startLongitude.toFixed(6)}
                    </Popup>
                </Marker>

                {/* Visible customer markers with correct numbering */}
                {visibleCustomerIds.map((customerId, index) => {
                    const customer = customerMap.get(customerId);
                    if (!customer) return null;

                    const actualNumber = startIndex + index + 1; // Correct number based on overall position

                    return (
                        <Marker
                            key={customerId}
                            position={[customer.latitude, customer.longitude]}
                            // @ts-ignore
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