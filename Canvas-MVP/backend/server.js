/**
 * Canvas 绘图工具 - 后端服务
 * 提供图片上传和画布 CRUD 接口
 */

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;

// ============ 中间件配置 ============
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// ============ 数据库初始化 ============
const dbPath = path.join(__dirname, "..", "canvas.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("数据库连接失败:", err.message);
  } else {
    console.log("数据库连接成功");
  }
});

db.serialize(() => {
  db.run(
    `
    CREATE TABLE IF NOT EXISTS canvases (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
    (err) => {
      if (err) {
        console.error("建表失败:", err.message);
      } else {
        console.log("canvases 表初始化成功");
      }
    },
  );

  // 创建快照表
  db.run(
    `
    CREATE TABLE IF NOT EXISTS snapshots (
      id TEXT PRIMARY KEY,
      canvas_id TEXT,
      name TEXT,
      data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (canvas_id) REFERENCES canvases(id)
    )
  `,
    (err) => {
      if (err) {
        console.error("snapshots 表初始化失败:", err.message);
      } else {
        console.log("snapshots 表初始化成功");
      }
    },
  );
});

// ============ 图片上传配置 ============
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync("uploads")) {
      fs.mkdirSync("uploads");
    }
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "img-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("只支持PNG/JPG格式的图片"), false);
    }
  },
});

// ============ 图片上传接口 ============
app.post("/assets/images", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      code: 400,
      message: "没有上传图片文件",
    });
  }

  const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;

  res.json({
    code: 200,
    message: "上传成功",
    url: imageUrl,
  });
});

// ============ 画布 CRUD 接口 ============

// POST /canvases - 创建画布
app.post("/canvases", (req, res) => {
  const { id, name, data } = req.body;

  if (!id || !name) {
    return res.status(400).json({
      code: 400,
      message: "缺少必要参数：id 和 name",
    });
  }

  const stmt = db.prepare(`
    INSERT INTO canvases (id, name, data, created_at, updated_at)
    VALUES (?, ?, ?, datetime('now'), datetime('now'))
  `);

  stmt.run(id, name, data || "", (err) => {
    if (err) {
      if (err.message.includes("UNIQUE constraint failed")) {
        return res.status(409).json({
          code: 409,
          message: "画布 ID 已存在",
        });
      }
      return res.status(500).json({
        code: 500,
        message: "创建画布失败: " + err.message,
      });
    }

    res.status(201).json({
      code: 201,
      message: "创建画布成功",
      data: { id, name },
    });
  });

  stmt.finalize();
});

// GET /canvases - 获取画布列表
app.get("/canvases", (req, res) => {
  db.all(
    `
    SELECT id, name, created_at, updated_at
    FROM canvases
    ORDER BY updated_at DESC
  `,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({
          code: 500,
          message: "获取画布列表失败: " + err.message,
        });
      }

      res.json({
        code: 200,
        message: "获取成功",
        data: rows,
      });
    },
  );
});

// GET /canvases/:id - 获取单个画布详情
app.get("/canvases/:id", (req, res) => {
  const { id } = req.params;

  db.get(
    `
    SELECT id, name, data, created_at, updated_at
    FROM canvases
    WHERE id = ?
  `,
    [id],
    (err, row) => {
      if (err) {
        return res.status(500).json({
          code: 500,
          message: "获取画布详情失败: " + err.message,
        });
      }

      if (!row) {
        return res.status(404).json({
          code: 404,
          message: "画布不存在",
        });
      }

      res.json({
        code: 200,
        message: "获取成功",
        data: row,
      });
    },
  );
});

// PUT /canvases/:id - 更新画布
app.put("/canvases/:id", (req, res) => {
  const { id } = req.params;
  const { name, data } = req.body;

  if (!name && data === undefined) {
    return res.status(400).json({
      code: 400,
      message: "缺少更新参数",
    });
  }

  // 先检查画布是否存在
  db.get(`SELECT id FROM canvases WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return res.status(500).json({
        code: 500,
        message: "更新画布失败: " + err.message,
      });
    }

    if (!row) {
      return res.status(404).json({
        code: 404,
        message: "画布不存在",
      });
    }

    // 执行更新
    const updates = [];
    const values = [];

    if (name) {
      updates.push("name = ?");
      values.push(name);
    }
    if (data !== undefined) {
      updates.push("data = ?");
      values.push(data);
    }
    updates.push("updated_at = datetime('now')");
    values.push(id);

    const sql = `UPDATE canvases SET ${updates.join(", ")} WHERE id = ?`;

    db.run(sql, values, function (err) {
      if (err) {
        return res.status(500).json({
          code: 500,
          message: "更新画布失败: " + err.message,
        });
      }

      res.json({
        code: 200,
        message: "更新画布成功",
        data: { id, name, data },
      });
    });
  });
});

