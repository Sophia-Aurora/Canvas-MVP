/**
 * Canvas 绘图工具 - 图形绘制功能
 * 用于实现各种图形的绘制逻辑
 */

import { elements, currentElement, createElement } from "./main.js";
import { render, getCanvasCoordinate } from "./canvas.js";

// 绘制状态变量
window.isDrawing = false;
let lastMouseX = 0;
let lastMouseY = 0;
let startDrawX = 0; // 记录绘制开始时的鼠标位置
let startDrawY = 0;
let hasDragged = false; // 标记是否发生了拖拽（用于判断是单击还是拖拽）
let originalRectWidth = 0; // 矩形原始宽度（用于大小滑块）
let originalRectHeight = 0; // 矩形原始高度（用于大小滑块）

/**
 * 初始化图形绘制事件
 * @param {HTMLCanvasElement} canvas - canvas 元素
 */
export function initGraphDrawing(canvas) {
  // 初始化矩形属性事件监听
  initRectPropertyEvents();

  // 鼠标按下事件 - 开始绘制
  canvas.addEventListener("mousedown", (e) => {
    switch (window.currentTool) {
      case "rect":
        startDrawingRect(e);
        break;
      case "line":
        startDrawingLine(e);
        break;
      case "circle":
        startDrawingCircle(e);
        break;
      case "ellipse":
        startDrawingEllipse(e);
        break;
      case "triangle":
        startDrawingTriangle(e);
        break;
    }
  });

  // 鼠标移动事件 - 绘制过程
  canvas.addEventListener("mousemove", (e) => {
    if (window.isDrawing) {
      switch (window.currentTool) {
        case "rect":
          drawRect(e);
          break;
        case "line":
          drawLine(e);
          break;
        case "circle":
          drawCircle(e);
          break;
        case "ellipse":
          drawEllipse(e);
          break;
        case "triangle":
          drawTriangle(e);
          break;
      }
    }
  });

  // 鼠标释放事件 - 结束绘制
  canvas.addEventListener("mouseup", () => {
    window.isDrawing = false;
  });

  // 鼠标离开画布事件 - 结束绘制
  canvas.addEventListener("mouseleave", () => {
    window.isDrawing = false;
  });

  // 画布点击事件 - 检查是否点击在空白区域
  canvas.addEventListener("click", (e) => {
    // 只有在非绘制状态、有选中工具且没有发生拖拽时才处理
    if (!window.isDrawing && window.currentTool !== null && !hasDragged) {
      const { x, y } = getCanvasCoordinate(e);
      // 检查是否点击在任何元素上
      const clickedElement = elements.find((element) => {
        const rectX = element.width < 0 ? element.x + element.width : element.x;
        const rectY =
          element.height < 0 ? element.y + element.height : element.y;
        const rectWidth = Math.abs(element.width);
        const rectHeight = Math.abs(element.height);
        return (
          x >= rectX &&
          x <= rectX + rectWidth &&
          y >= rectY &&
          y <= rectY + rectHeight
        );
      });

      // 如果没有点击在任何元素上，则取消所有元素的选中状态
      if (!clickedElement) {
        // 取消所有元素的选中状态
        elements.forEach((element) => {
          element.isSelected = false;
        });
        window.currentElement = null;
        render();
      }
    }
    // 重置拖拽标记
    hasDragged = false;
  });
}

/**
 * 初始化矩形属性事件监听
 * 绑定左侧面板属性控件到当前矩形元素
 */
