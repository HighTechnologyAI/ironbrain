import React from 'react';

console.log('Ultra-simple App: Loading...');

const App = () => {
  console.log('Ultra-simple App: Rendering...');
  
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#0B0F14',
      color: '#D6E2F3',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#16C172', fontSize: '2rem', marginBottom: '1rem' }}>
        🚁 Tiger CRM - Система работает!
      </h1>
      <div style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
        <p>✅ React загружен</p>
        <p>✅ JavaScript работает</p>
        <p>✅ Компонент отрендерен</p>
        <p>✅ Стили применены</p>
      </div>
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        border: '1px solid #16C172',
        borderRadius: '8px',
        backgroundColor: '#0F141A'
      }}>
        <p><strong>Статус:</strong> Минимальная версия работает корректно</p>
        <p><strong>Время:</strong> {new Date().toLocaleString('ru-RU')}</p>
      </div>
    </div>
  );
};

export default App;