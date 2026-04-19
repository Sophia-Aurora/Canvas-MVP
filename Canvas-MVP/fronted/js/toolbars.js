// 工具栏功能实现

import { currentTool } from "./canvas.js";

// 获取DOM元素
const toolButtons = document.querySelectorAll(".tool-btn");
const propertiesPanel = document.getElementById("propertiesPanel");
const shapeSidebar = document.getElementById("shapeSidebar");
const textSidebar = document.getElementById("textSidebar");
const imageSidebar = document.getElementById("imageSidebar");
const penSidebar = document.getElementById("penSidebar");
const fileSidebar = document.getElementById("fileSidebar");
const fileDialog = document.getElementById("fileDialog");
const errorToast = document.getElementById("errorToast");
const fileInput = document.getElementById("fileInput");
const cancelBtn = document.getElementById("cancelBtn");
const confirmBtn = document.getElementById("confirmBtn");
const newCanvasBtn = document.getElementById("newCanvasBtn");
const saveCanvasBtn = document.getElementById("saveCanvasBtn");
const openCanvasBtn = document.getElementById("openCanvasBtn");
const canvasListDialog = document.getElementById("canvasListDialog");
const canvasList = document.getElementById("canvasList");
const closeCanvasListBtn = document.getElementById("closeCanvasListBtn");
const newCanvasDialog = document.getElementById("newCanvasDialog");
const canvasNameInput = document.getElementById("canvasNameInput");
const closeNewCanvasBtn = document.getElementById("closeNewCanvasBtn");
const cancelNewCanvasBtn = document.getElementById("cancelNewCanvasBtn");
const confirmNewCanvasBtn = document.getElementById("confirmNewCanvasBtn");

// 初始化工具栏事件监听
function initToolbars() {
  // 为每个工具按钮添加点击事件
  toolButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      //根据index值，打开不同侧边栏
      handleToolClick(button, index);
    });
  });

  //这些初始化函数的定义在后面，具有模块化和易于查找错误的好处
  // 初始化文件对话框事件
  initFileDialogEvents();

  // 初始化颜色选择事件
  initColorSelection();

  // 初始化字体下拉菜单事件
  initFontSelector();

  // 初始化画布操作事件
  initCanvasActions();

  // 初始化关闭侧边栏按钮事件
  initCloseSidebarEvents();

  // 初始化形状选择事件
  initShapeSelection();
}

// 初始化关闭侧边栏按钮事件
function initCloseSidebarEvents() {
  const closeButtons = document.querySelectorAll(".close-sidebar-btn");
  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // 关闭所有侧边栏
      closeAllSidebars();
    });
  });
}

// 关闭所有侧边栏
function closeAllSidebars() {
  // 隐藏属性面板
  //这里show处理的是面板的滑入滑出，active是显示与隐藏
  propertiesPanel.classList.remove("show");

  // 移除所有侧边栏的active状态
  shapeSidebar.classList.remove("active");
  textSidebar.classList.remove("active");
  imageSidebar.classList.remove("active");
  penSidebar.classList.remove("active");
  fileSidebar.classList.remove("active");

  // 移除所有工具按钮的active状态
  toolButtons.forEach((btn) => btn.classList.remove("active"));

  // 重置当前工具
  window.currentTool = null;

  // 重置当前元素，确保面板关闭后不能修改属性
  window.currentElement = null;

  // 设置侧边栏关闭状态，恢复画布拖拽
  window.isSidebarOpen = false;
}

