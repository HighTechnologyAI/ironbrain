import React from 'react';

const SimpleIndex = () => {
  console.log('SimpleIndex: Rendering...');
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-primary mb-4">
        Tiger CRM работает!
      </h1>
      <p className="text-muted-foreground mb-4">
        Это упрощенная версия для тестирования.
      </p>
      <div className="space-y-2">
        <p>• Страница загружена успешно</p>
        <p>• React компоненты работают</p>
        <p>• CSS стили применены</p>
      </div>
    </div>
  );
};

export default SimpleIndex;