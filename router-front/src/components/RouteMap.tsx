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

    // Determine which route to display based on pagination
    const routeCoordinates: [number, number][] = [];

    if (result.routeGeometry && result.routeGeometry.length > 0 && showAll) {
        // If showing all customers, use full geometry
        result.routeGeometry.forEach(point => {
            if (point && point.length >= 2) {
                routeCoordinates.push([point[1], point[0]]);
            }
        });
        console.log(`Using full OSRM geometry with ${routeCoordinates.length} points`);
    } else {
        // For paginated view or no geometry, show only visible segment
        // Always start from the starting point
        routeCoordinates.push([startLatitude, startLongitude]);

        // Add straight lines through visible customers only
        visibleCustomerIds.forEach(customerId => {
            const customer = customerMap.get(customerId);
            if (customer) {
                routeCoordinates.push([customer.latitude, customer.longitude]);
            }
        });

        // If we're on page 2+, connect from the last customer of previous page
        if (!showAll && currentPage > 0 && result.optimizedCustomerIds.length > 0) {
            const prevPageLastIndex = currentPage * CUSTOMERS_PER_PAGE - 1;
            const prevCustomerId = result.optimizedCustomerIds[prevPageLastIndex];
            const prevCustomer = customerMap.get(prevCustomerId);
            if (prevCustomer) {
                // Replace starting point with previous page's last customer
                routeCoordinates[0] = [prevCustomer.latitude, prevCustomer.longitude];
            }
        }

        console.log(`Using straight lines for ${visibleCustomerIds.length} visible customers`);
    }

    // Calculate map bounds
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

    // Determine polyline style based on view mode
    const polylineOptions = showAll && result.routeGeometry && result.routeGeometry.length > 0
        ? { color: "#3388ff", weight: 4, opacity: 0.8 }  // Full route with actual road geometry
        : { color: "#ff6b6b", weight: 3, opacity: 0.6, dashArray: "10, 10" };  // Paginated view - dashed lines

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
                key={`${showAll ? 'all' : currentPage}-${result.routeGeometry ? 'geo' : 'straight'}`}
                bounds={bounds}
                style={{ height: '700px', width: '100%' }}
                className="leaflet-container"
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Polyline
                    positions={routeCoordinates}
                    pathOptions={polylineOptions}
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

            {result.routeGeometry && (
                <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                    ℹ️ {showAll
                    ? `Showing full route with actual roads (${result.routeGeometry.length} geometry points)`
                    : `Showing segment for current ${visibleCustomerIds.length} customers (straight lines)`}
                </div>
            )}
        </div>
    );
};

export default RouteMap;