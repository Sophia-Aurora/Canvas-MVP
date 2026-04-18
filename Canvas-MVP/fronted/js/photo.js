/**
 * Canvas 绘图工具 - 图片功能
 * 用于实现图片插入与属性编辑功能
 */

import { createElement, elements, ElementManager } from "./main.js";
import { render, canvas } from "./canvas.js";

/**
 * 处理图片文件选择
 * @param {File} file - 选中的图片文件
 */
export function handleImageFile(file) {
  // 检查文件大小（≤5MB）
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    alert("图片大小不能超过5MB");
    return;
  }

  // 检查文件类型
  const validTypes = ["image/png", "image/jpeg", "image/jpg"];
  if (!validTypes.includes(file.type)) {
    alert("只支持PNG、JPG格式的图片");
    return;
  }

  // 创建FormData对象
  const formData = new FormData();
  formData.append("image", file);

  // 调用后端接口上传图片
  fetch("http://localhost:3000/assets/images", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.code === 200) {
        // 上传成功，创建图片元素
        const img = new Image();
        img.onload = function () {
          // 创建图片元素
          const imageElement = createElement("image");
          imageElement.setImageSrc(data.url);
          imageElement.setImage(img);

          // 计算画布中心位置
          const centerX = canvas.width / 2 / 1; // 假设缩放比例为1
          const centerY = canvas.height / 2 / 1;

          // 设置图片位置为画布中心
          imageElement.setPosition(
            centerX - img.width / 2,
            centerY - img.height / 2,
          );

          // 添加到元素数组
          ElementManager.add(imageElement);

          // 选中当前图片元素
          elements.forEach((el) => el.deselect());
          imageElement.select();
          window.currentElement = imageElement;

          // 重绘画布
          render();

          // 初始化图片属性编辑事件
          initImageProperties(imageElement);

          // 清空文件选择框
          const fileInput = document.getElementById("fileInput");
          if (fileInput) {
            fileInput.value = "";
          }
        };
        img.src = data.url;
      } else {
        // 上传失败
        alert("图片上传失败: " + (data.message || "未知错误"));
      }
    })
    .catch((error) => {
      // 网络错误
      alert("上传失败，请检查网络连接");
      console.error("上传错误:", error);
    });
}

/**
 * 初始化图片属性编辑事件
 * @param {ImageElement} imageElement - 图片元素
 */
export function initImageProperties(imageElement) {
  // 获取图片属性面板中的控件
  const widthInput = document.getElementById("imageWidth");
  const heightInput = document.getElementById("imageHeight");
  const opacityInput = document.getElementById("imageOpacity");
  const filterSelect = document.getElementById("imageFilter");
  const filterValueInput = document.getElementById("imageFilterValue");

  // 初始化控件值
  if (widthInput) widthInput.value = imageElement.width;
  if (heightInput) heightInput.value = imageElement.height;
  if (opacityInput) opacityInput.value = imageElement.opacity * 100;
  if (filterSelect) filterSelect.value = imageElement.filterType;
  if (filterValueInput) filterValueInput.value = imageElement.filterValue;

  // 宽度调整事件
  if (widthInput) {
    widthInput.addEventListener("input", function () {
      const width = parseFloat(this.value);
      if (!isNaN(width)) {
        imageElement.width = width;
        render();
      }
    });
  }

  // 高度调整事件
  if (heightInput) {
    heightInput.addEventListener("input", function () {
      const height = parseFloat(this.value);
      if (!isNaN(height)) {
        imageElement.height = height;
        render();
      }
    });
  }

  // 透明度调整事件
  if (opacityInput) {
    opacityInput.addEventListener("input", function () {
      const opacity = parseFloat(this.value) / 100;
      if (!isNaN(opacity)) {
        imageElement.setOpacity(opacity);
        render();
      }
    });
  }

  // 滤镜类型选择事件
  if (filterSelect) {
    filterSelect.addEventListener("change", function () {
      imageElement.filterType = this.value;
      render();
    });
  }

  // 滤镜值调整事件
  if (filterValueInput) {
    filterValueInput.addEventListener("input", function () {
      const value = parseFloat(this.value);
      if (!isNaN(value)) {
        imageElement.filterValue = value;
        render();
      }
    });
  }
}

/**
 * 绘制图片元素
 * @param {CanvasRenderingContext2D} ctx - 2D 绘图上下文
 * @param {ImageElement} element - 图片元素
 */
export function drawImageElement(ctx, element) {
  if (element.img) {
    ctx.save();
    // 应用滤镜
    if (element.getFilterString() && element.getFilterString() !== "none") {
      ctx.filter = element.getFilterString();
    }
    // 绘制图片
    ctx.drawImage(
      element.img,
      element.x,
      element.y,
      element.width,
      element.height,
    );
    ctx.restore();
  }
}
