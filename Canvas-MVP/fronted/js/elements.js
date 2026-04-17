/**
 * 画布元素管理模块
 * 负责管理画布上的所有元素，包括添加、删除、获取和更新元素
 */

/**
 * 元素基类，包含所有元素的通用属性
 */
class Element {
  /**
   * 构造函数
   * @param {Object} options - 元素配置选项
   */
  constructor(options) {
    // 唯一标识符
    this.id = options.id || this.generateId();
    // 元素类型
    this.type = options.type;
    // 元素左上角坐标
    this.x = options.x || 0;
    this.y = options.y || 0;
    // 元素宽高
    this.width = options.width || 100;
    this.height = options.height || 100;
    // 背景色
    this.backgroundColor = options.backgroundColor || '#b8c4ce';
    // 边框宽度
    this.borderWidth = options.borderWidth || 0;
    // 边框颜色
    this.borderColor = options.borderColor || '#000000';
    // 旋转角度（默认0）
    this.rotation = options.rotation || 0;
  }

  /**
   * 生成唯一ID
   * @returns {string} 唯一标识符
   */
  generateId() {
    return 'element_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
  }
}

/**
 * 矩形元素
 */
class Rect extends Element {
  /**
   * 构造函数
   * @param {Object} options - 元素配置选项
   */
  constructor(options) {
    super(options);
    this.type = 'rect';
  }
}

/**
 * 圆形元素
 */
class Circle extends Element {
  /**
   * 构造函数
   * @param {Object} options - 元素配置选项
   */
  constructor(options) {
    super(options);
    this.type = 'circle';
  }
}

/**
 * 三角形元素
 */
class Triangle extends Element {
  /**
   * 构造函数
   * @param {Object} options - 元素配置选项
   */
  constructor(options) {
    super(options);
    this.type = 'triangle';
  }
}

/**
 * 文本元素
 */
class Text extends Element {
  /**
   * 构造函数
   * @param {Object} options - 元素配置选项
   */
  constructor(options) {
    super(options);
    this.type = 'text';
    // 文本内容
    this.text = options.text || '';
    // 字体
    this.font = options.font || '宋体';
    // 字体大小
    this.fontSize = options.fontSize || 16;
    // 字体样式
    this.fontStyle = options.fontStyle || 'normal';
    // 字体粗细
    this.fontWeight = options.fontWeight || 'normal';
    // 文本颜色
    this.textColor = options.textColor || '#000000';
    // 文本对齐方式
    this.textAlign = options.textAlign || 'left';
    // 文本垂直对齐方式
    this.textBaseline = options.textBaseline || 'top';
  }
}

/**
 * 图片元素
 */
class ImageElement extends Element {
  /**
   * 构造函数
   * @param {Object} options - 元素配置选项
   */
  constructor(options) {
    super(options);
    this.type = 'image';
    // 图片URL
    this.imageUrl = options.imageUrl || '';
    // 滤镜
    this.filter = options.filter || 'none';
    // 透明度
    this.opacity = options.opacity || 1;
  }
}

/**
 * 元素管理器类，负责管理所有元素
 */
class ElementManager {
  /**
   * 构造函数
   */
  constructor() {
    // 存储所有元素的Map
    this.elements = new Map();
  }

  /**
   * 添加元素
   * @param {Element} element - 要添加的元素
   * @returns {string} 添加的元素ID
   */
  addElement(element) {
    this.elements.set(element.id, element);
    return element.id;
  }

  /**
   * 删除元素
   * @param {string} id - 要删除的元素ID
   * @returns {boolean} 是否删除成功
   */
  removeElement(id) {
    return this.elements.delete(id);
  }

  /**
   * 根据ID获取元素
   * @param {string} id - 元素ID
   * @returns {Element|null} 找到的元素或null
   */
  getElementById(id) {
    return this.elements.get(id) || null;
  }

  /**
   * 获取所有元素
   * @returns {Array} 所有元素的数组
   */
  getAllElements() {
    return Array.from(this.elements.values());
  }

  /**
   * 更新元素属性
   * @param {string} id - 元素ID
   * @param {Object} properties - 要更新的属性
   * @returns {boolean} 是否更新成功
   */
  updateElement(id, properties) {
    const element = this.elements.get(id);
    if (!element) {
      return false;
    }

    // 更新元素属性
    Object.assign(element, properties);
    return true;
  }
}

// 导出类
export { Element, Rect, Circle, Triangle, Text, ImageElement, ElementManager };