function initRectPropertyEvents() {
  const shapeColorGrid = document.getElementById("shapeColorGrid");
  const shapeColorTabs = document.querySelectorAll(
    "#shapeColorSection .color-tab",
  );
  const opacitySlider = document.getElementById("opacitySlider");
  const borderWidthSlider = document.getElementById("borderWidthSlider");

  let currentColorTab = "stroke";

  // 边框/填充切换
  shapeColorTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      shapeColorTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentColorTab = tab.dataset.tab;
    });
  });

  // 颜色选择
  if (shapeColorGrid) {
    const colorItems = shapeColorGrid.querySelectorAll(".color-item");
    colorItems.forEach((item) => {
      item.addEventListener("click", () => {
        // 移除同组其他颜色项的active状态
        colorItems.forEach((other) => other.classList.remove("active"));
        // 添加当前颜色项的active状态
        item.classList.add("active");

        // 更新当前元素的颜色属性
        if (window.currentElement) {
          const color = item.dataset.color;
          if (currentColorTab === "stroke") {
            window.currentElement.strokeColor = color;
          } else {
            window.currentElement.fillColor = color;
          }
          render();
        }
      });
    });
  }

  // 透明度滑块
  if (opacitySlider) {
    opacitySlider.addEventListener("input", () => {
      const opacityValue = document.getElementById("opacityValue");
      if (opacityValue) {
        opacityValue.textContent = opacitySlider.value + "%";
      }

      if (window.currentElement) {
        window.currentElement.opacity = opacitySlider.value / 100;
        render();
      }
    });
  }

  // 边框宽度滑块
  if (borderWidthSlider) {
    borderWidthSlider.addEventListener("input", () => {
      const borderWidthValue = document.getElementById("borderWidthValue");
      if (borderWidthValue) {
        borderWidthValue.textContent = borderWidthSlider.value + "px";
      }

      if (window.currentElement) {
        window.currentElement.lineWidth = parseInt(borderWidthSlider.value);
        render();
      }
    });
  }

  // 大小滑块
  const sizeSlider = document.getElementById("sizeSlider");
  if (sizeSlider) {
    // 当开始绘制图形时，记录原始尺寸
    const recordOriginalSize = () => {
      if (window.currentElement) {
        originalRectWidth = window.currentElement.width;
        originalRectHeight = window.currentElement.height;
      }
    };

    sizeSlider.addEventListener("mousedown", recordOriginalSize);
    sizeSlider.addEventListener("touchstart", recordOriginalSize);

    sizeSlider.addEventListener("input", () => {
      const sizeValue = document.getElementById("sizeValue");
      if (sizeValue) {
        sizeValue.textContent = sizeSlider.value + "%";
      }

      if (window.currentElement) {
        // 如果还没有记录过原始尺寸，先记录
        if (originalRectWidth === 0 && originalRectHeight === 0) {
          originalRectWidth = window.currentElement.width;
          originalRectHeight = window.currentElement.height;
        }

        const scale = parseInt(sizeSlider.value) / 100;
        window.currentElement.width = originalRectWidth * scale;
        window.currentElement.height = originalRectHeight * scale;
        render();
      }
    });
  }
}

/**
 * 开始绘制矩形
 * @param {MouseEvent} e - 鼠标事件对象
 */
function startDrawingRect(e) {
  window.isDrawing = true;
  hasDragged = false;
  // 获取画布坐标
  const { x, y } = getCanvasCoordinate(e);
  // 记录起点
  lastMouseX = x;
  lastMouseY = y;
  startDrawX = x;
  startDrawY = y;
  // 创建矩形元素
  window.currentElement = createElement("rect");
  window.currentElement.setPosition(x, y);
  // 重置原始尺寸（用于大小滑块）
  originalRectWidth = 0;
  originalRectHeight = 0;
  // 不自动选中，不显示虚线框
  window.currentElement.isSelected = false;
  // 添加到元素数组
  elements.push(window.currentElement);
  // 重绘画布
  render();
}

/**
 * 绘制矩形过程
 * @param {MouseEvent} e - 鼠标事件对象
 */
function drawRect(e) {
  // 实时更新矩形大小
  const { x, y } = getCanvasCoordinate(e);
  const width = x - lastMouseX;
  const height = y - lastMouseY;

  // 标记发生了拖拽
  hasDragged = true;

  // 更新当前元素
  if (window.currentElement) {
    window.currentElement.width = width;
    window.currentElement.height = height;
    // 重绘画布
    render();
  }
}

/**
 * 绘制矩形
 * @param {CanvasRenderingContext2D} ctx - 2D 绘图上下文
 * @param {object} element - 矩形元素
 */
export function drawRectElement(ctx, element) {
  ctx.beginPath();
  // 处理负数宽度和高度的情况
  const rectX = element.width < 0 ? element.x + element.width : element.x;
  const rectY = element.height < 0 ? element.y + element.height : element.y;
  const rectWidth = Math.abs(element.width);
  const rectHeight = Math.abs(element.height);
  ctx.rect(rectX, rectY, rectWidth, rectHeight);
  // 绘制边框
  ctx.strokeStyle = element.strokeColor || "#8B9CAF";
  ctx.lineWidth = element.lineWidth || 2;
  ctx.stroke();
  // 绘制填充
  if (element.fillColor && element.fillColor !== "transparent") {
    ctx.fillStyle = element.fillColor;
    ctx.fill();
  }
}

