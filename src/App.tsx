import React from 'react';

console.log('App: Starting minimal debug version...');

const App = () => {
  console.log('App: Component rendering...');
  
  try {
    return (
      <div 
        style={{ 
          minHeight: '100vh',
          backgroundColor: '#0B0F14',
          color: '#D6E2F3',
          padding: '20px',
          fontFamily: 'Arial, sans-serif'
        }}
      >
        <h1 style={{ color: '#16C172', marginBottom: '20px' }}>
          🔧 Tiger CRM - Debug Mode
        </h1>
        <div style={{ fontSize: '18px', lineHeight: '1.6' }}>
          <p>✅ React компонент загружен</p>
          <p>✅ Базовые стили применены</p>
          <p>✅ JavaScript выполняется</p>
          <p>⏰ Время: {new Date().toLocaleString('ru-RU')}</p>
        </div>
        
        <div style={{ 
          marginTop: '30px',
          padding: '15px',
          border: '2px solid #16C172',
          borderRadius: '8px',
          backgroundColor: '#0F141A'
        }}>
          <h2 style={{ color: '#16C172', marginBottom: '10px' }}>Диагностика:</h2>
          <p>• Убраны все сложные компоненты</p>
          <p>• Минимальная версия без провайдеров</p>
          <p>• Inline стили для гарантии отображения</p>
          <p>• Консольное логирование включено</p>
        </div>
      </div>
    );
  } catch (error) {
    console.error('App: Render error:', error);
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#FF5A5A', 
        color: 'white' 
      }}>
        <h1>Критическая ошибка:</h1>
        <p>{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }
};

export default App;