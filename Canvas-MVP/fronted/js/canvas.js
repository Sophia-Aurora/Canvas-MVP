/**
 * Canvas 绘图工具 - 初始化代码
 * 用于初始化画布和视图控制变量

 */

//通过等待页面初始化完成后再执行 ，避免了程序崩溃的风险。

import { initToolbars } from "./toolbars.js";
import { elements, currentElement } from "./main.js";

// 全局视图控制变量
let scale = 1; // 缩放比例
let offsetX = 0; // 画布偏移 X
let offsetY = 0; // 画布偏移 Y
let isCanvasDragging = false; // 是否正在拖拽画布
let lastMouseX = 0; // 鼠标按下时的 X 坐标
let lastMouseY = 0; // 鼠标按下时的 Y 坐标

// 画布元素
let canvas = null;
let ctx = null;

// 初始化应用
function initApp() {
  // 初始化画布
  initCanvas();

  // 初始化工具栏（这个在toolbars.js里面）
  initToolbars();

  // 其他初始化代码...
}

// 初始化画布
function initCanvas() {
  // 获取 canvas 元素
  canvas = document.getElementById("canvas");
  if (!canvas) {
    console.error("Canvas element not found!");
    return;
  }

  // 初始化 2D 绘图上下文
  ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("Canvas 2D context not supported!");
    return;
  }

  // 设置画布默认大小
  canvas.width = 1200;
  canvas.height = 800;

  // 初始化视图控制事件
  initViewControls();

  console.log("Canvas initialized successfully!");
}

/**
 * 初始化视图控制事件
 * 包括鼠标拖拽、滚轮缩放和键盘快捷键
 */
function initViewControls() {
  // 鼠标按下事件 - 开始拖拽
  canvas.addEventListener("mousedown", (e) => {
    isCanvasDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    canvas.style.cursor = "grabbing";
  });

  // 鼠标移动事件 - 拖拽画布
  canvas.addEventListener("mousemove", (e) => {
    if (isCanvasDragging) {
      const deltaX = e.clientX - lastMouseX;
      const deltaY = e.clientY - lastMouseY;

      offsetX += deltaX;
      offsetY += deltaY;

      lastMouseX = e.clientX;
      lastMouseY = e.clientY;

      render(); // 重绘画布
    }
  });

  // 鼠标释放事件 - 结束拖拽
  canvas.addEventListener("mouseup", () => {
    isCanvasDragging = false;
    canvas.style.cursor = "grab";
  });

  // 鼠标离开事件 - 结束拖拽
  canvas.addEventListener("mouseleave", () => {
    isCanvasDragging = false;
    canvas.style.cursor = "grab";
  });

  // 滚轮事件 - 缩放画布
  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();

    // 获取鼠标在画布上的坐标
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 计算缩放中心
    const scaleCenterX = (mouseX - offsetX) / scale;
    const scaleCenterY = (mouseY - offsetY) / scale;

    // 缩放比例
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.5, Math.min(2, scale * zoomFactor));

    // 调整偏移量，使缩放以鼠标位置为中心
    const scaleRatio = newScale / scale;
    offsetX = mouseX - scaleCenterX * newScale;
    offsetY = mouseY - scaleCenterY * newScale;

    scale = newScale;
    render(); // 重绘画布
  });

  // 键盘事件 - 快捷键缩放
  document.addEventListener("keydown", (e) => {
    // 只在按下 Ctrl 键时处理
    if (!e.ctrlKey) return;

    e.preventDefault(); // 阻止默认行为

    switch (e.key) {
      case "=":
      case "+":
        // 放大画布
        zoomCanvas(1.1);
        break;
      case "-":
        // 缩小画布
        zoomCanvas(0.9);
        break;
      case "0":
        // 重置缩放
        resetZoom();
        break;
    }
  });
}

/**
 * 缩放画布
 * @param {number} factor - 缩放因子
 */
function zoomCanvas(factor) {
  const newScale = Math.max(0.5, Math.min(2, scale * factor));

  if (newScale !== scale) {
    // 计算缩放中心（画布中心）
    const canvasCenterX = canvas.width / 2;
    const canvasCenterY = canvas.height / 2;
    const scaleCenterX = (canvasCenterX - offsetX) / scale;
    const scaleCenterY = (canvasCenterY - offsetY) / scale;

    // 调整偏移量
    const scaleRatio = newScale / scale;
    offsetX = canvasCenterX - scaleCenterX * newScale;
    offsetY = canvasCenterY - scaleCenterY * newScale;

    scale = newScale;
    render(); // 重绘画布
  }
}

/**
 * 重置缩放为默认值
 */
function resetZoom() {
  scale = 1;
  offsetX = 0;
  offsetY = 0;
  render(); // 重绘画布
}

/**
 * 全局重绘函数
 * 遍历所有元素并进行统一绘制
 */
function render() {
  // 1. 清空整个画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 2. 保存绘图状态
  ctx.save();

  // 3. 应用全局视图变换
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  // 4. 遍历 elements 数组绘制所有元素
  elements.forEach((element) => {
    // 设置透明度
    ctx.globalAlpha = element.opacity ?? 1;

    // 根据元素类型进行绘制
    switch (element.type) {
      case "line":
        // 绘制直线
        break;
      case "rect":
        // 绘制矩形
        break;
      case "circle":
        // 绘制圆形
        break;
      case "ellipse":
        // 绘制椭圆
        break;
      case "triangle":
        // 绘制三角形
        break;
      case "text":
        // 绘制文字
        break;
      case "image":
        // 绘制图片
        break;
      case "pen":
        // 绘制画笔轨迹
        break;
      default:
        break;
    }

    // 绘制选中状态高亮框
    if (element.isSelected) {
      // 保存当前绘图状态
      ctx.save();

      // 设置高亮框样式为蓝色虚线
      ctx.strokeStyle = "#007AFF";
      ctx.lineWidth = 1 / scale;
      ctx.setLineDash([5 / scale, 5 / scale]);

      // 绘制高亮框（基于元素边界）
      const bounds = element.getBounds();
      ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);

      // 恢复绘图状态
      ctx.restore();
    }
  });

  // 5. 恢复绘图状态
  ctx.restore();
}

// 当DOM加载完成后初始化应用
//DOMContentLoaded是DOM树加载完成的事件
//所有元素都加载完成后再执行initApp函数，判断能不能正确获取所有元素
document.addEventListener("DOMContentLoaded", initApp);

// 导出全局变量和初始化函数
// 用于在其他模块中访问和使用画布上下文
export {
  canvas,
  ctx,
  scale,
  offsetX,
  offsetY,
  isCanvasDragging,
  elements,
  currentElement,
  initApp,
  initCanvas,
  render,
};
