/**
 * 文字工具模块
 * 用于文字的创建、编辑和渲染
 */

import { elements, currentElement, TextElement } from "./main.js";
import { render, getCanvasCoordinate, canvas } from "./canvas.js";

/**
 * 绘制文字元素
 * @param {CanvasRenderingContext2D} ctx - 画布上下文
 * @param {TextElement} element - 文字元素
 */
export function drawTextElement(ctx, element) {
  // 保存当前绘图状态
  ctx.save();

  // 设置文字样式
  const fontStyle = element.getFontStyle();
  ctx.font = `${fontStyle} ${element.fontSize}px ${element.fontFamily}`;
  ctx.fillStyle = element.fontColor;
  ctx.textBaseline = "top";

  // 绘制文字
  if (element.content) {
    ctx.fillText(element.content, element.x, element.y);
  }

  // 恢复绘图状态
  ctx.restore();
}

/**
 * 开始创建文字
 * @param {MouseEvent} e - 鼠标事件对象
 */
export function startCreatingText(e) {
  const { x, y } = getCanvasCoordinate(e);

  // 创建新的文字元素
  const textElement = new TextElement();
  textElement.setPosition(x, y);
  textElement.setContent("双击编辑文字");

  // 添加到元素数组
  elements.push(textElement);

  // 设置为当前元素
  currentElement = textElement;

  // 重绘画布
  render();
}

/**
 * 编辑文字内容
 * @param {TextElement} element - 文字元素
 */
function editText(element) {
  // 创建输入框元素
  const input = document.createElement("input");
  input.type = "text";
  input.value = element.content;
  input.style.position = "absolute";
  input.style.left = `${element.x}px`;
  input.style.top = `${element.y}px`;
  input.style.fontSize = `${element.fontSize}px`;
  input.style.fontFamily = element.fontFamily;
  input.style.color = element.fontColor;
  input.style.border = "1px solid #007AFF";
  input.style.padding = "2px";
  input.style.background = "rgba(255, 255, 255, 0.9)";
  input.style.zIndex = "1000";
  input.style.outline = "none";

  // 添加到画布容器
  canvas.parentElement.appendChild(input);

  // 聚焦并全选文字
  input.focus();
  input.select();

  // 处理输入框事件
  input.addEventListener("blur", () => {
    // 更新文字内容
    element.content = input.value;
    // 移除输入框
    canvas.parentElement.removeChild(input);
    // 重绘画布
    render();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      // 阻止默认行为，避免触发其他事件
      e.preventDefault();
      // 按回车键确认编辑
      input.blur();
    } else if (e.key === "Escape") {
      // 阻止默认行为
      e.preventDefault();
      // 按 ESC 键取消编辑
      canvas.parentElement.removeChild(input);
    }
  });
}

/**
 * 检查是否点击在文字元素上
 * @param {MouseEvent} e - 鼠标事件对象
 * @returns {TextElement|null} - 文字元素或null
 */
export function getTextElementAtPosition(e) {
  const { x, y } = getCanvasCoordinate(e);

  // 从后往前遍历，优先选择上层元素
  for (let i = elements.length - 1; i >= 0; i--) {
    const element = elements[i];
    if (element.type === "text") {
      // 计算文字边界
      const bounds = element.getBounds();
      if (
        x >= bounds.x - 5 &&
        x <= bounds.x + bounds.width + 5 &&
        y >= bounds.y - 5 &&
        y <= bounds.y + bounds.height + 5
      ) {
        return element;
      }
    }
  }
  return null;
}

/**
 * 处理文字双击事件
 * @param {MouseEvent} e - 鼠标事件对象
 */
export function handleTextDoubleClick(e) {
  const textElement = getTextElementAtPosition(e);
  if (textElement) {
    editText(textElement);
  }
}

/**
 * 初始化文字工具
 */
export function initTextTool() {
  // 添加文字双击事件监听器
  canvas.addEventListener("dblclick", handleTextDoubleClick);
}
