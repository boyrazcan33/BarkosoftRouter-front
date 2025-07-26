import React, { useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { RouteRequest } from '../types';
import './FileUpload.scss';

interface FileUploadProps {
    onFileUpload: (data: RouteRequest) => void;
    onError: (error: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, onError }) => {
    const { t } = useLanguage();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Check if file is JSON
        if (!file.name.endsWith('.json')) {
            onError(t.selectValidJson);
            return;
        }

        // Read file content
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const jsonData = JSON.parse(content);

                // Validate required fields
                if (!jsonData.startLatitude || !jsonData.startLongitude || !jsonData.customers) {
                    throw new Error(t.missingRequiredFields);
                }

                // Validate data types
                if (typeof jsonData.startLatitude !== 'number' ||
                    typeof jsonData.startLongitude !== 'number' ||
                    !Array.isArray(jsonData.customers)) {
                    throw new Error(t.incorrectDataTypes);
                }

                // Validate customers array
                if (jsonData.customers.length === 0) {
                    throw new Error(t.atLeastOneCustomer);
                }

                // Validate each customer object
                jsonData.customers.forEach((customer: any, index: number) => {
                    if (!customer.myId || !customer.latitude || !customer.longitude) {
                        throw new Error(`${t.customer} ${index + 1}: ${t.customerFieldsRequired}`);
                    }
                    if (typeof customer.myId !== 'number' ||
                        typeof customer.latitude !== 'number' ||
                        typeof customer.longitude !== 'number') {
                        throw new Error(`${t.customer} ${index + 1}: ${t.customerDataTypesIncorrect}`);
                    }
                });

                onFileUpload(jsonData as RouteRequest);
            } catch (error) {
                onError(`${t.jsonReadError} ${error instanceof Error ? error.message : t.unknownError}`);
            }
        };

        reader.readAsText(file);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="file-upload">
            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
            <button
                className="upload-button"
                onClick={handleClick}
                type="button"
            >
                {t.selectJsonFile}
            </button>
        </div>
    );
};

export default FileUpload;