// DELETE /canvases/:id - 删除画布
app.delete("/canvases/:id", (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM canvases WHERE id = ?`, [id], function (err) {
    if (err) {
      return res.status(500).json({
        code: 500,
        message: "删除画布失败: " + err.message,
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        code: 404,
        message: "画布不存在",
      });
    }

    res.json({
      code: 200,
      message: "删除画布成功",
    });
  });
});

// ============ 版本快照接口 ============

// 生成唯一ID的辅助函数
function generateId() {
  return "id-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
}

// POST /canvases/:id/snapshots - 生成快照
app.post("/canvases/:id/snapshots", (req, res) => {
  const { id } = req.params;
  const { name, data } = req.body;

  // 检查画布是否存在
  db.get(`SELECT id FROM canvases WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return res.status(500).json({
        code: 500,
        message: "生成快照失败: " + err.message,
      });
    }

    if (!row) {
      return res.status(404).json({
        code: 404,
        message: "画布不存在",
      });
    }

    if (!data) {
      return res.status(400).json({
        code: 400,
        message: "缺少画布数据",
      });
    }

    // 生成快照ID和名称
    const snapshotId = generateId();
    const snapshotName = name || "自动保存-" + new Date().toLocaleString();

    // 插入快照
    const stmt = db.prepare(`
      INSERT INTO snapshots (id, canvas_id, name, data, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `);

    stmt.run(snapshotId, id, snapshotName, data, (err) => {
      if (err) {
        return res.status(500).json({
          code: 500,
          message: "生成快照失败: " + err.message,
        });
      }

      res.status(201).json({
        code: 201,
        message: "快照生成成功",
        data: {
          id: snapshotId,
          canvas_id: id,
          name: snapshotName,
          created_at: new Date().toISOString(),
        },
      });
    });

    stmt.finalize();
  });
});

// GET /canvases/:id/snapshots - 获取历史版本列表
app.get("/canvases/:id/snapshots", (req, res) => {
  const { id } = req.params;

  // 检查画布是否存在
  db.get(`SELECT id FROM canvases WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return res.status(500).json({
        code: 500,
        message: "获取快照列表失败: " + err.message,
      });
    }

    if (!row) {
      return res.status(404).json({
        code: 404,
        message: "画布不存在",
      });
    }

    // 获取快照列表（按时间倒序）
    db.all(
      `
      SELECT id, name, created_at
      FROM snapshots
      WHERE canvas_id = ?
      ORDER BY created_at DESC
    `,
      [id],
      (err, rows) => {
        if (err) {
          return res.status(500).json({
            code: 500,
            message: "获取快照列表失败: " + err.message,
          });
        }

        res.json({
          code: 200,
          message: "获取快照列表成功",
          data: rows,
        });
      },
    );
  });
});

// GET /canvases/:id/snapshots/:snapshotId - 恢复指定版本
app.get("/canvases/:id/snapshots/:snapshotId", (req, res) => {
  const { id, snapshotId } = req.params;

  // 检查画布是否存在
  db.get(`SELECT id FROM canvases WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return res.status(500).json({
        code: 500,
        message: "获取快照失败: " + err.message,
      });
    }

    if (!row) {
      return res.status(404).json({
        code: 404,
        message: "画布不存在",
      });
    }

    // 获取指定快照
    db.get(
      `
      SELECT id, name, data, created_at
      FROM snapshots
      WHERE id = ? AND canvas_id = ?
    `,
      [snapshotId, id],
      (err, row) => {
        if (err) {
          return res.status(500).json({
            code: 500,
            message: "获取快照失败: " + err.message,
          });
        }

        if (!row) {
          return res.status(404).json({
            code: 404,
            message: "快照不存在",
          });
        }

        res.json({
          code: 200,
          message: "获取快照成功",
          data: {
            id: row.id,
            name: row.name,
            data: row.data,
            created_at: row.created_at,
          },
        });
      },
    );
  });
});

// ============ 错误处理中间件 ============
app.use((err, req, res, next) => {
  console.error("服务器错误:", err.message);

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        code: 400,
        message: "图片大小不能超过5MB",
      });
    }
    return res.status(400).json({
      code: 400,
      message: err.message,
    });
  }

  res.status(500).json({
    code: 500,
    message: "服务器内部错误",
  });
});

// ============ 启动服务器 ============
app.listen(PORT, () => {
  console.log(`后端服务运行在 http://localhost:${PORT}`);
});

// 处理进程退出时关闭数据库连接
process.on("SIGINT", () => {
  db.close((err) => {
    if (err) {
      console.error("关闭数据库失败:", err.message);
    } else {
      console.log("数据库连接已关闭");
    }
    process.exit(0);
  });
});
