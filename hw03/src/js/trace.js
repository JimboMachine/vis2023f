/*
Code reference from https://github.com/yungpei/vis2023f
*/

const icon = document.getElementById('icon');
const jsonUrl = '../json/userLocationData.json';
const traceContainer = document.getElementById('trace-container'); // 假設有一個元素用於容納移動痕跡
let currentIndex = 0;
let currentFloor = '1F'; // 新增 currentFloor 變數

function calculatePosition(x, y) {
  const minX = 4.34;
  const maxX = 48.74;
  const minY = -26.62;
  const maxY = 15.91;

  // 縮放到 0-1 之間
  const iconX = (x - minX) / (maxX - minX);
  const iconY = (y - minY) / (maxY - minY);

  return { x: iconX, y: iconY };
}

function updateIconPosition(x, y) {
  const { x: iconX, y: iconY } = calculatePosition(x, y);

  // 計算 icon 的位置
  let maxWidth = grid.offsetWidth / 2;
  let maxHeight = grid.offsetHeight / 2;
  let locationX = maxWidth * iconX;
  let locationY = maxHeight * iconY;

  // 切換樓層時，重新計算位置
  switch (currentFloor) {
    case "2F":
      {
        locationX += maxWidth;
        break;
      }
    case "3F":
      {
        locationY += maxHeight;
        break;
      }
    case "4F":
      {
        locationX += maxWidth;
        locationY += maxHeight;
        break;
      }
    }

  // 更新 icon 位置
  icon.style.left = `${locationX}px`;
  icon.style.top = `${locationY}px`;

  // 繪製移動痕跡
  const tracePoint = document.createElement('div');
  tracePoint.className = 'trace-point';
  tracePoint.style.left = `${locationX}px`;//`${iconX}%`;
  tracePoint.style.top = `${locationY}px`;//`${iconY}%`;
  traceContainer.appendChild(tracePoint);
}

function loadAndTraceUserLoc() {
  fetch(jsonUrl)
    .then(response => response.json())
    .then(data => {
      data = data["dataList"];

      if (data && data.length > 0) {
        const point = data[currentIndex];

        if (point.Floor !== currentFloor) {
          // 換樓層時的處理，這裡可以添加你的樓層切換相關邏輯
          console.log(`Switched to Floor ${point.Floor}`);
          currentFloor = point.Floor;
        }

        updateIconPosition(point.X, point.Y);
        currentIndex++;

        // 如果資料到達末尾，重新從頭開始
        if (currentIndex >= data.length) {
          currentIndex = 0;
          traceContainer.innerHTML = '';
        }
      }
    })
    .catch(error => console.error('Error fetching or parsing JSON:', error));
}

// 每秒更新一次位置
setInterval(loadAndTraceUserLoc, 1000);