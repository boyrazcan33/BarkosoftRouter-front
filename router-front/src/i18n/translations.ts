// src/i18n/translations.ts
export interface Translations {
    // Header
    appTitle: string;
    appDescription: string;

    // Info Section
    whatItDoes: string;
    whatItDoesItems: string[];
    usageInstructions: string;
    usageSteps: string[];
    testedEndpoint: string;

    // Upload Section
    selectJsonFile: string;
    uploadedData: string;
    startingPoint: string;
    customerCount: string;
    optimizeRoute: string;
    optimizing: string;

    // Results
    optimizationResult: string;

    // Map
    optimizedRouteMap: string;
    page: string;
    showing: string;
    customer: string;
    customers: string;
    previous: string;
    next: string;
    showAll: string;
    startingPointMarker: string;
    coordinate: string;

    // Error Messages
    error: string;
    pleaseUploadJson: string;
    selectValidJson: string;
    missingRequiredFields: string;
    incorrectDataTypes: string;
    atLeastOneCustomer: string;
    customerFieldsRequired: string;
    customerDataTypesIncorrect: string;
    jsonReadError: string;
    unknownError: string;
    apiError: string;

    // Footer
    footerNote: string;
}

export const translations: Record<string, Translations> = {
    en: {
        // Header
        appTitle: "Route Optimization API Test Interface",
        appDescription: "This simple test tool is designed to test and demonstrate the route optimization API service.",

        // Info Section
        whatItDoes: "What it does:",
        whatItDoesItems: [
            "Upload JSON file with start coordinates and customer IDs",
            "Call backend API to get optimized route using OSRM",
            "Display optimized customer order, total distance and route map"
        ],
        usageInstructions: "Usage Instructions:",
        usageSteps: [
            'Upload JSON in this format: {"startLatitude": 41.0082, "startLongitude": 28.9784, "customers": [{"myId": 101, "latitude": 41.0180, "longitude": 28.9647}]}',
            'Click "Optimize Route" button',
            "View optimized results and interactive map",
            "Processing time: ~50 seconds for 500 clients"
        ],
        testedEndpoint: "Tested API Endpoint:",

        // Upload Section
        selectJsonFile: "Select JSON File",
        uploadedData: "Uploaded Data:",
        startingPoint: "Starting Point:",
        customerCount: "Customer Count:",
        optimizeRoute: "Optimize Route",
        optimizing: "Optimizing...",

        // Results
        optimizationResult: "Optimization Result",

        // Map
        optimizedRouteMap: "Optimized Route Map",
        page: "Page",
        showing: "Showing:",
        customer: "Customer",
        customers: "customers",
        previous: "← Previous 20",
        next: "Next 20 →",
        showAll: "Show All",
        startingPointMarker: "Start",
        coordinate: "Coordinate:",

        // Error Messages
        error: "Error:",
        pleaseUploadJson: "Please upload a JSON file first",
        selectValidJson: "Please select a valid JSON file",
        missingRequiredFields: "Missing required fields in JSON file (startLatitude, startLongitude, customers)",
        incorrectDataTypes: "Incorrect data types in JSON file",
        atLeastOneCustomer: "At least one customer is required",
        customerFieldsRequired: "myId, latitude, longitude required",
        customerDataTypesIncorrect: "data types incorrect (must be numbers)",
        jsonReadError: "JSON file read error:",
        unknownError: "Unknown error",
        apiError: "API Error:",

        // Footer
        footerNote: "Note: This is just a test interface. In production, companies integrate directly with the API endpoint without using this frontend."
    },
    tr: {
        // Header
        appTitle: "Rota Optimizasyonu API Test Arayüzü",
        appDescription: "Bu basit test aracı, rota optimizasyonu API servisini test etmek ve göstermek için tasarlanmıştır.",

        // Info Section
        whatItDoes: "Ne yapar:",
        whatItDoesItems: [
            "Başlangıç koordinatları ve müşteri ID'leri içeren JSON dosyası yükler",
            "OSRM kullanarak optimize edilmiş rota almak için backend API'yi çağırır",
            "Optimize edilmiş müşteri sırasını, toplam mesafeyi ve rota haritasını gösterir"
        ],
        usageInstructions: "Kullanım Talimatları:",
        usageSteps: [
            'Şu formatta JSON yükle: {"startLatitude": 41.0082, "startLongitude": 28.9784, "customers": [{"myId": 101, "latitude": 41.0180, "longitude": 28.9647}]}',
            '"Rotayı Optimize Et" butonuna tıkla',
            "Optimize edilmiş sonuçları ve interaktif haritayı görüntüle",
            "İşlem süresi: 500 müşteri için ~50 saniyedir"
        ],
        testedEndpoint: "Test Edilen API Endpoint:",

        // Upload Section
        selectJsonFile: "JSON Dosyası Seç",
        uploadedData: "Yüklenen Veri:",
        startingPoint: "Başlangıç:",
        customerCount: "Müşteri Sayısı:",
        optimizeRoute: "Rotayı Optimize Et",
        optimizing: "Optimize ediliyor...",

        // Results
        optimizationResult: "Optimizasyon Sonucu",

        // Map
        optimizedRouteMap: "Optimize Edilmiş Rota Haritası",
        page: "Sayfa",
        showing: "Gösterilen:",
        customer: "Müşteri",
        customers: "müşteri",
        previous: "← Önceki 20",
        next: "Sonraki 20 →",
        showAll: "Tümünü Göster",
        startingPointMarker: "Başlangıç",
        coordinate: "Koordinat:",

        // Error Messages
        error: "Hata:",
        pleaseUploadJson: "Lütfen önce bir JSON dosyası yükleyin",
        selectValidJson: "Lütfen geçerli bir JSON dosyası seçin",
        missingRequiredFields: "JSON dosyasında gerekli alanlar eksik (startLatitude, startLongitude, customers)",
        incorrectDataTypes: "JSON dosyasındaki veri tipleri hatalı",
        atLeastOneCustomer: "En az bir müşteri gerekli",
        customerFieldsRequired: "myId, latitude, longitude gerekli",
        customerDataTypesIncorrect: "veri tipleri hatalı (sayı olmalı)",
        jsonReadError: "JSON dosyası okuma hatası:",
        unknownError: "Bilinmeyen hata",
        apiError: "API Hatası:",

        // Footer
        footerNote: "Not: Bu sadece bir test arayüzüdür. Üretimde şirketler bu frontend'i kullanmadan doğrudan API endpoint'i ile entegre olurlar."
    }
};