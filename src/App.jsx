import React, { useState } from 'react';
import './App.css';
import CirclePackingTest from './CirclePackingTest';
import testData from './data/d3-test-data.json'; // 直接引入 JSON

function App() {
  const [showTest, setShowTest] = useState(false);

  return (
    <div className="App">
      {!showTest ? (
        // 原本的 App 內容幾乎不動，只在適當位置加個超連結
        <header className="App-header">
          <h1>My Web Project</h1>
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); setShowTest(true); }}
            style={{ color: '#646cff', fontSize: '1.2em', textDecoration: 'underline' }}
          >
            點我看測試中的d3 circle packing
          </a>
          <p>原本的其他內容...</p>
        </header>
      ) : (
        // 當點擊後，顯示 D3 測試組件
        <CirclePackingTest data={testData} onBack={() => setShowTest(false)} />
      )}
    </div>
  );
}

export default App;