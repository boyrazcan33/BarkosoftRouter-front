import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import LanguageSelector from './components/LanguageSelector';
import FileUpload from './components/FileUpload';
import ResultsDisplay from './components/ResultsDisplay';
import RouteMap from './components/RouteMap';
import { routeService } from './services/apiService';
import { RouteRequest, RouteResponse, AppState } from './types';
import './App.scss';

const AppContent: React.FC = () => {
  const { t } = useLanguage();
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
      handleError(t.pleaseUploadJson);
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
        error: error instanceof Error ? error.message : t.unknownError
      }));
    }
  };

  return (
      <div className="app">
        <div className="container">
          <header className="app-header">
            <h1>{t.appTitle}</h1>
            <p className="description">{t.appDescription}</p>
          </header>

          <main className="app-main">
            <section className="info-section">
              <div className="info-header">
                <h2>{t.whatItDoes}</h2>
                <LanguageSelector />
              </div>
              <ul>
                {t.whatItDoesItems.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
              </ul>

              <h2>{t.usageInstructions}</h2>
              <ol>
                {t.usageSteps.map((step, index) => (
                    <li key={index}>{step}</li>
                ))}
              </ol>

              <p><strong>{t.testedEndpoint}</strong> <code>POST /api/route/optimize</code></p>
            </section>

            <section className="upload-section">
              <FileUpload
                  onFileUpload={handleFileUpload}
                  onError={handleError}
              />

              {state.uploadedData && (
                  <div className="uploaded-data">
                    <h3>{t.uploadedData}</h3>
                    <p>{t.startingPoint} {state.uploadedData.startLatitude}, {state.uploadedData.startLongitude}</p>
                    <p>{t.customerCount} {state.uploadedData.customers.length}</p>
                  </div>
              )}

              <button
                  className="optimize-button"
                  onClick={handleOptimize}
                  disabled={!state.uploadedData || state.isLoading}
              >
                {state.isLoading ? t.optimizing : t.optimizeRoute}
              </button>
            </section>

            {state.error && (
                <div className="error-message">
                  <h3>{t.error}</h3>
                  <p>{state.error}</p>
                </div>
            )}

            {/* MAP MOVED UP AND DISPLAYED FIRST */}
            {state.result && state.uploadedData && (
                <RouteMap
                    startLatitude={state.uploadedData.startLatitude}
                    startLongitude={state.uploadedData.startLongitude}
                    customers={state.uploadedData.customers}
                    result={state.result}
                />
            )}

            {/* JSON RESULTS DISPLAYED AFTER MAP */}
            {state.result && (
                <ResultsDisplay result={state.result} />
            )}
          </main>

          <footer className="app-footer">
            <p>{t.footerNote}</p>
          </footer>
        </div>
      </div>
  );
};

function App() {
  return (
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
  );
}

export default App;