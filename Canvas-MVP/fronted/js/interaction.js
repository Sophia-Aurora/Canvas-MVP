// 交互逻辑和事件处理

class Interaction {
  constructor() {
    this.propertiesPanel = document.getElementById("propertiesPanel");
    this.toolButtons = document.querySelectorAll(".tool-btn");
    this.shapeItems = document.querySelectorAll(".shape-item");
    this.colorTabs = document.querySelectorAll(".color-tab");
    this.colorItems = document.querySelectorAll(".color-item");
    this.sliders = {
      opacity: document.getElementById("opacitySlider"),
      borderWidth: document.getElementById("borderWidthSlider"),
      size: document.getElementById("sizeSlider"),
      textOpacity: document.getElementById("textOpacitySlider"),
      textSize: document.getElementById("textSizeSlider"),
      imageSize: document.getElementById("imageSizeSlider"),
      imageOpacity: document.getElementById("imageOpacitySlider"),
    };
    this.sliderValues = {
      opacity: document.getElementById("opacityValue"),
      borderWidth: document.getElementById("borderWidthValue"),
      size: document.getElementById("sizeValue"),
      textOpacity: document.getElementById("textOpacityValue"),
      textSize: document.getElementById("textSizeValue"),
      imageSize: document.getElementById("imageSizeValue"),
      imageOpacity: document.getElementById("imageOpacityValue"),
    };

    this.fontDisplay = document.getElementById("fontDisplay");
    this.fontDropdown = document.getElementById("fontDropdown");
    this.fontOptions = document.querySelectorAll(".font-option");
    this.boldBtn = document.getElementById("boldBtn");
    this.italicBtn = document.getElementById("italicBtn");
    this.styleBtns = document.querySelectorAll(".style-btn");

    this.shapeSidebar = document.getElementById("shapeSidebar");
    this.textSidebar = document.getElementById("textSidebar");
    this.imageSidebar = document.getElementById("imageSidebar");

    this.fileDialog = document.getElementById("fileDialog");
    this.fileInput = document.getElementById("fileInput");
    this.confirmBtn = document.getElementById("confirmBtn");
    this.cancelBtn = document.getElementById("cancelBtn");
    this.errorToast = document.getElementById("errorToast");
    this.scaleToggle = document.getElementById("scaleToggle");
    this.filterItems = document.querySelectorAll(".filter-item");

    this.currentTool = null;
    this.currentShape = null;
    this.currentColorTab = "stroke";
    this.currentColor = "#000000";
    this.currentFont = "宋体";
    this.isBold = false;
    this.isItalic = false;
    this.isMaintainingAspectRatio = false;
    this.currentFilter = "none";

    this.initEventListeners();
  }

