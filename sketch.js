// Constants for the grid and effect
const numb = 70; 
const step = 10; 
const distThreshold = 70; 
const distortionAmount = 20; 
let dots = []; 

// 🌟 更新：作品連結和新的名稱對應
const externalLinks = {
    '單元一作品': 'https://zyeii06.github.io/20251014_4/',
    '單元一筆記': 'https://hackmd.io/@lcienz/BJBl5dyngg'
};

// 🌟 文本內容
const studentText = "教科一A 呂俞錚";

// iframe 相關變數
let contentFrame; 
const iframeScale = 0.8; 

// 選單動畫相關變數
let menuContainer;         
let menuWidth = 180;       
let menuCurrentX = -menuWidth; 
let menuTargetX = -menuWidth;  
const menuSlideThreshold = 100; 

// 🌟 更新：作品樣式配置，使用新的名稱作為 Key
const styles = {
    '單元一作品': {
        background: 0,    
        dotColor: 255     
    },
    '單元一筆記': {
        background: [0, 50, 100], 
        dotColor: [255, 200, 0]   
    },
    '關閉作品': { // 作為動畫模式
        background: 255,   
        dotColor: [200, 0, 0] 
    }
};

let currentWork = '關閉作品'; // 初始為關閉作品，顯示動畫

// The Dot class (保持不變)
class Dot {
  constructor(x, y) {
    this.pos = createVector(x, y); 
    this.origin = this.pos.copy(); 
    this.speed = createVector(0, 0); 
  }
  
  update(m) {
    let mouseToOrigin = this.origin.copy();
    mouseToOrigin.sub(m);
    const d = mouseToOrigin.mag();
    const c = map(d, 0, distThreshold, 0, PI);
    
    mouseToOrigin.normalize();
    mouseToOrigin.mult(distortionAmount * sin(c));
    const target = createVector(this.origin.x + mouseToOrigin.x, this.origin.y + mouseToOrigin.y);

    let strokeWidth;
    if (d < distThreshold) {
      strokeWidth = 1 + 10 * abs(cos(c / 2));
    } else {
      strokeWidth = map(min(d, max(width, height)), 0, max(width, height), 5, 0.1);
    }
    
    let acceleration = this.pos.copy();
    acceleration.sub(target);
    acceleration.mult(-map(m.dist(this.pos), 0, 2 * max(width, height), 0.1, 0.01));
    
    this.speed.add(acceleration);
    this.speed.mult(0.87);
    this.pos.add(this.speed);

    strokeWeight(strokeWidth);
    point(this.pos.x, this.pos.y);
  }
}

// 初始化點陣列，確保置中
function initializeDots() {
    dots = []; 
    const gridDim = numb * step;
    const dx = (width - gridDim) / 2; 
    const dy = (height - gridDim) / 2; 
    
    for (let i = 0; i < numb; i++) {
        dots[i] = [];
        for (let j = 0; j < numb; j++) {
            const x = i * step + dx;
            const y = j * step + dy;
            dots[i][j] = new Dot(x, y);
        }
    }
}

// 核心切換邏輯：控制 iframe
function changeWork(workName) {
    currentWork = workName;

    if (workName === '單元一作品' || workName === '單元一筆記') {
        // 顯示 iframe
        const url = externalLinks[workName];
        contentFrame.src = url;
        contentFrame.style.display = 'block';
    } else if (workName === '關閉作品') {
        // 隱藏 iframe，顯示動畫
        contentFrame.style.display = 'none';
        contentFrame.src = ''; 
    }
}

// 調整 iframe 尺寸的函式
function resizeIframe() {
    if (!contentFrame) return;

    const newWidth = windowWidth * iframeScale;
    const newHeight = windowHeight * iframeScale;

    contentFrame.style.width = newWidth + 'px';
    contentFrame.style.height = newHeight + 'px';
}


// --- p5.js Setup Function ---
function setup() {
  createCanvas(displayWidth, displayHeight); 
  initializeDots();
  
  // 獲取 iframe 元素並調整尺寸
  contentFrame = document.getElementById('contentFrame');
  if (contentFrame) {
      resizeIframe(); 
  }

  // 創建選單容器 (Menu Container)
  menuContainer = createDiv();
  menuContainer.style('width', menuWidth + 'px');
  menuContainer.style('height', '100%'); 
  menuContainer.style('position', 'absolute');
  menuContainer.style('top', '0');
  menuContainer.style('left', menuCurrentX + 'px'); 
  menuContainer.style('background-color', 'rgba(10, 10, 10, 0.8)'); 
  menuContainer.style('padding-top', '50px');
  menuContainer.style('box-shadow', '2px 0 5px rgba(0,0,0,0.5)');
  menuContainer.style('z-index', '1000'); 
  
  // 創建按鈕並添加到容器中
  const buttonNames = Object.keys(styles);
  
  for (let name of buttonNames) {
    let button = createButton(name);
    
    // 設置按鈕樣式
    button.style('display', 'block'); 
    button.style('width', '80%');
    button.style('margin', '15px auto');
    button.style('padding', '10px');
    button.style('background-color', '#555');
    button.style('color', '#FFF');
    button.style('border', 'none');
    button.style('cursor', 'pointer');
    
    // 設置按鈕點擊事件
    button.mousePressed(() => changeWork(name));
    
    // 將按鈕添加到容器中
    menuContainer.child(button);
  }
  
  // 確保初始狀態下 iframe 是隱藏的
  if (contentFrame) {
      contentFrame.style.display = 'none';
  }
}

// --- p5.js Draw Function ---
function draw() {
  // 選單滑動邏輯
  if (mouseX < menuSlideThreshold) {
    menuTargetX = 0; 
  } else {
    menuTargetX = -menuWidth; 
  }
  
  menuCurrentX = lerp(menuCurrentX, menuTargetX, 0.1); 
  menuContainer.style('left', menuCurrentX + 'px');

  // --- 繪製點動畫 ---
  const currentStyle = styles[currentWork];
  
  // 1. 繪製背景
  fill(currentStyle.background);
  noStroke();
  rect(0, 0, width, height); 
  
  // 2. 設定點的顏色
  stroke(currentStyle.dotColor); 

  // 繪製點的動畫
  const m = createVector(mouseX, mouseY);
  for (let i = 0; i < numb; i++) {
    for (let j = 0; j < numb; j++) {
      dots[i][j].update(m);
    }
  }

  // 🌟 新增：在動畫中間添加文字
  if (currentWork === '關閉作品') {
      // 設置文字樣式
      fill(0); // 文字顏色為黑色
      if (currentStyle.background === 255) {
          fill(50); // 如果背景是白色，文字用深灰色
      } else if (Array.isArray(currentStyle.background) && currentStyle.background[0] === 0) {
          fill(255); // 如果背景是深色，文字用白色
      }
      
      textSize(24);
      textAlign(CENTER, CENTER);
      
      // 繪製文字在畫布中心
      text(studentText, width / 2, height / 2 - 100); 
  }
}


/**
 * 處理視窗大小改變
 */
function windowResized() {
  resizeCanvas(displayWidth, displayHeight);
  initializeDots();
  menuContainer.style('height', '100%'); 
  
  resizeIframe();
}