/**
 * 绘制直线
 * @param {CanvasRenderingContext2D} ctx - 2D 绘图上下文
 * @param {object} element - 直线元素
 */
export function drawLineElement(ctx, element) {
  ctx.beginPath();
  ctx.moveTo(element.x, element.y);
  ctx.lineTo(element.x + element.width, element.y + element.height);
  // 绘制边框
  ctx.strokeStyle = element.strokeColor || "#8B9CAF";
  ctx.lineWidth = element.lineWidth || 2;
  ctx.stroke();
}

/**
 * 绘制圆形
 * @param {CanvasRenderingContext2D} ctx - 2D 绘图上下文
 * @param {object} element - 圆形元素
 */
export function drawCircleElement(ctx, element) {
  ctx.beginPath();
  // 使用元素的宽度作为直径（因为我们已经确保宽高相等）
  const diameter = Math.abs(element.width);
  const radius = diameter / 2;
  // 计算元素的中心位置作为圆心
  const centerX = element.x + Math.abs(element.width) / 2;
  const centerY = element.y + Math.abs(element.height) / 2;
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  // 绘制边框
  ctx.strokeStyle = element.strokeColor || "#8B9CAF";
  ctx.lineWidth = element.lineWidth || 2;
  ctx.stroke();
  // 绘制填充
  if (element.fillColor && element.fillColor !== "transparent") {
    ctx.fillStyle = element.fillColor;
    ctx.fill();
  }
}

/**
 * 绘制椭圆
 * @param {CanvasRenderingContext2D} ctx - 2D 绘图上下文
 * @param {object} element - 椭圆元素
 */
export function drawEllipseElement(ctx, element) {
  ctx.beginPath();
  const radiusX = Math.abs(element.width) / 2;
  const radiusY = Math.abs(element.height) / 2;
  const centerX = element.x + radiusX;
  const centerY = element.y + radiusY;
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
  // 绘制边框
  ctx.strokeStyle = element.strokeColor || "#8B9CAF";
  ctx.lineWidth = element.lineWidth || 2;
  ctx.stroke();
  // 绘制填充
  if (element.fillColor && element.fillColor !== "transparent") {
    ctx.fillStyle = element.fillColor;
    ctx.fill();
  }
}

/**
 * 绘制三角形
 * @param {CanvasRenderingContext2D} ctx - 2D 绘图上下文
 * @param {object} element - 三角形元素
 */
export function drawTriangleElement(ctx, element) {
  ctx.beginPath();
  const rectWidth = Math.abs(element.width);
  const rectHeight = Math.abs(element.height);
  const rectX = element.width < 0 ? element.x + element.width : element.x;
  const rectY = element.height < 0 ? element.y + element.height : element.y;
  // 绘制等腰三角形
  ctx.moveTo(rectX + rectWidth / 2, rectY);
  ctx.lineTo(rectX + rectWidth, rectY + rectHeight);
  ctx.lineTo(rectX, rectY + rectHeight);
  ctx.closePath();
  // 绘制边框
  ctx.strokeStyle = element.strokeColor || "#8B9CAF";
  ctx.lineWidth = element.lineWidth || 2;
  ctx.stroke();
  // 绘制填充
  if (element.fillColor && element.fillColor !== "transparent") {
    ctx.fillStyle = element.fillColor;
    ctx.fill();
  }
}

/**
 * 开始绘制直线
 * @param {MouseEvent} e - 鼠标事件对象
 */
function startDrawingLine(e) {
  window.isDrawing = true;
  hasDragged = false;
  // 获取画布坐标
  const { x, y } = getCanvasCoordinate(e);
  // 记录起点
  lastMouseX = x;
  lastMouseY = y;
  startDrawX = x;
  startDrawY = y;
  // 创建直线元素
  window.currentElement = createElement("line");
  window.currentElement.setPosition(x, y);
  // 不自动选中，不显示虚线框
  window.currentElement.isSelected = false;
  // 添加到元素数组
  elements.push(window.currentElement);
  // 重绘画布
  render();
}

/**
 * 绘制直线过程
 * @param {MouseEvent} e - 鼠标事件对象
 */
function drawLine(e) {
  // 实时更新直线终点
  const { x, y } = getCanvasCoordinate(e);
  const width = x - lastMouseX;
  const height = y - lastMouseY;

  // 标记发生了拖拽
  hasDragged = true;

  // 更新当前元素
  if (window.currentElement) {
    window.currentElement.width = width;
    window.currentElement.height = height;
    // 重绘画布
    render();
  }
}

