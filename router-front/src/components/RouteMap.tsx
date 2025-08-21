import React, { useState } from 'react';
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
    const [showAllMarkers, setShowAllMarkers] = useState(false);
    const CUSTOMERS_PER_PAGE = 20;

    // Create customer lookup map
    const customerMap = new Map(customers.map(c => [c.myId, c]));

    // Get visible customer IDs based on pagination or show all
    const visibleCustomerIds = showAllMarkers
        ? result.optimizedCustomerIds
        : result.optimizedCustomerIds.slice(currentPage * CUSTOMERS_PER_PAGE, (currentPage + 1) * CUSTOMERS_PER_PAGE);

    const totalPages = Math.ceil(result.optimizedCustomerIds.length / CUSTOMERS_PER_PAGE);
    const hasNext = currentPage < totalPages - 1;
    const hasPrevious = currentPage > 0;

    // Always use full route geometry
    const routeCoordinates: [number, number][] = [];

    if (result.routeGeometry && result.routeGeometry.length > 0) {
        // Use full OSRM geometry - always show complete route
        result.routeGeometry.forEach(point => {
            if (point && point.length >= 2) {
                routeCoordinates.push([point[1], point[0]]);
            }
        });
    }

    // Calculate map bounds based on full route
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
        if (hasNext && !showAllMarkers) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const previousPage = () => {
        if (hasPrevious && !showAllMarkers) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const toggleShowAllMarkers = () => {
        setShowAllMarkers(!showAllMarkers);
        if (!showAllMarkers) {
            setCurrentPage(0);
        }
    };

    const resetView = () => {
        setShowAllMarkers(false);
        setCurrentPage(0);
    };

    // Polyline style - always solid blue for full route
    const polylineOptions = {
        color: "#3388ff",
        weight: 4,
        opacity: 0.7
    };

    return (
        <div className="route-map">
            <div className="map-header">
                <h3>{t.optimizedRouteMap}</h3>
                <div className="map-controls">
                    {!showAllMarkers ? (
                        <span className="route-info">
                            {t.page} {currentPage + 1} / {totalPages} - {t.showing} {currentPage * CUSTOMERS_PER_PAGE + 1}-{Math.min((currentPage + 1) * CUSTOMERS_PER_PAGE, result.optimizedCustomerIds.length)} / {result.optimizedCustomerIds.length} {t.customers}
                        </span>
                    ) : (
                        <span className="route-info">
                            {t.showing} {result.optimizedCustomerIds.length} / {result.optimizedCustomerIds.length} {t.customers}
                        </span>
                    )}
                    <div className="pagination-controls">
                        {!showAllMarkers && hasPrevious && (
                            <button
                                className="load-more-btn"
                                onClick={previousPage}
                            >
                                {t.previous}
                            </button>
                        )}
                        {!showAllMarkers && hasNext && (
                            <button
                                className="load-more-btn"
                                onClick={nextPage}
                            >
                                {t.next}
                            </button>
                        )}
                        <button
                            className={showAllMarkers ? "reset-btn" : "show-all-btn"}
                            onClick={toggleShowAllMarkers}
                        >
                            {showAllMarkers ? "Hide Markers" : t.showAll}
                        </button>
                    </div>
                </div>
            </div>

            <MapContainer
                bounds={bounds}
                style={{ height: '700px', width: '100%' }}
                className="leaflet-container"
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Always show full route */}
                {routeCoordinates.length >= 2 && (
                    <Polyline
                        positions={routeCoordinates}
                        pathOptions={polylineOptions}
                    />
                )}

                {/* Always show start marker */}
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

                {/* Show only visible customer markers based on pagination */}
                {visibleCustomerIds.map((customerId) => {
                    const customer = customerMap.get(customerId);
                    if (!customer) return null;

                    // Get the actual order number (1-based index in full list)
                    const actualNumber = result.optimizedCustomerIds.indexOf(customerId) + 1;

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