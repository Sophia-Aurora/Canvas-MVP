/**
 * 选区工具功能模块
 * 包含框选、移动、复制功能
 */

// 导入必要的全局变量
import { elements, render, getCanvasCoordinate } from "./canvas.js";
import { cloneElement } from "./main.js";

// 全局变量
let isDraggingSelection = false; // 是否正在拖动画好的选框
let hasSelectionBox = false; // 是否有已经画好的选框
let isDrawingSelection = false; // 是否正在画选区
let startDragX = 0; // 拖拽开始的X坐标
let startDragY = 0; // 拖拽开始的Y坐标
let selectedItems = []; // 选中元素的数组
let copiedElements = []; // 复制的元素数组
let selectionOffsetX = 0; // 鼠标相对于选区左上角的偏移X
let selectionOffsetY = 0; // 鼠标相对于选区左上角的偏移Y

/**
 * 开始框选
 * @param {MouseEvent} e - 鼠标事件对象
 */
export function startSelection(e) {
  if (window.currentTool !== "select") return;

  const { x, y } = getCanvasCoordinate(e);

  // 检查是否点击在已画好的选框内
  if (hasSelectionBox && isPointInSelectionBox(x, y)) {
    // 开始拖动选框
    isDraggingSelection = true;
    startDragX = x;
    startDragY = y;

    // 计算鼠标相对于选区左上角的偏移
    const selectionLeft = Math.min(
      window.selectionArea.startX,
      window.selectionArea.endX,
    );
    const selectionTop = Math.min(
      window.selectionArea.startY,
      window.selectionArea.endY,
    );
    selectionOffsetX = x - selectionLeft;
    selectionOffsetY = y - selectionTop;
  } else {
    // 开始画选区
    hasSelectionBox = false;
    selectedItems = [];
    window.selectionArea.startX = x;
    window.selectionArea.startY = y;
    window.selectionArea.endX = x;
    window.selectionArea.endY = y;
    isDrawingSelection = true;
  }
}

/**
 * 进行框选
 * @param {MouseEvent} e - 鼠标事件对象
 */
export function doSelection(e) {
  if (window.currentTool !== "select") return;

  const { x, y } = getCanvasCoordinate(e);

  if (isDrawingSelection) {
    // 更新选框终点坐标
    window.selectionArea.endX = x;
    window.selectionArea.endY = y;
    render();
  } else if (isDraggingSelection) {
    // 移动选框和选中元素
    moveSelection(x, y);
  }
}

/**
 * 结束框选
 */
export function endSelection() {
  if (window.currentTool !== "select") return;

  if (isDrawingSelection) {
    // 结束画选区
    isDrawingSelection = false;
    hasSelectionBox = true;

    // 计算选框边界
    const left = Math.min(
      window.selectionArea.startX,
      window.selectionArea.endX,
    );
    const top = Math.min(
      window.selectionArea.startY,
      window.selectionArea.endY,
    );
    const right = Math.max(
      window.selectionArea.startX,
      window.selectionArea.endX,
    );
    const bottom = Math.max(
      window.selectionArea.startY,
      window.selectionArea.endY,
    );

    // 计算选框宽度和高度
    const width = right - left;
    const height = bottom - top;

    // 只有当选框有一定大小时才进行选择
    if (width > 5 || height > 5) {
      // 遍历所有元素，检查是否在选框内
      selectedItems = [];
      elements.forEach((element) => {
        const bounds = getElementBounds(element);
        // 检查元素是否与选框相交
        if (isElementInSelection(bounds, left, top, right, bottom)) {
          selectedItems.push(element);
          element.isSelected = true;
        } else {
          element.isSelected = false;
        }
      });
    }
  } else if (isDraggingSelection) {
    // 结束拖动选框
    isDraggingSelection = false;
  }

  render();
}

/**
 * 移动选框和选中元素
 * @param {number} x - 当前鼠标X坐标
 * @param {number} y - 当前鼠标Y坐标
 */
function moveSelection(x, y) {
  // 计算选框移动的偏移量
  const deltaX = x - startDragX;
  const deltaY = y - startDragY;

  // 更新选框坐标
  window.selectionArea.startX += deltaX;
  window.selectionArea.startY += deltaY;
  window.selectionArea.endX += deltaX;
  window.selectionArea.endY += deltaY;

  // 更新选中元素的位置
  selectedItems.forEach((element) => {
    element.x += deltaX;
    element.y += deltaY;
  });

  // 更新起始位置
  startDragX = x;
  startDragY = y;

  render();
}

/**
 * 检查点是否在选框内
 * @param {number} x - 点的X坐标
 * @param {number} y - 点的Y坐标
 * @returns {boolean} - 是否在选框内
 */