// 处理工具按钮点击
function handleToolClick(button, index) {
  // 检查是否是重复点击同一按钮
  const isAlreadyActive = button.classList.contains("active");

  // 移除所有工具按钮的活动状态
  toolButtons.forEach((btn) => btn.classList.remove("active"));

  // 隐藏所有侧边栏内容
  shapeSidebar.classList.remove("active");
  textSidebar.classList.remove("active");
  imageSidebar.classList.remove("active");
  penSidebar.classList.remove("active");
  fileSidebar.classList.remove("active");

  if (isAlreadyActive) {
    // 重复点击，取消选中
    propertiesPanel.classList.remove("show");
    // 重置当前工具
    window.currentTool = null;
    // 重置当前元素，确保面板关闭后不能修改属性
    window.currentElement = null;
  } else {
    // 添加当前按钮的活动状态
    button.classList.add("active");

    // 根据按钮索引处理不同功能
    switch (index) {
      case 0: // 选择工具
        propertiesPanel.classList.remove("show");
        //window就是代表是全局变量
        window.currentTool = "select";
        break;
      case 1: // 图形工具
        showSidebar(shapeSidebar);
        // 保持当前工具，默认是直线
        // 不重置currentTool，因为initShapeSelection已经默认选中了直线
        break;
      case 2: // 图片工具
        // 隐藏属性面板，只显示文件选择对话框
        propertiesPanel.classList.remove("show");
        openFileDialog();
        window.currentTool = "image";
        break;
      case 3: // 文本工具
        showSidebar(textSidebar);
        window.currentTool = "text";
        break;
      case 4: // 画笔工具
        showSidebar(penSidebar);
        window.currentTool = "pen";
        break;
      case 5: // 文件工具
        showSidebar(fileSidebar);
        window.currentTool = "file";
        break;
    }
  }
}

// 显示侧边栏
function showSidebar(sidebar) {
  // 显示属性面板
  propertiesPanel.classList.add("show");
  // 激活对应侧边栏内容
  sidebar.classList.add("active");
  // 设置侧边栏打开状态，禁用画布拖拽
  window.isSidebarOpen = true;
}

// 初始化文件对话框事件
function initFileDialogEvents() {
  // 取消按钮点击事件
  cancelBtn.addEventListener("click", () => {
    fileDialog.classList.remove("show");
    // 重置工具按钮状态
    toolButtons[2].classList.remove("active");
  });

  // 确认按钮点击事件
  confirmBtn.addEventListener("click", () => {
    handleFileSelection();
  });

  // 文件输入变化事件
  fileInput.addEventListener("change", handleFileSelection);
}

// 打开文件选择对话框
function openFileDialog() {
  fileDialog.classList.add("show");
  // 重置文件输入
  fileInput.value = "";
}

// 处理文件选择
function handleFileSelection() {
  const file = fileInput.files[0];

  if (!file) {
    // 没有选择文件，保持对话框打开
    return;
  }

  // 检查文件类型
  const validTypes = ["image/png", "image/jpeg", "image/jpg"];
  if (!validTypes.includes(file.type)) {
    // 显示错误提示
    showErrorToast();
    // 两秒后重新打开文件选择对话框
    setTimeout(() => {
      openFileDialog();
    }, 2000);
    return;
  }

  // 关闭文件对话框
  fileDialog.classList.remove("show");
  // 显示图片侧边栏
  showSidebar(imageSidebar);

  // 导入photo.js中的函数处理图片
  import("./photo.js").then(({ handleImageFile }) => {
    handleImageFile(file);
  });
}

// 显示错误提示
function showErrorToast() {
  errorToast.classList.add("show");
  // 2秒后隐藏错误提示
  setTimeout(() => {
    errorToast.classList.remove("show");
  }, 2000);
}

// 初始化颜色选择事件
function initColorSelection() {
  // 形状侧边栏颜色选择
  // 括号里是参数
  initColorGridEvents("shapeColorSection", "shapeColorGrid");

  // 文本侧边栏颜色选择
  initColorGridEvents("textColorSection", "textColorGrid");

  // 画笔侧边栏颜色选择
  initColorGridEvents("penColorSection", "penColorGrid");

  // 形状选择事件
  initShapeSelection();

  // 边框/背景切换事件
  initColorTabSwitching();
}

