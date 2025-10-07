# 虚拟女友生成器 (Virtual Girlfriend Generator)

这是一个基于 React、Vite、Supabase 和 Google Gemini AI 的 Web 应用。它允许用户生成虚拟女友的图片，甚至可以将用户自己的照片与虚拟角色合成一张自然的合照。用户还可以创建、定义和保存自己独有的虚拟角色。

## ✨ 核心功能

- **用户认证系统**:
  - 支持 **Google OAuth** 和 **邮箱魔法链接 (Magic Link)** 两种登录方式。
  - 基于 Supabase Auth 实现，安全可靠。
  - 未登录用户可以浏览，但生成图片需要登录。

- **安全的积分系统**:
  - 新用户首次注册自动获得 **10个试用积分**。
  - 每次生成图片消耗10个积分。
  - 积分的创建和扣减逻辑均通过 PostgreSQL 的安全函数和触发器在**服务器端**完成，防止客户端作弊。

- **AI 图像生成 (Google Gemini)**:
  - **单人照片生成**: 选择一个虚拟角色并输入自定义提示词，生成该角色的单人照片。
  - **AI 融合与合照**: 用户上传自己的照片后，AI 会将用户和所选的虚拟角色无缝融合到一张全新的、看起来像真实合照的图片中。模型被特别指示要保持两个角色的原始相貌。

- **角色定制与管理**:
  - 提供一系列预设的虚拟女友角色供用户快速选择。
  - 登录用户可以**创建自己的虚拟角色**，包括上传头像、定义名称、描述和核心的AI提示词。
  - 用户创建的角色被安全地保存在 Supabase 中，并使用**行级安全策略 (RLS)** 确保只有创建者本人可见。

- **响应式与现代化UI**:
  - 使用 Tailwind CSS 构建，在桌面和移动设备上都有良好的体验。
  - 包含加载动画、错误提示和清晰的用户引导。

## 🛠️ 技术栈

- **前端**: React, Vite, TypeScript, Tailwind CSS
- **后端 & 数据库**: Supabase (PostgreSQL, Auth, Storage)
- **AI 模型**: Google Gemini Pro Vision

## 🚀 本地部署与运行

请按照以下步骤在您的本地环境中设置和运行此项目。

### 1. 克隆仓库

```bash
git clone <your-repository-url>
cd <repository-name>
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

在项目根目录下创建一个名为 `.env` 的文件，并填入以下内容。

```env
# Supabase 配置
VITE_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"

# Google Gemini API 配置
VITE_GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

#### 如何获取这些 Key？

- **Supabase**:
  1. 在 [supabase.com](https://supabase.com) 创建一个新项目。
  2. 进入项目的 `Project Settings` > `API`。
  3. 复制 `Project URL` 和 `anon` `public` key 并填入 `.env` 文件。

- **Google Gemini**:
  1. 访问 [Google AI Studio](https://aistudio.google.com/)。
  2. 点击 `Get API key` 创建一个新的 API 密钥。
  3. 复制密钥并填入 `.env` 文件。

### 4. 设置 Supabase 数据库

为了让积分系统和自定义角色功能正常工作，您需要在 Supabase 项目的 SQL Editor 中运行以下脚本：

1.  **创建 `profiles` 表并设置新用户触发器** (用于管理积分)
2.  **创建 `deduct_credits` 函数** (用于安全地扣除积分)
3.  **创建 `user_girlfriends` 表** (用于存储用户自定义角色)
4.  **创建 `girlfriend_avatars` 存储桶** (用于存储角色头像)
5.  **为 `user_girlfriends` 表和 `girlfriend_avatars` 存储桶设置行级安全策略 (RLS)**

> **注意**: 相关的 SQL 脚本在开发过程中已经生成，请参考项目文档或历史记录找到它们并按顺序执行。

### 5. 运行开发服务器

```bash
npm run dev
```

现在，您可以在浏览器中打开 `http://localhost:5173` 来访问应用了。

## 📖 如何使用

1.  **登录/注册**: 点击右上角的 "Login" 按钮，选择 Google 或邮箱进行登录。如果是第一次登录，系统会自动为您创建一个账户并赠送10个积分。
2.  **选择角色**:
    - 从预设角色列表中点击选择一个您喜欢的角色。
    - 或者，如果您已登录，可以点击 `+ Create New` 按钮来创建并上传您自己的角色。
3.  **生成图片**:
    - **生成单人照**: 选择一个角色后，直接点击 `Generate Image` 按钮。
    - **生成合照**: 在左侧上传您自己的照片，然后再选择一个角色，最后点击 `Generate Image`。
4.  **自定义场景**: 在生成图片之前，您可以在下方的输入框中添加额外的提示词（如 "at the beach", "in a coffee shop"）来控制生成的场景和氛围。
5.  **查看结果**: AI 生成的图片会显示在页面上。您可以选择保存图片或点击 "Generate Another" 返回主界面。