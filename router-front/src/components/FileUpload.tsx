import React, { useRef } from 'react';
import { RouteRequest } from '../types';
import './FileUpload.scss';

interface FileUploadProps {
    onFileUpload: (data: RouteRequest) => void;
    onError: (error: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, onError }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Check if file is JSON
        if (!file.name.endsWith('.json')) {
            onError('Lütfen geçerli bir JSON dosyası seçin');
            return;
        }

        // Read file content
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const jsonData = JSON.parse(content);

                // Validate required fields
                if (!jsonData.startLatitude || !jsonData.startLongitude || !jsonData.customerIds) {
                    throw new Error('JSON dosyasında gerekli alanlar eksik (startLatitude, startLongitude, customerIds)');
                }

                // Validate data types
                if (typeof jsonData.startLatitude !== 'number' ||
                    typeof jsonData.startLongitude !== 'number' ||
                    !Array.isArray(jsonData.customerIds)) {
                    throw new Error('JSON dosyasındaki veri tipleri hatalı');
                }

                // Validate customerIds array
                if (jsonData.customerIds.length === 0) {
                    throw new Error('En az bir müşteri ID\'si gerekli');
                }

                onFileUpload(jsonData as RouteRequest);
            } catch (error) {
                onError(`JSON dosyası okuma hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
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
                JSON Dosyası Seç
            </button>
        </div>
    );
};

export default FileUpload;