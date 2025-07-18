import React from 'react';
import { RouteResponse } from '../types';
import './ResultsDisplay.scss';

interface ResultsDisplayProps {
    result: RouteResponse;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
    return (
        <div className="results-display">
            <h3>Optimizasyon Sonucu</h3>
            <div className="result-content">
                <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
        </div>
    );
};

export default ResultsDisplay;