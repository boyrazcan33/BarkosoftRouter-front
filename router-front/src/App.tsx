import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ResultsDisplay from './components/ResultsDisplay';
import { routeService } from './services/apiService';
import { RouteRequest, RouteResponse, AppState } from './types';
import './App.scss';

function App() {
  const [state, setState] = useState<AppState>({
    isLoading: false,
    error: null,
    result: null,
    uploadedData: null
  });

  const handleFileUpload = (data: RouteRequest) => {
    setState(prev => ({
      ...prev,
      uploadedData: data,
      error: null,
      result: null
    }));
  };

  const handleError = (error: string) => {
    setState(prev => ({
      ...prev,
      error,
      result: null
    }));
  };

  const handleOptimize = async () => {
    if (!state.uploadedData) {
      handleError('Lütfen önce bir JSON dosyası yükleyin');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await routeService.optimizeRoute(state.uploadedData);
      setState(prev => ({
        ...prev,
        isLoading: false,
        result,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu'
      }));
    }
  };

  return (
      <div className="app">
        <div className="container">
          <header className="app-header">
            <h1>Rota Optimizasyonu API Test Arayüzü</h1>
            <p className="description">
              Bu basit test aracı, rota optimizasyonu API servisini test etmek ve göstermek için tasarlanmıştır.
            </p>
          </header>

          <main className="app-main">
            <section className="info-section">
              <h2>Ne yapar:</h2>
              <ul>
                <li>Başlangıç koordinatları ve müşteri ID'leri içeren JSON dosyası yükler</li>
                <li>OSRM kullanarak optimize edilmiş rota almak için backend API'yi çağırır</li>
                <li>Optimize edilmiş müşteri sırasını ve toplam mesafeyi gösterir</li>
              </ul>

              <h2>Kullanım Talimatları:</h2>
              <ol>
                <li>Şu formatta JSON yükle: <code>{`{"startLatitude": 41.0082, "startLongitude": 28.9784, "customers": [{"myId": 101, "latitude": 41.0180, "longitude": 28.9647}]}`}</code></li>
                <li>"Rotayı Optimize Et" butonuna tıkla</li>
                <li>Optimize edilmiş sonuçları görüntüle</li>
              </ol>

              <p><strong>Test Edilen API Endpoint:</strong> <code>POST /api/route/optimize</code></p>
            </section>

            <section className="upload-section">
              <FileUpload
                  onFileUpload={handleFileUpload}
                  onError={handleError}
              />

              {state.uploadedData && (
                  <div className="uploaded-data">
                    <h3>Yüklenen Veri:</h3>
                    <p>Başlangıç: {state.uploadedData.startLatitude}, {state.uploadedData.startLongitude}</p>
                    <p>Müşteri Sayısı: {state.uploadedData.customers.length}</p>
                  </div>
              )}

              <button
                  className="optimize-button"
                  onClick={handleOptimize}
                  disabled={!state.uploadedData || state.isLoading}
              >
                {state.isLoading ? 'Optimize ediliyor...' : 'Rotayı Optimize Et'}
              </button>
            </section>

            {state.error && (
                <div className="error-message">
                  <h3>Hata:</h3>
                  <p>{state.error}</p>
                </div>
            )}

            {state.result && (
                <ResultsDisplay result={state.result} />
            )}
          </main>

          <footer className="app-footer">
            <p><strong>Not:</strong> Bu sadece bir test arayüzüdür. Üretimde şirketler bu frontend'i kullanmadan doğrudan API endpoint'i ile entegre olurlar.</p>
          </footer>
        </div>
      </div>
  );
}

export default App;