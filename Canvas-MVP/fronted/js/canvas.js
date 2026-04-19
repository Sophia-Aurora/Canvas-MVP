/**
 * Canvas 绘图工具 - 初始化代码
 * 用于初始化画布和视图控制变量

 */

//通过等待页面初始化完成后再执行 ，避免了程序崩溃的风险。

import { initToolbars } from "./toolbars.js";
import { elements, currentElement } from "./main.js";
import {
  initGraphDrawing,
  drawRectElement,
  drawLineElement,
  drawCircleElement,
  drawEllipseElement,
  drawTriangleElement,
} from "./graph.js";
import { drawImageElement } from "./photo.js";

// 全局视图控制变量
let scale = 1; // 缩放比例
let offsetX = 0; // 画布偏移 X
let offsetY = 0; // 画布偏移 Y
let isCanvasDragging = false; // 是否正在拖拽画布
let isDrawing = false; // 是否正在绘制
let lastMouseX = 0; // 鼠标按下时的 X 坐标
let lastMouseY = 0; // 鼠标按下时的 Y 坐标
let currentTool = null; // 当前选中的工具，null 表示未选中

// 暴露 currentTool 到全局作用域，供 toolbars.js 使用
window.currentTool = currentTool;

// 暴露 isSidebarOpen 到全局作用域，用于控制画布拖拽
window.isSidebarOpen = false;

// 画布元素
let canvas = null;
let ctx = null;

/**
 * 将鼠标事件坐标转换为画布实际逻辑坐标
 * 用于解决因画布缩放、平移导致的鼠标位置与画布实际坐标错位问题
 * @param {MouseEvent} e - 鼠标事件对象
 * @returns {{x: number, y: number}} 转换后的画布坐标
 */
function getCanvasCoordinate(e) {
  // 获取canvas元素在浏览器窗口的位置信息
  // 这里的画布说的是我们在页面上可以看到的，有高度有宽度的矩形区域
  const rect = canvas.getBoundingClientRect();
  // client是鼠标相对于浏览器的位置，减去rect.left得到鼠标相对于可以看得见的这块画布左边的位置
  //rect.left是画布左边到窗口左边的距离
  //计算鼠标在canvas元素内的原始像素位置
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  return {
    //减去offset是消除画布平移的影响
    //offset是拖拽的距离
    //得到的是实际相对于画布的坐标
    x: (mouseX - offsetX) / scale,
    y: (mouseY - offsetY) / scale,
  };
}

// 初始化应用
function initApp() {
  // 初始化画布
  initCanvas();

  // 初始化工具栏（这个在toolbars.js里面）
  initToolbars();

  // 自动创建临时画布
  if (!window.currentCanvasId) {
    window.currentCanvasId = "temp-" + Date.now();
    window.currentCanvasName = "";
    console.log("自动创建临时画布:", window.currentCanvasId);
  }

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

  // 初始化图形绘制事件
  initGraphDrawing(canvas);

  console.log("Canvas initialized successfully!");
}

/**
 * 初始化视图控制事件
 * 包括鼠标拖拽、滚轮缩放和键盘快捷键
 */
function initViewControls() {
  // 鼠标按下事件 - 开始拖拽
  canvas.addEventListener("mousedown", (e) => {
    // 只有未选中工具、左侧面板未打开、且未发生拖拽时才允许拖动画布
    if (
      window.currentTool === null &&
      !window.isSidebarOpen &&
      !window.isDrawing
    ) {
      isCanvasDragging = true;
      //记录 当前鼠标的 X 坐标和 Y 坐标（相对于浏览器可视区）
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      canvas.style.cursor = "grabbing";
    }
  });

  // 鼠标移动事件 - 拖拽画布
  canvas.addEventListener("mousemove", (e) => {
    // 只有未选中工具且正在拖拽时才执行
    if (window.currentTool === null && isCanvasDragging) {
      const deltaX = e.clientX - lastMouseX;
      const deltaY = e.clientY - lastMouseY;

      // 相对于当前触发事件的元素的左上角（在这里是canvas）
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
    isDrawing = false;
    canvas.style.cursor = window.currentTool === null ? "grab" : "default";
  });

  // 鼠标离开画布事件 - 结束拖拽
  canvas.addEventListener("mouseleave", () => {
    isCanvasDragging = false;
    isDrawing = false;
    canvas.style.cursor = window.currentTool === null ? "grab" : "default";
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
    //e.deltaY 是鼠标滚轮的滚动值
    //deltaY>0表示滚轮向上滚，<0表示滚轮向下滚
    //每滚动一次，就缩放固定值
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    //计算新的缩放比例
    //添加限制
    //如果要无限就写const newScale = scale * zoomFactor;
    //无限缩放可能会影响绘制图形的坐标变换
    const newScale = Math.max(0.1, Math.min(10, scale * zoomFactor));

    // 调整偏移量，使缩放以鼠标位置为中心
    //计算新的缩放比例与旧缩放比例的比值
    const scaleRatio = newScale / scale;
    //mouse是屏幕坐标
    //scalecenter是鼠标在画布上的原始位置（缩放前的坐标）
    offsetX = mouseX - scaleCenterX * newScale;
    offsetY = mouseY - scaleCenterY * newScale;

    scale = newScale;
    //然后重绘，在这里才是把画面中的元素变大变小
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
    //？？是空值合并操作符（如果左侧是 null/undefined，就用右侧的值）
    ctx.globalAlpha = element.opacity ?? 1;

    // 根据元素类型进行绘制
    switch (element.type) {
      //这些都是自定义函数哦
      case "line":
        // 绘制直线
        drawLineElement(ctx, element);
        break;
      case "rect":
        // 绘制矩形
        drawRectElement(ctx, element);
        break;
      case "circle":
        // 绘制圆形
        drawCircleElement(ctx, element);
        break;
      case "ellipse":
        // 绘制椭圆
        drawEllipseElement(ctx, element);
        break;
      case "triangle":
        // 绘制三角形
        drawTriangleElement(ctx, element);
        break;
      case "text":
        // 绘制文字
        break;
      case "image":
        // 绘制图片
        drawImageElement(ctx, element);
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
  //就是恢复画笔的状态，把缩放值啥的都变成0，避免累加
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
  currentTool,
  elements,
  currentElement,
  initApp,
  initCanvas,
  render,
  getCanvasCoordinate,
};