// 初始化颜色网格事件
function initColorGridEvents(sectionId, gridId) {
  const section = document.getElementById(sectionId);
  //如果section不存在
  if (!section) return;

  const colorGrid = document.getElementById(gridId);
  const colorItems = colorGrid.querySelectorAll(".color-item");

  colorItems.forEach((item) => {
    item.addEventListener("click", () => {
      // 移除同组其他颜色项的active状态
      colorItems.forEach((other) => other.classList.remove("active"));
      // 添加当前颜色项的active状态
      item.classList.add("active");
    });
  });
}

// 初始化形状选择事件
function initShapeSelection() {
  const shapeGrid = document.querySelector("#shapeSidebar .shape-grid");
  if (!shapeGrid) return;

  const shapeItems = shapeGrid.querySelectorAll(".shape-item");

  shapeItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      // 移除所有形状项的active状态
      shapeItems.forEach((other) => other.classList.remove("active"));
      // 添加当前形状项的active状态
      item.classList.add("active");

      // 根据选择的形状更新当前工具
      switch (index) {
        case 0: // 直线
          window.currentTool = "line";
          break;
        case 1: // 矩形
          window.currentTool = "rect";
          break;
        case 2: // 圆形
          window.currentTool = "circle";
          break;
        case 3: // 椭圆
          window.currentTool = "ellipse";
          break;
        case 4: // 三角形
          window.currentTool = "triangle";
          break;
        default:
          window.currentTool = "shape";
      }
    });
  });

  // 默认选中第一个形状（直线）
  //防止空数组调用报错
  //click()原生方法，模拟被点击
  if (shapeItems.length > 0) {
    shapeItems[0].click();
  }
}

// 初始化边框/背景颜色切换事件
function initColorTabSwitching() {
  //配置要处理的区域
  const sections = [
    { sectionId: "shapeColorSection", gridId: "shapeColorGrid" },
  ];

  sections.forEach(({ sectionId, gridId }) => {
    const section = document.getElementById(sectionId);
    if (!section) return;

    //获取背景，边框
    const colorTabs = section.querySelectorAll(".color-tab");
    const colorGrid = document.getElementById(gridId);

    colorTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        // 移除所有tab的active状态
        colorTabs.forEach((other) => other.classList.remove("active"));
        // 添加当前tab的active状态
        tab.classList.add("active");

        // 切换到任意tab时，默认选中第一个颜色
        const colorItems = colorGrid.querySelectorAll(".color-item");
        colorItems.forEach((item) => item.classList.remove("active"));
        if (colorItems.length > 0) {
          colorItems[0].classList.add("active");
        }
      });
    });
  });
}

// 初始化字体下拉菜单事件
function initFontSelector() {
  const fontDisplay = document.getElementById("fontDisplay");
  const fontDropdown = document.getElementById("fontDropdown");
  const fontOptions = document.querySelectorAll(".font-option");
  const boldBtn = document.getElementById("boldBtn");
  const italicBtn = document.getElementById("italicBtn");

  // 点击字体显示框切换下拉菜单
  if (fontDisplay) {
    fontDisplay.addEventListener("click", () => {
      fontDropdown.classList.toggle("show");
    });
  }

  // 点击其他地方关闭下拉菜单
  // 监听整个文档的点击事件，e是事件对象
  document.addEventListener("click", (e) => {
    //e.target是点击的元素
    //closest() 是 DOM 元素的 原生方法 ，用来 向上查找 匹配的祖先元素（包括元素本身）。就是点击的那个地方如果是下拉菜单里面的，那就整个事件为真。
    if (!e.target.closest(".font-selector")) {
      fontDropdown.classList.remove("show");
    }
  });

  // 字体选项点击事件
  fontOptions.forEach((option) => {
    option.addEventListener("click", () => {
      // 移除所有字体选项的选中状态
      fontOptions.forEach((opt) => opt.classList.remove("selected"));
      // 添加当前选项的选中状态
      option.classList.add("selected");
      // 更新显示的字体名称
      fontDisplay.textContent = option.dataset.font;
      // 关闭下拉菜单
      fontDropdown.classList.remove("show");
    });
  });

  // 粗体按钮点击事件
  if (boldBtn) {
    boldBtn.addEventListener("click", () => {
      boldBtn.classList.toggle("active");
    });
  }

  // 斜体按钮点击事件
  if (italicBtn) {
    italicBtn.addEventListener("click", () => {
      italicBtn.classList.toggle("active");
    });
  }
}

