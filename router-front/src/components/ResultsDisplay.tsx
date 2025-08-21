import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { RouteResponse } from '../types';
import './ResultsDisplay.scss';

interface ResultsDisplayProps {
    result: RouteResponse;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
    const { t } = useLanguage();

    // Create truncated result for display
    const truncatedResult = {
        optimizedCustomerIds: result.optimizedCustomerIds.slice(0, 20),
        totalDistance: result.totalDistance,
        status: result.status,
        ...(result.optimizedCustomerIds.length > 20 && {
            "...": `${result.optimizedCustomerIds.length - 20} more customers`
        })
    };

    return (
        <div className="results-display">
            <h3>{t.optimizationResult}</h3>
            <div className="result-content">
                <pre>{JSON.stringify(truncatedResult, null, 2)}</pre>
            </div>
        </div>
    );
};

export default ResultsDisplay;