function isPointInSelectionBox(x, y) {
  const left = Math.min(window.selectionArea.startX, window.selectionArea.endX);
  const top = Math.min(window.selectionArea.startY, window.selectionArea.endY);
  const right = Math.max(
    window.selectionArea.startX,
    window.selectionArea.endX,
  );
  const bottom = Math.max(
    window.selectionArea.startY,
    window.selectionArea.endY,
  );

  return x >= left && x <= right && y >= top && y <= bottom;
}

/**
 * 检查元素是否在选框内
 * @param {object} bounds - 元素边界
 * @param {number} left - 选框左边界
 * @param {number} top - 选框上边界
 * @param {number} right - 选框右边界
 * @param {number} bottom - 选框下边界
 * @returns {boolean} - 是否在选框内
 */
function isElementInSelection(bounds, left, top, right, bottom) {
  // 检查元素边界是否与选框相交
  return !(
    bounds.x + bounds.width < left ||
    bounds.x > right ||
    bounds.y + bounds.height < top ||
    bounds.y > bottom
  );
}

/**
 * 获取元素的边界框
 * @param {BaseElement} element - 元素
 * @returns {object} - 元素边界
 */
function getElementBounds(element) {
  return element.getBounds();
}

/**
 * 复制选中元素
 */
export function copySelectedElements() {
  // 清空之前的复制
  copiedElements = [];

  // 遍历所有元素，复制选中的
  elements.forEach((element) => {
    if (element.isSelected) {
      const cloned = cloneElement(element);
      copiedElements.push(cloned);
    }
  });
}

/**
 * 粘贴元素
 */
export function pasteElements() {
  if (copiedElements.length === 0) return;

  // 取消所有元素的选中状态
  elements.forEach((element) => {
    element.isSelected = false;
  });

  // 添加复制的元素到画布
  copiedElements.forEach((element) => {
    // 生成新的ID
    element.id = element.generateId();
    // 偏移位置，避免与原元素重叠
    element.x += 20;
    element.y += 20;
    // 标记为选中状态
    element.isSelected = true;
    // 添加到元素数组
    elements.push(element);
    // 添加到选中数组
    selectedItems.push(element);
  });

  render();
}

/**
 * 绘制临时虚线框（拖动时）
 * @param {CanvasRenderingContext2D} ctx - 2D绘图上下文
 * @param {object} selectionArea - 选区对象
 */
export function drawTemporarySelectionBox(ctx, selectionArea) {
  const left = Math.min(selectionArea.startX, selectionArea.endX);
  const top = Math.min(selectionArea.startY, selectionArea.endY);
  const width = Math.abs(selectionArea.endX - selectionArea.startX);
  const height = Math.abs(selectionArea.endY - selectionArea.startY);

  // 绘制半透明背景
  ctx.fillStyle = "rgba(0, 122, 255, 0.2)";
  ctx.fillRect(left, top, width, height);

  // 绘制虚线边框
  ctx.strokeStyle = "rgba(0, 122, 255, 0.8)";
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(left, top, width, height);
  ctx.setLineDash([]);
}

/**
 * 绘制实线框（已画好的选区）
 * @param {CanvasRenderingContext2D} ctx - 2D绘图上下文
 * @param {object} selectionArea - 选区对象
 */
export function drawSolidSelectionBox(ctx, selectionArea) {
  const left = Math.min(selectionArea.startX, selectionArea.endX);
  const top = Math.min(selectionArea.startY, selectionArea.endY);
  const width = Math.abs(selectionArea.endX - selectionArea.startX);
  const height = Math.abs(selectionArea.endY - selectionArea.startY);

  // 绘制半透明背景
  ctx.fillStyle = "rgba(0, 122, 255, 0.2)";
  ctx.fillRect(left, top, width, height);

  // 绘制实线边框
  ctx.strokeStyle = "rgba(0, 122, 255, 0.8)";
  ctx.lineWidth = 1;
  ctx.setLineDash([]);
  ctx.strokeRect(left, top, width, height);
}

/**
 * 绘制选框
 * @param {CanvasRenderingContext2D} ctx - 2D绘图上下文
 */
export function drawSelectionBox(ctx) {
  if (isDrawingSelection) {
    drawTemporarySelectionBox(ctx, window.selectionArea);
  } else if (hasSelectionBox) {
    drawSolidSelectionBox(ctx, window.selectionArea);
  }
}

/**
 * 初始化选区工具
 */
export function initSelectTool() {
  // 绑定键盘事件
  document.addEventListener("keydown", handleKeyDown);
}

/**
 * 处理键盘事件
 * @param {KeyboardEvent} e - 键盘事件对象
 */
function handleKeyDown(e) {
  // 检查是否在文本输入场景
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
    return;
  }

  // 处理Ctrl+C复制
  if (e.ctrlKey && e.key === "c") {
    e.preventDefault();
    copySelectedElements();
  }

  // 处理Ctrl+V粘贴
  if (e.ctrlKey && e.key === "v") {
    e.preventDefault();
    pasteElements();
  }
}

// 导出判断变量，供render函数使用
export { isDraggingSelection, hasSelectionBox };
