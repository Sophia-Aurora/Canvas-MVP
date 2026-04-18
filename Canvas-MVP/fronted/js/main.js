/**
 * Canvas绘图工具 - 元素数据结构
 * 用于存储和管理画布上的所有绘图元素
 */

/**
 * 元素类型枚举
 */
const ElementType = {
  LINE: "line",
  CIRCLE: "circle",
  RECT: "rect",
  ELLIPSE: "ellipse",
  TRIANGLE: "triangle",
  TEXT: "text",
  IMAGE: "image",
  PEN: "pen",
};

/**
 * 全局变量定义
 */
// 存储画布上所有永久元素的数组
const elements = [];

// 当前正在编辑的元素
let currentElement = null;

// 临时选区变量（不存入elements数组）
const selectionArea = {
  startX: 0,
  startY: 0,
  endX: 0,
  endY: 0,
  isSelecting: false,
};

/**
 * 基础元素类（所有元素类型的基类）
 * 包含所有元素共有的通用属性
 */
class BaseElement {

    // 创建新对象的时候会调用它来给对象赋初始值
  constructor(type) {
    this.id = this.generateId();
    this.type = type;
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.isSelected = false;
    this.opacity = 1;
  }

  // 每次调用 generateId() 都会生成一个唯一的ID
  generateId() {
    return `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  //动态更新元素位置和尺寸
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  setSize(width, height) {
    this.width = width;
    this.height = height;
  }

//透明度
  setOpacity(opacity) {
    this.opacity = Math.max(0, Math.min(1, opacity));
  }

  select() {
    this.isSelected = true;
  }

  deselect() {
    this.isSelected = false;
  }

  toggleSelect() {
    this.isSelected = !this.isSelected;
  }

 //获取元素边界，用于判断位置，检测碰撞，绘制选区等
  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }
}

/**
 * 形状元素基类（直线、圆形、矩形、椭圆、三角形的基类）
 * 包含形状共有的属性
 */

//ShapeElement继承BaseElement的所有属性和方法
class ShapeElement extends BaseElement {
  constructor(type) {
    super(type);
    this.strokeColor = "#8B9CAF";
    this.fillColor = "transparent";
    this.lineWidth = 2;
  }

  setStrokeColor(color) {
    this.strokeColor = color;
  }

  setFillColor(color) {
    this.fillColor = color;
  }

  setLineWidth(width) {
    this.lineWidth = Math.max(1, width);
  }
}

/**
 * 直线元素
 * 用于绘制直线
 */
class LineElement extends ShapeElement {
  constructor() {
    super(ElementType.LINE);
    this.x2 = 0;
    this.y2 = 0;
  }

  setEndPoint(x2, y2) {
    this.x2 = x2;
    this.y2 = y2;
    this.width = Math.abs(x2 - this.x);
    this.height = Math.abs(y2 - this.y);
  }

  getEndPoint() {
    return { x: this.x2, y: this.y2 };
  }
}

/**
 * 圆形元素
 * 用于绘制正圆
 */
class CircleElement extends ShapeElement {
  constructor() {
    super(ElementType.CIRCLE);
    this.radius = 0;
  }

  setRadius(radius) {
    this.radius = radius;
    this.width = radius * 2;
    this.height = radius * 2;
  }

  getRadius() {
    return this.radius;
  }
}

/**
 * 矩形元素
 * 用于绘制矩形
 */
class RectElement extends ShapeElement {
  constructor() {
    super(ElementType.RECT);
  }
}

/**
 * 椭圆元素
 * 用于绘制椭圆
 */
class EllipseElement extends ShapeElement {
  constructor() {
    super(ElementType.ELLIPSE);
    this.radiusX = 0;
    this.radiusY = 0;
  }

  setRadii(radiusX, radiusY) {
    this.radiusX = radiusX;
    this.radiusY = radiusY;
    this.width = radiusX * 2;
    this.height = radiusY * 2;
  }
}

/**
 * 三角形元素
 * 用于绘制三角形
 */
class TriangleElement extends ShapeElement {
  constructor() {
    super(ElementType.TRIANGLE);
  }
}

/**
 * 文字元素
 * 用于绘制文字
 */
class TextElement extends BaseElement {
  constructor() {
    super(ElementType.TEXT);
    this.content = "";
    this.fontFamily = "宋体";
    this.fontSize = 16;
    this.fontColor = "#9B8B9F";
    this.isBold = false;
    this.isItalic = false;
  }

  setContent(text) {
    this.content = text;
  }

  setFont(family, size) {
    this.fontFamily = family;
    this.fontSize = size;
  }

  setFontColor(color) {
    this.fontColor = color;
  }

  setBold(isBold) {
    this.isBold = isBold;
  }

  setItalic(isItalic) {
    this.isItalic = isItalic;
  }

  getFontStyle() {
    let style = "";
    if (this.isBold) style += "bold ";
    if (this.isItalic) style += "italic ";
    return style.trim();
  }

  getFontString() {
    return `${this.getFontStyle()} ${this.fontSize}px ${this.fontFamily}`;
  }
}

/**
 * 图片元素
 * 用于插入图片
 */
class ImageElement extends BaseElement {
  constructor() {
    super(ElementType.IMAGE);
    this.imgSrc = "";
    this.img = null;
    this.filterType = "none";
    this.filterValue = 100;
  }

  setImageSrc(src) {
    this.imgSrc = src;
  }

  setImage(img) {
    this.img = img;
    if (img) {
      this.width = img.width;
      this.height = img.height;
    }
  }

  setFilter(type, value) {
    this.filterType = type;
    this.filterValue = value;
  }

  getFilterString() {
    switch (this.filterType) {
      case "grayscale":
        return `grayscale(${this.filterValue}%)`;
      case "blur":
        return `blur(${this.filterValue}px)`;
      case "brightness":
        return `brightness(${this.filterValue}%)`;
      case "contrast":
        return `contrast(${this.filterValue}%)`;
      case "opacity":
        return `opacity(${this.filterValue}%)`;
      case "saturate":
        return `saturate(${this.filterValue}%)`;
      case "sepia":
        return `sepia(${this.filterValue}%)`;
      case "hue-rotate":
        return `hue-rotate(${this.filterValue}deg)`;
      default:
        return "none";
    }
  }
}

/**
 * 画笔元素
 * 用于自由绘制
 */
class PenElement extends BaseElement {
  constructor() {
    super(ElementType.PEN);
    this.penColor = "#88A8C9";
    this.penSize = 5;
    this.points = [];
  }

  setPenColor(color) {
    this.penColor = color;
  }

  setPenSize(size) {
    this.penSize = Math.max(1, size);
  }

  addPoint(x, y) {
    this.points.push({ x, y });
    this.updateBounds();
  }

  clearPoints() {
    this.points = [];
    this.resetBounds();
  }

  updateBounds() {
    if (this.points.length === 0) return;

    let minX = this.points[0].x;
    let minY = this.points[0].y;
    let maxX = this.points[0].x;
    let maxY = this.points[0].y;

    this.points.forEach((point) => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });

    this.x = minX;
    this.y = minY;
    this.width = maxX - minX;
    this.height = maxY - minY;
  }

  resetBounds() {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
  }
}

/**
 * 元素工厂函数
 * 根据类型创建对应的元素实例
 */
function createElement(type) {
  switch (type) {
    case ElementType.LINE:
      return new LineElement();
    case ElementType.CIRCLE:
      return new CircleElement();
    case ElementType.RECT:
      return new RectElement();
    case ElementType.ELLIPSE:
      return new EllipseElement();
    case ElementType.TRIANGLE:
      return new TriangleElement();
    case ElementType.TEXT:
      return new TextElement();
    case ElementType.IMAGE:
      return new ImageElement();
    case ElementType.PEN:
      return new PenElement();
    default:
      throw new Error(`Unknown element type: ${type}`);
  }
}

/**
 * 元素管理函数
 */
const ElementManager = {
  add(element) {
    elements.push(element);
    return element;
  },

  remove(id) {
    const index = elements.findIndex((el) => el.id === id);
    if (index !== -1) {
      elements.splice(index, 1);
      return true;
    }
    return false;
  },

  getById(id) {
    return elements.find((el) => el.id === id);
  },

  getAll() {
    return [...elements];
  },

  getByType(type) {
    return elements.filter((el) => el.type === type);
  },

  getSelected() {
    return elements.filter((el) => el.isSelected);
  },

  clear() {
    elements.length = 0;
  },

  forEach(callback) {
    elements.forEach(callback);
  },

  size() {
    return elements.length;
  },

  isEmpty() {
    return elements.length === 0;
  },
};

/**
 * 从属性面板同步数据到元素
 * @param {string} type - 元素类型
 * @param {object} properties - 属性对象
 */
function syncPropertiesToElement(type, properties) {
  const element = createElement(type);

  Object.keys(properties).forEach((key) => {
    if (element.hasOwnProperty(key)) {
      element[key] = properties[key];
    }
  });

  return element;
}

/**
 * 从元素同步数据到属性面板
 * @param {BaseElement} element - 元素实例
 */
function syncElementToProperties(element) {
  const properties = {};

  Object.keys(element).forEach((key) => {
    if (typeof element[key] !== "function" && key !== "id") {
      properties[key] = element[key];
    }
  });

  return properties;
}

/**
 * 复制元素
 * @param {BaseElement} element - 要复制的元素
 */
function cloneElement(element) {
  const cloned = createElement(element.type);

  Object.keys(element).forEach((key) => {
    if (typeof element[key] !== "function" && key !== "id") {
      if (Array.isArray(element[key])) {
        cloned[key] = [...element[key]];
      } else if (typeof element[key] === "object" && element[key] !== null) {
        cloned[key] = { ...element[key] };
      } else {
        cloned[key] = element[key];
      }
    }
  });

  cloned.id = cloned.generateId();
  cloned.x += 20;
  cloned.y += 20;
  cloned.deselect();

  return cloned;
}

/**
 * 导出所有模块
 */
export {
  ElementType,
  elements,
  currentElement,
  selectionArea,
  BaseElement,
  ShapeElement,
  LineElement,
  CircleElement,
  RectElement,
  EllipseElement,
  TriangleElement,
  TextElement,
  ImageElement,
  PenElement,
  createElement,
  ElementManager,
  syncPropertiesToElement,
  syncElementToProperties,
  cloneElement,
};
