# 会议资源支持评分系统

这是一个市场部会议资源支持评分工具，支持会议申请录入、评分计算、过往申请查看和导出。

## 运行方式

### 公网版本（推荐）

1. 在 Supabase 创建项目。
2. 打开 Supabase SQL Editor，执行 `supabase_schema.sql`。
3. 在 Supabase Auth 中创建内部同事账号。
4. 修改 `cloud-config.js`，填入 Supabase anon public key：

```js
window.MEETING_SUPPORT_CLOUD_CONFIG = {
  enabled: true,
  supabaseUrl: "https://liqbfzbrjyvccjcktaxy.supabase.co",
  supabaseAnonKey: "你的 anon public key",
  tableName: "applications",
  authRequired: true,
  cloudOnly: true
};
```

5. 将 `index.html`、`history.html`、`cloud-config.js`、`cloud-data.js` 发布到 GitHub Pages。

配置完成后，同事通过 GitHub Pages 公网地址访问，申请记录会保存到 Supabase 云数据库，电脑关机或本地服务关闭不会影响使用。

### 当前模式

当前已启用 `cloudOnly: true`，页面保存、读取、删除、清空均只访问 Supabase 云数据库，不再依赖本地 Python 服务或本地 Excel。

## 数据说明

- 公网版本以 Supabase `applications` 表作为主数据源。
- 过往申请页从云端读取同一份记录，支持查看、删除、清空和导出 CSV。
- 本地 Excel 不再作为实时数据库；如需 Excel 文件，可在过往申请页导出。

## GitHub Pages 注意事项

GitHub Pages 只能托管静态网页，不能运行 Python 后端，也不能直接写入本机 Excel。  
因此公网共享时应使用：

- GitHub Pages：托管页面
- Supabase：保存和读取申请数据

## 主要文件

- `index.html`：评分申请页面
- `history.html`：过往申请一览页面
- `cloud-config.js`：云端配置
- `cloud-data.js`：Supabase 云端数据层
- `supabase_schema.sql`：Supabase 建表和权限 SQL
- `excel_server.py`：历史本地服务文件，公网云端模式不再使用