// 初始化画布操作事件
function initCanvasActions() {
  // 新建画布按钮
  if (newCanvasBtn) {
    newCanvasBtn.addEventListener("click", () => {
      newCanvasDialog.classList.add("show");
      canvasNameInput.value = "";
      canvasNameInput.focus();
    });
  }

  // 保存画布按钮
  if (saveCanvasBtn) {
    saveCanvasBtn.addEventListener("click", () => {
      saveCanvas();
    });
  }

  // 打开画布按钮
  if (openCanvasBtn) {
    openCanvasBtn.addEventListener("click", () => {
      openCanvasList();
    });
  }

  // 关闭画布列表弹窗
  if (closeCanvasListBtn) {
    closeCanvasListBtn.addEventListener("click", () => {
      canvasListDialog.classList.remove("show");
    });
  }

  // 关闭新建画布弹窗
  if (closeNewCanvasBtn) {
    closeNewCanvasBtn.addEventListener("click", () => {
      newCanvasDialog.classList.remove("show");
    });
  }

  // 取消新建画布
  if (cancelNewCanvasBtn) {
    cancelNewCanvasBtn.addEventListener("click", () => {
      newCanvasDialog.classList.remove("show");
    });
  }

  // 确认新建画布
  if (confirmNewCanvasBtn) {
    confirmNewCanvasBtn.addEventListener("click", () => {
      createNewCanvas();
    });
  }

  // 回车键创建画布
  if (canvasNameInput) {
    //keydown是键盘点击事件
    canvasNameInput.addEventListener("keydown", (e) => {
      //e.key是按下键的名称
      if (e.key === "Enter") {
        createNewCanvas();
      }
    });
  }

  // 点击弹窗外部关闭
  canvasListDialog.addEventListener("click", (e) => {
    if (e.target === canvasListDialog) {
      canvasListDialog.classList.remove("show");
    }
  });

  newCanvasDialog.addEventListener("click", (e) => {
    if (e.target === newCanvasDialog) {
      newCanvasDialog.classList.remove("show");
    }
  });
}

// 生成唯一ID
function generateUUID() {
  //Math.random().toString(36).substr(2, 9)是随机生成数
  //额这个substr已经弃用了那我换一个吧，用substring代替
  return (
    "canvas-" + Date.now() + "-" + Math.random().toString(36).substring(2, 9)
  );
}

