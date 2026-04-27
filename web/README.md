# GO狗GO 网页版使用说明

## 架构说明

- **前端**：单个 `index.html`，无需任何框架，手机/电脑浏览器直接打开
- **后端**：[Supabase](https://supabase.com)（免费云数据库）
  - 所有人成绩汇聚到同一数据库，管理员可实时查看全员成绩
  - 免费套餐：500MB 存储 + 5万行数据，完全够用
- **费用**：¥0（Supabase 免费套餐 + Vercel/GitHub Pages 免费部署）

---

## 第一步：注册并配置 Supabase

### 1.1 注册账号
访问 [https://supabase.com](https://supabase.com)，用邮箱免费注册。

### 1.2 创建新项目
- 点击 "New Project"
- 项目名：随便填（如 `gogodog-exam`）
- 数据库密码：设一个强密码（记住，后面用不到）
- Region：选 **Northeast Asia (Tokyo)**（延迟最低）
- 点击 "Create new project"，等待 1-2 分钟创建完成

### 1.3 获取 URL 和 Key
创建完成后：
1. 左侧菜单 → **Project Settings** → **API**
2. 复制 **Project URL**（格式：`https://xxxxxxxx.supabase.co`）
3. 复制 **anon public** 下的 Key（很长的一串 JWT）

### 1.4 初始化数据库（必须执行一次）
1. 左侧菜单 → **SQL Editor**
2. 点击 "New query"
3. 粘贴以下 SQL 并点击 **RUN**：

```sql
-- GO狗GO 初始化 SQL
-- 考试设置表
CREATE TABLE IF NOT EXISTS exam_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  exam_title TEXT DEFAULT 'GO狗GO 在线考试',
  exam_duration INT DEFAULT 30,
  pass_score INT DEFAULT 60,
  question_order TEXT DEFAULT 'sequence',
  admin_password TEXT DEFAULT 'admin123',
  notice TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 题目表
CREATE TABLE IF NOT EXISTS exam_questions (
  id BIGSERIAL PRIMARY KEY,
  sort_order INT DEFAULT 0,
  type TEXT NOT NULL DEFAULT 'single',
  content TEXT NOT NULL,
  option_a TEXT DEFAULT '',
  option_b TEXT DEFAULT '',
  option_c TEXT DEFAULT '',
  option_d TEXT DEFAULT '',
  correct_answer TEXT DEFAULT '',
  correct_text TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 成绩表
CREATE TABLE IF NOT EXISTS exam_records (
  id BIGSERIAL PRIMARY KEY,
  user_name TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  score INT NOT NULL,
  correct_count INT NOT NULL,
  total_count INT NOT NULL,
  pass_score INT NOT NULL,
  grade TEXT NOT NULL,
  submit_time TIMESTAMPTZ DEFAULT now()
);

-- 关闭 RLS（内网使用，简单模式）
ALTER TABLE exam_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE exam_records DISABLE ROW LEVEL SECURITY;

-- 插入默认设置
INSERT INTO exam_settings (id) VALUES ('main') ON CONFLICT (id) DO NOTHING;
```

---

## 第二步：部署网页（三选一）

### 方式 A：直接发文件（最简单，适合局域网/临时用）
把 `index.html` 直接发给同事，用浏览器打开。
> ⚠️ 注意：因为数据存在 Supabase，每个人打开都能连上同一个数据库。
> 但因为浏览器安全限制，每个人第一次打开都需要手动填一次 Supabase URL 和 Key。
> 建议使用下面的部署方式，把 URL/Key 直接写死在文件里。

**把 URL/Key 写死的方法**：
打开 `index.html`，找到最底部 `window.addEventListener('DOMContentLoaded', ...)` 里的初始化代码，
改成：
```js
window.addEventListener('DOMContentLoaded', () => {
  SB.init('https://你的项目.supabase.co', '你的anon-key');
  if (LC.get('adminLoggedIn', false) && location.hash === '#admin') {
    goTo('admin'); initAdmin();
  } else {
    goTo('login'); initLogin();
  }
});
```
这样所有人打开就直接进入考试页，不用配置。

### 方式 B：Vercel 部署（推荐，有公网链接）
1. 注册 [Vercel](https://vercel.com)（免费）
2. 把 `web/` 文件夹推送到 GitHub 仓库
3. 在 Vercel 导入该仓库，一键部署
4. 得到类似 `https://你的项目.vercel.app` 的链接，发给所有人

### 方式 C：局域网部署
在公司一台电脑上运行：
```bash
cd web
python -m http.server 8080
```
所有人访问 `http://局域网IP:8080/index.html`

---

## 第三步：首次使用配置

打开网页后会看到 **Supabase 配置页**：
1. 填入第一步获取的 **URL** 和 **Anon Key**
2. 点击「连接并开始使用」
3. 连接成功后自动进入考试页

> 配置会保存在浏览器 localStorage，下次打开不需要再填。

---

## 日常使用

### 员工端（考试）
- 填写姓名 + 手机号 → 开始答题 → 交卷 → 看成绩
- 成绩自动上传到 Supabase，管理员可看到

### 管理员端
- 点击页面底部「管理员入口」
- 默认密码：`admin123`（请及时修改）
- 可管理：考试设置、题目增删改、查看**所有人**成绩、导出 CSV

---

## 功能列表

| 功能 | 说明 |
|------|------|
| 答题 | 支持单选、多选、判断、填空、问答 5 种题型 |
| 倒计时 | 时间结束自动交卷 |
| 题目导航 | 点击题号快速跳转 |
| 随机出题 | 可设置随机顺序 |
| 成绩汇总 | **所有人成绩汇聚到同一数据库**，管理员实时查看 |
| 题目批量导入 | 粘贴文本即可批量添加题目 |
| 成绩导出 | 导出 CSV 到 Excel |
| 云端同步 | 题目和设置修改后所有人实时生效 |

---

## 常见问题

**Q：连接失败怎么办？**
1. 确认 URL 和 Key 没有多余空格
2. 确认已执行初始化 SQL
3. 检查 Supabase 项目是否正常运行（项目首页能看到绿色状态）

**Q：Supabase 免费套餐够用吗？**
免费套餐限制：500MB 存储、5万行记录、每月 5GB 流量。
100 人考试、1000 道题，完全够用。

**Q：数据安全吗？**
Supabase 数据存储在 AWS 服务器，已关闭 RLS（Row Level Security）简化使用。
如果在公司内网部署，建议只在内网访问，不要把链接发到外网。