  initEventListeners() {
    // 工具按钮点击事件
    this.toolButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const tool = e.currentTarget.dataset.tool;
        this.handleToolClick(tool);
      });
    });

    // 形状选择事件
    this.shapeItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        const shape = e.currentTarget.dataset.shape;
        this.handleShapeClick(shape);
      });
    });

    // 颜色标签切换事件 - 形状侧边栏
    const shapeColorTabs = document.querySelectorAll(
      "#shapeSidebar .color-tab",
    );
    shapeColorTabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        e.stopPropagation();
        const tabType = e.currentTarget.dataset.tab;
        this.handleColorTabClick(tabType, "#shapeSidebar");
      });
    });

    // 颜色标签切换事件 - 文本侧边栏
    const textColorTabs = document.querySelectorAll("#textSidebar .color-tab");
    textColorTabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        e.stopPropagation();
        const tabType = e.currentTarget.dataset.tab;
        this.handleColorTabClick(tabType, "#textSidebar");
      });
    });

    // 颜色选择事件 - 形状侧边栏
    const shapeColorItems = document.querySelectorAll(
      "#shapeSidebar .color-item",
    );
    shapeColorItems.forEach((item) => {
      const color = item.dataset.color;
      item.style.backgroundColor = color;

      item.addEventListener("click", (e) => {
        e.stopPropagation();
        this.handleColorClick(color, "#shapeSidebar");
      });
    });

    // 颜色选择事件 - 文本侧边栏
    const textColorItems = document.querySelectorAll(
      "#textSidebar .color-item",
    );
    textColorItems.forEach((item) => {
      const color = item.dataset.color;
      item.style.backgroundColor = color;

      item.addEventListener("click", (e) => {
        e.stopPropagation();
        this.handleColorClick(color, "#textSidebar");
      });
    });

    // 滑块事件
    if (this.sliders.opacity) {
      this.sliders.opacity.addEventListener("input", (e) => {
        e.stopPropagation();
        const value = e.target.value;
        this.sliderValues.opacity.textContent = `${value}%`;
      });
    }

    if (this.sliders.borderWidth) {
      this.sliders.borderWidth.addEventListener("input", (e) => {
        e.stopPropagation();
        const value = e.target.value;
        this.sliderValues.borderWidth.textContent = `${value}px`;
      });
    }

    if (this.sliders.size) {
      this.sliders.size.addEventListener("input", (e) => {
        e.stopPropagation();
        const value = e.target.value;
        this.sliderValues.size.textContent = `${value}%`;
      });
    }

    if (this.sliders.textOpacity) {
      this.sliders.textOpacity.addEventListener("input", (e) => {
        e.stopPropagation();
        const value = e.target.value;
        this.sliderValues.textOpacity.textContent = `${value}%`;
      });
    }

    if (this.sliders.textSize) {
      this.sliders.textSize.addEventListener("input", (e) => {
        e.stopPropagation();
        const value = e.target.value;
        this.sliderValues.textSize.textContent = `${value}%`;
      });
    }

    if (this.sliders.imageSize) {
      this.sliders.imageSize.addEventListener("input", (e) => {
        e.stopPropagation();
        const value = e.target.value;
        this.sliderValues.imageSize.textContent = `${value}%`;
      });
    }

    if (this.sliders.imageOpacity) {
      this.sliders.imageOpacity.addEventListener("input", (e) => {
        e.stopPropagation();
        const value = e.target.value;
        this.sliderValues.imageOpacity.textContent = `${value}%`;
      });
    }

    // 字体选择事件
    if (this.fontDisplay) {
      this.fontDisplay.addEventListener("click", (e) => {
        e.stopPropagation();
        this.fontDropdown.classList.toggle("show");
      });
    }

    this.fontOptions.forEach((option) => {
      option.addEventListener("click", (e) => {
        e.stopPropagation();
        const font = option.dataset.font;
        this.handleFontClick(font);
      });
    });

    // 粗体和斜体按钮事件
    if (this.boldBtn) {
      this.boldBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.handleBoldClick();
      });
    }

    if (this.italicBtn) {
      this.italicBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.handleItalicClick();
      });
    }

    // 文件选择对话框事件
    if (this.confirmBtn) {
      this.confirmBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.handleFileConfirm();
      });
    }

    if (this.cancelBtn) {
      this.cancelBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.handleFileCancel();
      });
    }

    if (this.fileInput) {
      this.fileInput.addEventListener("change", (e) => {
        e.stopPropagation();
      });
    }

    // 比例切换按钮事件
    if (this.scaleToggle) {
      this.scaleToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        this.isMaintainingAspectRatio = !this.isMaintainingAspectRatio;
        this.scaleToggle.classList.toggle(
          "active",
          this.isMaintainingAspectRatio,
        );
      });
    }

    // 滤镜选择事件
    this.filterItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        const filter = item.dataset.filter;
        this.handleFilterClick(filter);
      });
    });

    // 点击外部区域事件
    document.addEventListener("click", (e) => {
      this.handleOutsideClick(e);
    });
  }

  handleToolClick(tool) {
    // 移除所有工具按钮的active类
    this.toolButtons.forEach((btn) => {
      btn.classList.remove("active");
    });

    // 给当前点击的按钮添加active类
    const currentToolBtn = document.querySelector(`[data-tool="${tool}"]`);
    if (currentToolBtn) {
      currentToolBtn.classList.add("active");
    }

    // 根据工具类型显示不同的侧边栏内容
    if (tool === "shape") {
      this.propertiesPanel.classList.add("show");
      this.shapeSidebar.classList.add("active");
      this.textSidebar.classList.remove("active");
      this.imageSidebar.classList.remove("active");
    } else if (tool === "text") {
      this.propertiesPanel.classList.add("show");
      this.textSidebar.classList.add("active");
      this.shapeSidebar.classList.remove("active");
      this.imageSidebar.classList.remove("active");
      this.resetTextSidebarDefaults();
    } else if (tool === "image") {
      // 显示文件选择对话框
      this.fileDialog.classList.add("show");
    } else {
      // 其他工具隐藏侧边栏
      this.propertiesPanel.classList.remove("show");
      this.shapeSidebar.classList.remove("active");
      this.textSidebar.classList.remove("active");
      this.imageSidebar.classList.remove("active");
    }

    this.currentTool = tool;
  }

  handleOutsideClick(e) {
    // 检查点击是否在工具栏按钮或侧边栏外
    const isClickOnToolBtn = Array.from(this.toolButtons).some((btn) =>
      btn.contains(e.target),
    );
    const isClickOnPropertiesPanel = this.propertiesPanel.contains(e.target);
    const isClickOnFontDropdown =
      this.fontDropdown && this.fontDropdown.contains(e.target);
    const isClickOnFileDialog =
      this.fileDialog && this.fileDialog.contains(e.target);

    if (
      !isClickOnToolBtn &&
      !isClickOnPropertiesPanel &&
      !isClickOnFontDropdown &&
      !isClickOnFileDialog
    ) {
      // 取消所有工具按钮的选中状态
      this.toolButtons.forEach((btn) => {
        btn.classList.remove("active");
      });

      // 隐藏侧边栏
      this.propertiesPanel.classList.remove("show");
      this.shapeSidebar.classList.remove("active");
      this.textSidebar.classList.remove("active");
      this.imageSidebar.classList.remove("active");

      // 关闭字体下拉框
      if (this.fontDropdown) {
        this.fontDropdown.classList.remove("show");
      }

      this.currentTool = null;
    }
  }

  handleShapeClick(shape) {
    // 移除所有形状的active类
    this.shapeItems.forEach((item) => {
      item.classList.remove("active");
    });
    // 给当前点击的形状添加active类
    const currentShapeItem = document.querySelector(`[data-shape="${shape}"]`);
    if (currentShapeItem) {
      currentShapeItem.classList.add("active");
    }
    this.currentShape = shape;
  }

  handleColorTabClick(tabType, sidebarId) {
    // 移除对应侧边栏所有标签的active类
    const sidebar = document.querySelector(sidebarId);
    const colorTabs = sidebar.querySelectorAll(".color-tab");
    colorTabs.forEach((tab) => {
      tab.classList.remove("active");
    });
    // 给当前点击的标签添加active类
    const currentTab = sidebar.querySelector(`[data-tab="${tabType}"]`);
    if (currentTab) {
      currentTab.classList.add("active");
    }
    this.currentColorTab = tabType;
  }

  handleColorClick(color, sidebarId) {
    // 移除对应侧边栏所有颜色的active类
    const sidebar = document.querySelector(sidebarId);
    const colorItems = sidebar.querySelectorAll(".color-item");
    colorItems.forEach((item) => {
      item.classList.remove("active");
    });
    // 给当前点击的颜色添加active类
    const currentColorItem = sidebar.querySelector(`[data-color="${color}"]`);
    if (currentColorItem) {
      currentColorItem.classList.add("active");
    }
    this.currentColor = color;
  }

  handleFontClick(font) {
    this.currentFont = font;
    this.fontDisplay.textContent = font;
    this.fontDisplay.style.fontFamily = font;

    // 更新选中状态
    this.fontOptions.forEach((option) => {
      option.classList.remove("selected");
      if (option.dataset.font === font) {
        option.classList.add("selected");
      }
    });

    // 关闭下拉框
    this.fontDropdown.classList.remove("show");
  }

  handleBoldClick() {
    this.isBold = !this.isBold;
    this.boldBtn.classList.toggle("active", this.isBold);
  }

  handleItalicClick() {
    this.isItalic = !this.isItalic;
    this.italicBtn.classList.toggle("active", this.isItalic);
  }

  handleFileConfirm() {
    const file = this.fileInput.files[0];
    if (file) {
      const validExtensions = [".png", ".jpg", ".jpeg"];
      const fileExtension = "." + file.name.split(".").pop().toLowerCase();

      if (validExtensions.includes(fileExtension)) {
        // 隐藏文件选择对话框
        this.fileDialog.classList.remove("show");

        // 显示图片侧边栏
        this.propertiesPanel.classList.add("show");
        this.imageSidebar.classList.add("active");
        this.shapeSidebar.classList.remove("active");
        this.textSidebar.classList.remove("active");

        // 重置图片侧边栏默认值
        this.resetImageSidebarDefaults();

        // 这里可以添加图片上传和处理逻辑
        console.log("上传图片:", file);

        // 重置文件输入
        this.fileInput.value = "";
      } else {
        // 显示错误提示
        this.showErrorToast();

        // 2秒后重新显示文件选择对话框
        setTimeout(() => {
          this.fileDialog.classList.add("show");
        }, 2000);
      }
    }
  }

  handleFileCancel() {
    // 隐藏文件选择对话框
    this.fileDialog.classList.remove("show");
    // 重置文件输入
    this.fileInput.value = "";
    // 移除工具按钮的active状态
    this.toolButtons.forEach((btn) => {
      btn.classList.remove("active");
    });
    this.currentTool = null;
  }

  resetTextSidebarDefaults() {
    const textColorTabs = this.textSidebar.querySelectorAll(".color-tab");
    textColorTabs.forEach((tab, index) => {
      tab.classList.toggle("active", index === 0);
    });

    const textColorItems = this.textSidebar.querySelectorAll(".color-item");
    textColorItems.forEach((item, index) => {
      item.classList.toggle("active", index === 0);
    });

    const fontOptions = this.textSidebar.querySelectorAll(".font-option");
    fontOptions.forEach((option, index) => {
      option.classList.toggle("selected", index === 0);
    });

    this.currentFont = "宋体";
    this.fontDisplay.textContent = "宋体";
    this.fontDisplay.style.fontFamily = "宋体";

    this.isBold = false;
    this.isItalic = false;
    this.boldBtn.classList.remove("active");
    this.italicBtn.classList.remove("active");

    if (this.sliders.textOpacity) {
      this.sliders.textOpacity.value = 100;
      this.sliderValues.textOpacity.textContent = "100%";
    }
    if (this.sliders.textSize) {
      this.sliders.textSize.value = 100;
      this.sliderValues.textSize.textContent = "100%";
    }
  }

  resetImageSidebarDefaults() {
    const filterItems = this.imageSidebar.querySelectorAll(".filter-item");
    filterItems.forEach((item, index) => {
      item.classList.toggle("active", index === 0);
    });

    this.isMaintainingAspectRatio = false;
    this.scaleToggle.classList.remove("active");

    if (this.sliders.imageSize) {
      this.sliders.imageSize.value = 100;
      this.sliderValues.imageSize.textContent = "100%";
    }
    if (this.sliders.imageOpacity) {
      this.sliders.imageOpacity.value = 100;
      this.sliderValues.imageOpacity.textContent = "100%";
    }
  }

  showErrorToast() {
    this.errorToast.classList.add("show");
    setTimeout(() => {
      this.errorToast.classList.remove("show");
    }, 2000);
  }

  handleFilterClick(filter) {
    // 移除所有滤镜的active类
    this.filterItems.forEach((item) => {
      item.classList.remove("active");
    });
    // 给当前点击的滤镜添加active类
    const currentFilterItem = document.querySelector(
      `[data-filter="${filter}"]`,
    );
    if (currentFilterItem) {
      currentFilterItem.classList.add("active");
    }
    this.currentFilter = filter;
  }
}

// 初始化交互逻辑
const interaction = new Interaction();