// 创建新画布
function createNewCanvas() {
  //获取画布名称
  //trim是去除字符串首尾空白字符
  const name = canvasNameInput.value.trim();

  if (!name) {
    alert("请输入画布名称");
    return;
  }

  const id = generateUUID();

  // 检查是否是从临时画布转换而来
  if (window.tempCanvasData) {
    // 使用临时保存的画布数据
    const canvasData = window.tempCanvasData;
    window.tempCanvasData = null;

    // 向后端服务器发送请求
    // fetch是网络请求api
    fetch("http://localhost:3000/canvases", {
      //post是请求方法，告诉服务器要创建新数据
      method: "POST",
      //告诉后端服务器发送的数据格式是JSON
      headers: {
        "Content-Type": "application/json",
      },
      //发送的数据：id, name, data
      body: JSON.stringify({ id, name, data: JSON.stringify(canvasData) }),
    })
      // 服务器返回的响应，把响应体解析成js对象
      // 因为服务器常以json字符串形式返回数据，不是js对象
      //then 是 JavaScript Promise 对象的方法 ，用于 处理异步操作的成功结果
      .then((response) => response.json())
      //result是解析后的json对象
      .then((result) => {
        // 200或201是HTTP成功状态代码
        if (result.code === 201 || result.code === 200) {
          window.currentCanvasId = id;
          window.currentCanvasName = name;

          newCanvasDialog.classList.remove("show");
          alert("画布保存成功");
        } else {
          alert("保存画布失败: " + result.message);
        }
      })
      //catch 是 JavaScript Promise 对象的方法 ，用于 捕获和处理异步操作中的错误 。
      .catch((error) => {
        alert("保存画布失败，请检查网络连接");
        console.error("保存画布错误:", error);
      });
  } else {
    // 创建新的空画布
    fetch("http://localhost:3000/canvases", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, name, data: "" }),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.code === 201 || result.code === 200) {
          window.currentCanvasId = id;
          window.currentCanvasName = name;

          // 清空当前画布
          import("./main.js").then(({ elements }) => {
            elements.length = 0;
            import("./canvas.js").then(({ render }) => {
              import("./canvas.js").then(({ scale, offsetX, offsetY }) => {
                scale = 1;
                offsetX = 0;
                offsetY = 0;
                render();
              });
            });
          });

          newCanvasDialog.classList.remove("show");
          alert("画布创建成功");
        } else {
          alert("创建画布失败: " + result.message);
        }
      })
      .catch((error) => {
        alert("创建画布失败，请检查网络连接");
        console.error("创建画布错误:", error);
      });
  }
}

// 保存画布
function saveCanvas() {
  if (!window.currentCanvasId) {
    alert("请先创建或打开一个画布");
    return;
  }

  // 检查是否是临时画布
  if (window.currentCanvasId.startsWith("temp-") || !window.currentCanvasName) {
    // 弹出画布名称输入对话框
    newCanvasDialog.classList.add("show");
    canvasNameInput.value = window.currentCanvasName || "";
    canvasNameInput.focus();

    // 临时保存画布数据
    window.tempCanvasData = {
      elements: null,
      scale: 1,
      offsetX: 0,
      offsetY: 0,
    };

    // 获取画布数据
    // 导入main.js模块
    import("./main.js").then(({ elements }) => {
      // 导入canvasjs模块
      //canvasModule是整个整个模块对象
      import("./canvas.js").then((canvasModule) => {
        //保存当前画布状态

        window.tempCanvasData = {
          // 遍历所有图形（直线、矩形、圆形等）
          // 如果图形有 toJSON 方法，就调用它转换成纯数据
          // 如果没有，就直接保留原图形
          // 这样做的目的是把图形对象转换成可以序列化成 JSON 的数据
          elements: elements.map((el) => (el.toJSON ? el.toJSON() : el)),
          scale: canvasModule.scale,
          offsetX: canvasModule.offsetX,
          offsetY: canvasModule.offsetY,
        };
      });
    });
  } else {
    // 直接保存画布
    saveCanvasData();
  }
}

// 保存画布数据
function saveCanvasData() {
  // 获取画布数据
  import("./main.js").then(({ elements }) => {
    import("./canvas.js").then((canvasModule) => {
      const canvasData = {
        elements: elements.map((el) => (el.toJSON ? el.toJSON() : el)),
        scale: canvasModule.scale,
        offsetX: canvasModule.offsetX,
        offsetY: canvasModule.offsetY,
      };

      if (window.currentCanvasId.startsWith("temp-")) {
        // 创建新画布
        const id = generateUUID();
        const name = window.currentCanvasName;

        fetch("http://localhost:3000/canvases", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id, name, data: JSON.stringify(canvasData) }),
        })
          .then((response) => response.json())
          .then((result) => {
            if (result.code === 201 || result.code === 200) {
              window.currentCanvasId = id;
              alert("画布保存成功");
            } else {
              alert("保存画布失败: " + result.message);
            }
          })
          .catch((error) => {
            alert("保存画布失败，请检查网络连接");
            console.error("保存画布错误:", error);
          });
      } else {
        // 更新现有画布
        fetch("http://localhost:3000/canvases/" + window.currentCanvasId, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: window.currentCanvasName,
            data: JSON.stringify(canvasData),
          }),
        })
          .then((response) => response.json())
          .then((result) => {
            if (result.code === 200) {
              alert("画布保存成功");
            } else {
              alert("保存画布失败: " + result.message);
            }
          })
          .catch((error) => {
            alert("保存画布失败，请检查网络连接");
            console.error("保存画布错误:", error);
          });
      }
    });
  });
}

