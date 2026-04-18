// 工具栏功能实现

// 获取DOM元素
const toolButtons = document.querySelectorAll(".tool-btn");
const propertiesPanel = document.getElementById("propertiesPanel");
const shapeSidebar = document.getElementById("shapeSidebar");
const textSidebar = document.getElementById("textSidebar");
const imageSidebar = document.getElementById("imageSidebar");
const penSidebar = document.getElementById("penSidebar");
const fileDialog = document.getElementById("fileDialog");
const errorToast = document.getElementById("errorToast");
const fileInput = document.getElementById("fileInput");
const cancelBtn = document.getElementById("cancelBtn");
const confirmBtn = document.getElementById("confirmBtn");

// 初始化工具栏事件监听
function initToolbars() {
  // 为每个工具按钮添加点击事件
  toolButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      handleToolClick(button, index);
    });
  });

  // 初始化文件对话框事件
  initFileDialogEvents();

  // 初始化颜色选择事件
  initColorSelection();

  // 初始化字体下拉菜单事件
  initFontSelector();
}

// 处理工具按钮点击
function handleToolClick(button, index) {
  // 移除所有工具按钮的活动状态
  toolButtons.forEach((btn) => btn.classList.remove("active"));
  // 添加当前按钮的活动状态
  button.classList.add("active");

  // 隐藏所有侧边栏内容
  shapeSidebar.classList.remove("active");
  textSidebar.classList.remove("active");
  imageSidebar.classList.remove("active");
  penSidebar.classList.remove("active");

  // 根据按钮索引处理不同功能
  switch (index) {
    case 0: // 选择工具
      propertiesPanel.classList.remove("show");
      break;
    case 1: // 图形工具
      showSidebar(shapeSidebar);
      break;
    case 2: // 图片工具
      // 隐藏属性面板，只显示文件选择对话框
      propertiesPanel.classList.remove("show");
      openFileDialog();
      break;
    case 3: // 文本工具
      showSidebar(textSidebar);
      break;
    case 4: // 画笔工具
      showSidebar(penSidebar);
      break;
  }
}

// 显示侧边栏
function showSidebar(sidebar) {
  // 显示属性面板
  propertiesPanel.classList.add("show");
  // 激活对应侧边栏内容
  sidebar.classList.add("active");
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

  // 这里可以添加处理图片的逻辑
  console.log("Selected image:", file);
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

  shapeItems.forEach((item) => {
    item.addEventListener("click", () => {
      // 移除所有形状项的active状态
      shapeItems.forEach((other) => other.classList.remove("active"));
      // 添加当前形状项的active状态
      item.classList.add("active");
    });
  });
}

// 初始化边框/背景切换事件
function initColorTabSwitching() {
  const sections = [
    { sectionId: "shapeColorSection", gridId: "shapeColorGrid" },
  ];

  sections.forEach(({ sectionId, gridId }) => {
    const section = document.getElementById(sectionId);
    if (!section) return;

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
  document.addEventListener("click", (e) => {
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

// 导出初始化函数
export { initToolbars };
