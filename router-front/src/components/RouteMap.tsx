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
    const [showAll, setShowAll] = useState(false);
    const CUSTOMERS_PER_PAGE = 20;

    // Create customer lookup map
    const customerMap = new Map(customers.map(c => [c.myId, c]));

    // Get visible customers based on showAll state
    const visibleCustomerIds = showAll
        ? result.optimizedCustomerIds
        : result.optimizedCustomerIds.slice(currentPage * CUSTOMERS_PER_PAGE, (currentPage + 1) * CUSTOMERS_PER_PAGE);

    const totalPages = Math.ceil(result.optimizedCustomerIds.length / CUSTOMERS_PER_PAGE);
    const hasNext = currentPage < totalPages - 1;
    const hasPrevious = currentPage > 0;

    // Build route coordinates for visible customers only
    const routeCoordinates: [number, number][] = [];
    routeCoordinates.push([startLatitude, startLongitude]);

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
        if (hasNext && !showAll) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const previousPage = () => {
        if (hasPrevious && !showAll) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const showAllCustomers = () => {
        setShowAll(true);
        setCurrentPage(0);
    };

    const resetView = () => {
        setShowAll(false);
        setCurrentPage(0);
    };

    return (
        <div className="route-map">
            <div className="map-header">
                <h3>{t.optimizedRouteMap}</h3>
                <div className="map-controls">
                    {!showAll ? (
                        <span className="route-info">
                            {t.page} {currentPage + 1} / {totalPages} - {t.showing} {currentPage * CUSTOMERS_PER_PAGE + 1}-{Math.min((currentPage + 1) * CUSTOMERS_PER_PAGE, result.optimizedCustomerIds.length)} / {result.optimizedCustomerIds.length} {t.customers}
                        </span>
                    ) : (
                        <span className="route-info">
                            {t.showing} {result.optimizedCustomerIds.length} / {result.optimizedCustomerIds.length} {t.customers}
                        </span>
                    )}
                    <div className="pagination-controls">
                        {!showAll && hasPrevious && (
                            <button
                                className="prev-btn"
                                onClick={previousPage}
                            >
                                {t.previous}
                            </button>
                        )}
                        {!showAll && hasNext && (
                            <button
                                className="next-btn"
                                onClick={nextPage}
                            >
                                {t.next}
                            </button>
                        )}
                        {!showAll && (
                            <button
                                className="show-all-btn"
                                onClick={showAllCustomers}
                            >
                                {t.showAll}
                            </button>
                        )}
                        {showAll && (
                            <button
                                className="reset-btn"
                                onClick={resetView}
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <MapContainer
                key={showAll ? 'all' : currentPage}
                bounds={bounds}
                style={{ height: '500px', width: '100%' }}
                className="leaflet-container"
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Polyline
                    positions={routeCoordinates}
                    pathOptions={{ color: "#3388ff", weight: 4, opacity: 0.7 }}
                />

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

                {visibleCustomerIds.map((customerId, index) => {
                    const customer = customerMap.get(customerId);
                    if (!customer) return null;

                    const actualNumber = showAll
                        ? result.optimizedCustomerIds.indexOf(customerId) + 1
                        : currentPage * CUSTOMERS_PER_PAGE + index + 1;

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