// 打开画布列表
function openCanvasList() {
  fetch("http://localhost:3000/canvases")
    .then((response) => response.json())
    .then((result) => {
      if (result.code === 200) {
        //调用 renderCanvasList 函数，把从服务器获取的画布列表数据渲染到页面上 。
        renderCanvasList(result.data);
        canvasListDialog.classList.add("show");
      } else {
        alert("获取画布列表失败: " + result.message);
      }
    })
    .catch((error) => {
      alert("获取画布列表失败，请检查网络连接");
      console.error("获取画布列表错误:", error);
    });
}

// 渲染画布列表
function renderCanvasList(canvases) {
  if (!canvases || canvases.length === 0) {
    canvasList.innerHTML =
      '<div class="canvas-list-empty">暂无画布，请先创建</div>';
    return;
  }

  canvasList.innerHTML = canvases
    //遍历每一个画布对象
    //给每一个画布对象生成html元素
    .map(
      //生成一个字符串，就是打开的打开的那些东西
      (canvas) => `
      <div class="canvas-item" data-id="${canvas.id}">
        <div class="canvas-item-name">${canvas.name}</div>
        <div class="canvas-item-date">更新时间: ${canvas.updated_at}</div>
      </div>
    `,
    )
    //- map() 返回一个包含 HTML 字符串的数组
    //.join("") 把数组连接成一个完整的 HTML 字符串，
    .join("");

  // 为每个画布项添加点击事件
  const canvasItems = canvasList.querySelectorAll(".canvas-item");
  canvasItems.forEach((item) => {
    item.addEventListener("click", () => {
      const id = item.dataset.id;
      loadCanvas(id);
    });
  });
}

// 加载画布
function loadCanvas(id) {
  fetch("http://localhost:3000/canvases/" + id)
    .then((response) => response.json())
    .then((result) => {
      if (result.code === 200) {
        const canvasData = JSON.parse(result.data.data || "{}");

        window.currentCanvasId = id;
        window.currentCanvasName = result.data.name;

        // 加载元素
        import("./main.js").then(({ elements, createElement }) => {
          elements.length = 0;

          if (canvasData.elements && Array.isArray(canvasData.elements)) {
            canvasData.elements.forEach((el) => {
              const element = createElement(el.type);
              if (element && el) {
                Object.assign(element, el);
                elements.push(element);
              }
            });
          }

          // 加载视图状态
          import("./canvas.js").then((canvasModule) => {
            if (canvasData.scale !== undefined)
              canvasModule.scale = canvasData.scale;
            if (canvasData.offsetX !== undefined)
              canvasModule.offsetX = canvasData.offsetX;
            if (canvasData.offsetY !== undefined)
              canvasModule.offsetY = canvasData.offsetY;
            canvasModule.render();
          });
        });

        canvasListDialog.classList.remove("show");
        alert("画布加载成功");
      } else {
        alert("加载画布失败: " + result.message);
      }
    })
    .catch((error) => {
      alert("加载画布失败，请检查网络连接");
      console.error("加载画布错误:", error);
    });
}

// 导出初始化函数
export { initToolbars };