/**
 * 开始绘制圆形
 * @param {MouseEvent} e - 鼠标事件对象
 */
function startDrawingCircle(e) {
  window.isDrawing = true;
  hasDragged = false;
  // 获取画布坐标
  const { x, y } = getCanvasCoordinate(e);
  // 记录起点
  lastMouseX = x;
  lastMouseY = y;
  startDrawX = x;
  startDrawY = y;
  // 创建圆形元素
  window.currentElement = createElement("circle");
  // 初始位置暂时设置为起点，后续会在drawCircle中更新
  window.currentElement.setPosition(x, y);
  window.currentElement.width = 0;
  window.currentElement.height = 0;
  // 不自动选中，不显示虚线框
  window.currentElement.isSelected = false;
  // 添加到元素数组
  elements.push(window.currentElement);
  // 重绘画布
  render();
}

/**
 * 绘制圆形过程
 * @param {MouseEvent} e - 鼠标事件对象
 */
function drawCircle(e) {
  // 实时更新圆形大小
  const { x, y } = getCanvasCoordinate(e);

  // 计算鼠标与起点的距离
  const deltaX = x - startDrawX;
  const deltaY = y - startDrawY;

  // 计算直径（使用宽高中的最大值，与其他图形保持一致）
  const diameter = Math.max(Math.abs(deltaX), Math.abs(deltaY));

  // 标记发生了拖拽
  hasDragged = true;

  // 更新当前元素，与其他图形保持一致的绘制逻辑
  if (window.currentElement) {
    // 保持元素位置为鼠标按下的位置
    // 设置元素宽高为直径
    window.currentElement.width = deltaX >= 0 ? diameter : -diameter;
    window.currentElement.height = deltaY >= 0 ? diameter : -diameter;
    // 重绘画布
    render();
  }
}

/**
 * 开始绘制椭圆
 * @param {MouseEvent} e - 鼠标事件对象
 */
function startDrawingEllipse(e) {
  window.isDrawing = true;
  hasDragged = false;
  // 获取画布坐标
  const { x, y } = getCanvasCoordinate(e);
  // 记录起点
  lastMouseX = x;
  lastMouseY = y;
  startDrawX = x;
  startDrawY = y;
  // 创建椭圆元素
  window.currentElement = createElement("ellipse");
  window.currentElement.setPosition(x, y);
  // 不自动选中，不显示虚线框
  window.currentElement.isSelected = false;
  // 添加到元素数组
  elements.push(window.currentElement);
  // 重绘画布
  render();
}

/**
 * 绘制椭圆过程
 * @param {MouseEvent} e - 鼠标事件对象
 */
function drawEllipse(e) {
  // 实时更新椭圆大小
  const { x, y } = getCanvasCoordinate(e);
  const width = x - lastMouseX;
  const height = y - lastMouseY;

  // 标记发生了拖拽
  hasDragged = true;

  // 更新当前元素
  if (window.currentElement) {
    window.currentElement.width = width;
    window.currentElement.height = height;
    // 重绘画布
    render();
  }
}

/**
 * 开始绘制三角形
 * @param {MouseEvent} e - 鼠标事件对象
 */
function startDrawingTriangle(e) {
  window.isDrawing = true;
  hasDragged = false;
  // 获取画布坐标
  const { x, y } = getCanvasCoordinate(e);
  // 记录起点
  lastMouseX = x;
  lastMouseY = y;
  startDrawX = x;
  startDrawY = y;
  // 创建三角形元素
  window.currentElement = createElement("triangle");
  window.currentElement.setPosition(x, y);
  // 不自动选中，不显示虚线框
  window.currentElement.isSelected = false;
  // 添加到元素数组
  elements.push(window.currentElement);
  // 重绘画布
  render();
}

/**
 * 绘制三角形过程
 * @param {MouseEvent} e - 鼠标事件对象
 */
function drawTriangle(e) {
  // 实时更新三角形大小
  const { x, y } = getCanvasCoordinate(e);
  const width = x - lastMouseX;
  const height = y - lastMouseY;

  // 标记发生了拖拽
  hasDragged = true;

  // 更新当前元素
  if (window.currentElement) {
    window.currentElement.width = width;
    window.currentElement.height = height;
    // 重绘画布
    render();
  }
}
