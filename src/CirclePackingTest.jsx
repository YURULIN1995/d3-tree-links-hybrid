import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const CirclePackingTest = ({ data, onBack }) => {
  const svgRef = useRef();

  useEffect(() => {
    // 確保有資料才進行繪圖
    if (!data || !data.tree) return;

    const width = 800;
    const height = 600;

    // 1. 初始化畫布：選取 SVG 並清空舊內容
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // 2. 定義 SVG Marker (箭頭)
    const defs = svg.append("defs");
    defs.append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      // 【修正點】：refX 設為 10（箭頭三角形的底邊）。
      // 這樣 Marker 的原點會位於三角形的幾何尖端，使其精確指在連線的終點座標上。
      .attr("refX", 10) 
      .attr("refY", 0)
      .attr("orient", "auto") // 讓箭頭隨曲線角度自動旋轉
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .append("path")
      .attr("d", "M0,-5L10,0L0,5") // 畫出三角形
      .attr("fill", "#ffcc00");

    // 3. 設定 Layout 計算器 (d3.pack)
    const pack = d3.pack()
      .size([width - 100, height - 100])
      .padding(40); // 增加間距，給群組標籤留空間

    // 4. 建立資料階層並執行計算
    const root = d3.hierarchy(data.tree)
      .sum(d => d.value || 30) 
      .sort((a, b) => b.value - a.value);

    pack(root);

    // 取得所有節點並建立 Map 索引，方便查找座標
    const nodes = root.descendants();
    const nodeMap = new Map(nodes.map(d => [d.data.name, d]));

    // 建立主要容器 g，整體的偏移 (Margin)
    const g = svg.append("g").attr("transform", "translate(50,50)");

    // ==========================================
    // --- 關鍵修改：繪製順序：球 -> 線 -> 字 ---
    // ==========================================

    // 5. 【先】繪製圓圈層 (Node Groups)
    // 我們將圓圈放在下方層級
    const nodeGroups = g.selectAll("g.node")
      .data(nodes)
      .join("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y})`);

    // 畫圓圈
    nodeGroups.append("circle")
      .attr("r", d => d.r)
      .attr("fill", d => d.children ? "#222" : "#555") 
      .attr("stroke", d => d.children ? "#888" : "#fff")
      .attr("stroke-width", 1.5)
      .style("opacity", 0.9);


    // 6. 【後】繪製連線層 (Links)
    // 因為線是在球之後繪製，所以黃色虛線和箭頭會疊在球的上面，直達圓心
    if (data.connections) {
      data.connections.forEach(conn => {
        const source = nodeMap.get(conn.source);
        const target = nodeMap.get(conn.target);

        if (source && target) {
          // 繪製二次貝茲曲線 (Quadratic Curve)
          // 控制點 (midX, midY) 決定往下彎曲的幅度
          const midX = (source.x + target.x) / 2;
          const midY = Math.max(source.y, target.y) + 120; // 往下彎曲 120px

          g.append("path")
            .attr("d", `M${source.x},${source.y} Q${midX},${midY} ${target.x},${target.y}`)
            .attr("fill", "none")
            .attr("stroke", "#ffcc00") // 黃色虛線
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "4,4") // 虛線風格
            .attr("marker-end", "url(#arrowhead)") // 套用箭頭
            .style("pointer-events", "none"); // 防止虛線擋住滑鼠對圓圈的操作
        }
      });
    }

    // 7. 【最後】繪製文字層 (Text Layer)
    // 確保標籤位於最頂層，不被連線切過
    const textLayer = g.append("g").attr("class", "text-layer");

    textLayer.selectAll("text")
      .data(nodes)
      .join("text")
      .attr("x", d => d.x)
      .attr("y", d => d.y)
      .text(d => d.data.name)
      // 動態調整 dy 位移：大圓標籤往上「漂浮」，小圓置中
      .attr("dy", d => d.children ? `-${(d.r / 10) + 1.2}em` : "0.35em") 
      .style("text-anchor", "middle") // 水平置中
      .style("fill", "#fff")
      .style("font-size", d => d.children ? "16px" : "11px")
      .style("font-weight", d => d.children ? "bold" : "normal")
      .style("font-family", "sans-serif")
      .style("pointer-events", "none") // 防止文字干擾滑鼠事件
      .style("text-shadow", "2px 2px 4px rgba(0,0,0,0.8)"); // 增加辨識度

  }, [data]); // 當傳入的 data 改變時重新繪圖

  return (
    <div style={{ textAlign: 'center', background: '#121212', padding: '20px', minHeight: '100vh' }}>
      <button 
        onClick={onBack} 
        style={{ 
          padding: '10px 20px', 
          cursor: 'pointer', 
          backgroundColor: '#333', 
          color: '#eee', 
          border: '1px solid #555', 
          borderRadius: '20px',
          marginBottom: '20px'
        }}
      >
        ← 返回專案首頁
      </button>
      
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg 
          ref={svgRef} 
          width="800" 
          height="600" 
          style={{ 
            background: '#1a1a1a',
            borderRadius: '12px', 
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)' 
          }}
        ></svg>
      </div>
    </div>
  );
};

export default CirclePackingTest;