import React from 'react';

const ClearStorage = () => {
  const handleClearRecords = () => {
    if (window.confirm('确定要清除所有记录吗？这将删除所有现有的注意力记录。')) {
      localStorage.removeItem('attentionRecords');
      alert('记录已清除，请刷新页面。');
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      left: '10px', 
      zIndex: 1000,
      padding: '5px',
      background: '#f8f8f8',
      border: '1px solid #ddd',
      borderRadius: '4px'
    }}>
      <button 
        onClick={handleClearRecords}
        style={{
          background: 'white',
          border: '1px solid #666',
          borderRadius: '4px',
          padding: '5px 10px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        清除所有记录
      </button>
    </div>
  );
};

export default ClearStorage; 