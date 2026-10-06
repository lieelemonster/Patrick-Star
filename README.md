# 派大星 · 个人网站

一个纯静态的单页个人网站。**零依赖、零构建**，整个文件夹可以直接丢到任何静态托管上。

> 本地预览请用 `python3 -m http.server` 之类的本地服务器打开（见下面「本地预览」），**不要双击 `index.html`** —— 那样角色扮演机器人的聊天窗口会打不开。

## ⚠️ 上线前检查清单

`index.html` 最上方有一段说明，**全文搜索 `TODO` 可以定位到每一处**。要替换的东西：

| # | 内容 | 处数 | 现状 |
| --- | --- | --- | --- |
| 1 | 邮箱 | 3 | `hi@example.com`（这个域名**不收邮件**，访客写了会退信） |
| 2 | 社交主页 | 5 | 即刻 / 少数派 / GitHub **指向平台首页，不是你的主页**，需要补上你的用户 ID |
| 3 | 文章链接 | 8 | 都指向 `example.com` |
| 4 | `og:image` | 2 | 部署后换成绝对地址 |

**第 3 条要特别注意**：`example.com` 是 IANA 保留的示例域名，**它是一个真实可访问的网页**，不是打不开的假链接 —— 点进去会看到英文的 "Example Domain"。所以**在换成真实文章链接之前，不要对外发布这个网站**，否则访客点你 8 篇文章全都跳到那个英文测试页。

> 改了链接之后想快速自检，可以在浏览器控制台跑一行，看看还有没有残留的占位链接：
>
> ```js
> [...document.querySelectorAll('a[href*="example.com"]')].map(a => a.textContent.trim())
> ```

## 文件说明

| 文件 | 作用 |
| --- | --- |
| `index.html` | 页面内容和文字，都在这里改 |
| `styles.css` | 所有样式，顶部 `:root` 里是配色变量 |
| `script.js` | 深色模式、滚动动画、导航高亮、阅读进度条、唤醒机器人 |
| `og-image.png` | 分享到微信 / 即刻 / X 时的预览大图（1200×630） |
| `tools/og-source.html` | 用来重新生成 `og-image.png` 的模板，**部署时不需要上传** |

## 怎么改内容（不用懂代码）

打开 `index.html`，按注释找位置：

- **加一篇文章**：找到 `<!-- ↓↓↓ 想加文章？ -->` 那一段，把整组 `<a class="post"> … </a>` 复制一份，改动四个地方即可：
  1. `href="..."` → 文章链接
  2. `<time datetime="2026-08-12">2026.08</time>` → 日期
  3. `<span class="post-title">…</span>` → 标题
  4. `<span class="post-tag">…</span>` → 标签（可留空）

  想换顺序，直接上下移动整组 `<a class="post">` 就行。

- **改「现在」**：找到 `<section class="section" id="now">`，每条 `<div class="kv">` 就是一个"在做 / 在学 / 在想"。想加一条就复制一组，改 `<span class="kv-key">` 和 `<p class="kv-val">`。

- **改「碎碎念」**：找到 `id="notes"`，每张 `<blockquote class="note">` 是一张卡片。

- **改联系方式**：全文搜索 `example.com` 和 `hi@example.com`，替换成你自己的邮箱和链接（邮箱会出现 3 处：首屏按钮、关于区、以及 `mailto:`）。

- **改配色**：打开 `styles.css`，改最上面 `:root` 里的 `--accent`（点缀色）、`--bg`（背景）、`--text`（正文色）。深色模式在下面的 `html[data-theme="dark"]` 里。

## 小实验：角色扮演机器人

页面底部（`</body>` 前）接了一个 Dify 的对话机器人，右下角那个圆形按钮就是它，「小实验」区块里的「开始对话」也能叫出来。

**换一个机器人**：改 `index.html` 里 `window.difyChatbotConfig` 的 `token`，以及下面 `<script src="https://udify.app/embed.min.js" id="...">` 的 `id`，**两处要改成同一个值**。

**指定角色**：这个机器人的 Start 节点里有个变量叫 `role`。想固定角色就填 `inputs: { role: '面试官' }`；留空的话访客自己在窗口里选。

**记住聊天记录**：把 `systemVariables.user_id` 填一个访客唯一 ID，关掉再打开还能看到上次的对话。

> ⚠️ **两个坑，改之前先看一眼**
>
> 1. **必须用 http 打开，不能双击 `index.html`。**
>    Dify 那边返回的 CSP 是 `frame-ancestors *`，而那个 `*` 只匹配 http/https，**不匹配 `file://`**。所以用 `file://` 打开时脚本会正常加载、按钮也在，但聊天窗口的 iframe 会被浏览器拒绝，点开是一片空白。用下面的本地服务器打开就正常。
>
> 2. **改动 CSS 后记得硬刷新（Cmd + Shift + R）。**
>    本地静态服务器会发缓存，不硬刷新的话你看到的还是旧样式（我调试时就踩了这个坑，改了半天没生效）。
>
> 另外 `styles.css` 里有这么一段，**别删**：
>
> ```css
> #dify-chatbot-bubble-window { position: fixed !important; }
> ```
>
> Dify 给聊天窗口的定位是 `position: absolute`，但页面上没有定位祖先元素，于是它是相对**文档顶部**锚定的 —— 页面一长，你滚动到下方再点开窗口，它其实开在了视口上方两千多像素的地方，等于看不见。改成 `fixed` 才对。
> 注意这里**故意没有覆盖宽高**：Dify 自己用内联样式做了响应式（`max-width: calc(100vw - 2rem)`），而且窗口右上角的「展开」靠的就是改高度，一旦覆盖宽高就展不开了。

## 分享预览图（og-image.png）

把网站链接发到微信、即刻、X（Twitter）、Slack 等地方时，会显示一张预览卡片，用到的就是 `og-image.png`。
相关标签写在 `index.html` 开头（`og:*` 和 `twitter:*`）。

**⚠️ 部署后必做一步**：把 `index.html` 里这两处

```html
<meta property="og:image" content="og-image.png" />
<meta name="twitter:image" content="og-image.png" />
```

换成绝对地址，否则部分平台抓不到图：

```html
<meta property="og:image" content="https://你的域名/og-image.png" />
<meta name="twitter:image" content="https://你的域名/og-image.png" />
```

顺手把注释里的 `og:url` 也打开、填上你的真实网址。

**想换预览图的样子**：改 `tools/og-source.html`（就是一张 1200×630 的设计稿），然后重新导出。因为浏览器绘制区域可能小于 630px，模板里用 `transform: scale(0.59333)` 把设计稿缩小后再截，导出后要等比放大回 1200×630：

1. 本地服务器打开 `tools/og-source.html`，对 `#stage` 元素截图（得到 1424×748）
2. 把图缩放到 1200×630

macOS 上可以用自带命令缩放，不会变形（1424×748 与 1200×630 比例一致）：

```bash
sips -z 630 1200 og-image.png
```

> 小坑记录：一开始直接按 1200×630 截图，下半部分总是空白 —— 因为 Chromium 不绘制视口以外的内容，而浏览器窗口只有三百多像素高。另外注意 `og:image` 的比例必须是 1.91:1，非等比缩放会把图片压扁。

## 本地预览

> **别直接双击 `index.html`** —— 这样打开的话，角色扮演机器人的聊天窗口出不来（原因见上面「两个坑」）。用下面任一方式起个本地服务器，然后访问 http://localhost:8000

- 有 Python：

  ```bash
  cd "/Users/a1-6/个人网站1"
  python3 -m http.server 8000
  ```

- 有 Node：`npx serve -l 8000`
- 有 Ruby：`ruby -run -e httpd . -p 8000`
- 或者用 VS Code 的 Live Server 插件

如果 Python 弹窗提示要装 Xcode 命令行工具，说明这台机器上没装 python3，换 Node / Ruby 的方式即可。

## 上线

### 已经打好包：`site.zip`

目录下有一个 `site.zip`（约 200 KB），里面就是上线需要的全部文件（`index.html`、`styles.css`、`script.js`、`og-image.png`、`.nojekyll`），`index.html` 在压缩包**根目录**，可以直接丢给任何静态托管。

改动过网站内容后要重新打包：

```bash
cd "/Users/a1-6/个人网站1"
rm -rf .deploy site.zip && mkdir -p .deploy
cp index.html styles.css script.js og-image.png .nojekyll .deploy/
cd .deploy && zip -r ../site.zip . && cd ..
```

### 方式一：Netlify Drop（最快，不用装任何东西）

打开 https://app.netlify.com/drop ，把 **`site.zip` 拖进去**（或点页面上的 file 按钮选它），几秒后出网址。

> **⚠️ 匿名部署的两个限制（实测确认）**
>
> 不动任何账号、直接拖 zip，Netlify 会给你一个立刻可访问的网址，但：
>
> 1. **只保留 1 小时**，1 小时内不「认领（Claim）」就自动删除；
> 2. **带密码保护**，访客需要密码才能看（密码会在部署结果页显示，类似 `My-Drop-Site`）。
>
> 也就是说匿名部署适合**临时预览**，不适合当作正式上线。要长期保留，必须在 1 小时内点结果页的 **Claim this site**，用一个免费 Netlify 账号认领（认领后密码保护消失、站点长期在线）。

### 方式二：长期托管（需要你自己的账号）

- **Netlify / Cloudflare Pages**：注册后把 `site.zip` 拖进去，或从 Dashboard 直接上传。免费套餐足够个人站用。
- **GitHub Pages**：新建仓库 → 用网页的 **Add file → Upload files** 把文件上传上去（网页上传**不需要装 git**）→ Settings → Pages → 选 `main` 分支根目录。网址形如 `用户名.github.io/仓库名`。
- **Vercel**：网页端需要先绑定 Git 仓库，本机没装 git 的话走不太通，建议用上面两个。
- **自己的服务器**：把文件丢进网站根目录。

### 上线后必做

1. 把 `og:image` / `twitter:image` 换成**绝对地址**（见上面「分享预览图」），否则微信、X 抓不到预览图。
2. 替换掉文中的占位链接：邮箱 `hi@example.com`（2 处可点击 + 1 处显示文字）和 3 个社交主页（即刻 / 少数派 / GitHub，现在指向平台首页而不是你的主页）。
3. 文章区目前是「整理中」状态 —— 8 条示例链接因指向 `example.com` 已临时注释掉，恢复方法见 `index.html` 里 `文章列表备份开始` 处的说明。

## 已知限制

- **角色扮演机器人右上角的「展开」点了不变大。** 这是 Dify 嵌入本身的行为：用你最初给的原始代码（未做任何修改）单独测试，展开同样不改变窗口尺寸。原因是原始代码里 `#dify-chatbot-bubble-window { height: 40rem !important }` 把高度钉死了；本项目已经去掉这层覆盖，所以它至少不会比原始代码更差。窗口尺寸由 Dify 自己按视口计算，聊天功能不受影响。

## 已内置的细节

- 深浅色主题，会记住你的选择，也会跟随系统设置
- 滚动时内容逐个淡入（系统开了「减少动态效果」会自动关闭）
- 桌面端顶部细进度条 + 导航自动高亮当前区块
- 响应式：320px 到 4K 都不会横向溢出，手机上单栏显示
- 全站键盘可导航，焦点环完整（没有用 `outline: none` 抹掉）
- 关闭 JS 时页面内容依然完整可见（动画效果不生效而已）
- 分享预览卡片（`og-image.png`）
- 「小实验」卡片和「碎碎念」卡片悬停会轻微上浮，卡片里的星星会转一下
- Dify 浮动按钮跟随站点点缀色，深浅色模式自动切换
