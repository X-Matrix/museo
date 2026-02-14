# Museo - 现代化艺术品搜索引擎 🎨

## 最新优化特性 ✨

### 1. **更加丰富的艺术品信息展示**
- ✅ 悬停时显示艺术品详细信息（标题、艺术家、创作年代、所属博物馆）
- ✅ 显示文化背景和创作媒介（如有）
- ✅ 显示Useum作品的人气值（❤️ hearts）
- ✅ 优雅的信息叠加层动画效果
- ✅ 渐进式信息展示，不影响浏览体验
- ✅ 所有7个博物馆API统一返回丰富的元数据

### 2. **现代化的视觉设计**
- ✅ 精美的渐变背景和径向光晕效果
- ✅ 流畅的缩放和过渡动画
- ✅ 优雅的悬停交互效果
- ✅ 搜索框焦点状态的视觉反馈
- ✅ 波动的装饰分隔线动画

### 3. **增强的搜索体验**
- ✅ 改进的搜索框设计，带有图标
- ✅ 实时搜索结果计数徽章
- ✅ 更丰富的搜索占位符建议（26+种）
- ✅ 响应式设计，移动端优化

### 4. **优雅的加载状态**
- ✅ 骨架屏加载动画（12个渐入的占位卡片）
- ✅ 闪烁效果模拟内容加载
- ✅ 单张图片的加载spinner
- ✅ 图片渐入动画效果

### 5. **更好的用户体验**
- ✅ 错别的图片自动移除
- ✅ 平滑滚动
- ✅ 交错动画出现（每张卡片有延迟）
- ✅ 空状态提示优化

## 主要改进的文件

### 页面组件
- **[index.js](src/pages/index.js)** - 添加了ArtworkCard组件、结果计数、加载骨架屏
- **[SearchInput.js](src/components/SearchInput.js)** - 添加焦点状态、搜索图标、更多占位符

### 样式文件
- **[Home.module.css](src/styles/Home.module.css)** - 完整重写，添加：
  - 艺术品卡片动画
  - 信息叠加层样式
  - 加载骨架屏
  - 结果计数徽章
  - 响应式调整

- **[SearchInput.module.css](src/styles/SearchInput.module.css)** - 现代化设计：
  - 阴影和焦点效果
  - 按钮涟漪动画
  - 响应式布局

- **[globals.css](src/styles/globals.css)** - 添加径向渐变背景和平滑滚动

### API增强
- **[ai-chicago.js](src/pages/api/ai-chicago.js)** - 添加艺术家、日期、博物馆、媒介字段
- **[useum.js](src/pages/api/useum.js)** - 添加艺术家、日期、博物馆、人气值字段
- **[rijks.js](src/pages/api/rijks.js)** - 添加艺术家、日期、博物馆字段
- **[harvard.js](src/pages/api/harvard.js)** - 添加艺术家、日期、博物馆、文化字段
- **[artsmia.js](src/pages/api/artsmia.js)** - 添加艺术家、日期、博物馆、文化字段
- **[cleveland.js](src/pages/api/cleveland.js)** - 添加艺术家、日期、博物馆、文化、媒介字段
- **[nypl.js](src/pages/api/nypl.js)** - 添加创作者、日期、博物馆、收藏信息字段

## API返回数据结构

所有API现在返回统一的丰富数据结构：

```javascript
{
  title: "艺术品标题",
  image: "图片URL",
  url: "详情页URL",
  artist: "艺术家名称",           // 新增
  date: "创作日期/年代",          // 新增
  museum: "所属博物馆",           // 新增
  culture: "文化背景",            // 新增 (部分API)
  medium: "创作媒介",             // 新增 (部分API)
  popularity: 123,              // 新增 (Useum专有)
  collection: "收藏系列"          // 新增 (NYPL专有)
}
```

## 视觉效果预览

### 🎯 关键交互
1. **搜索框焦点** → 升起效果 + 绿色光晕
2. **搜索按钮悬停** → 涟漪扩散动画
3. **艺术品悬停** → 图片缩放 + 信息滑入
4. **页面加载** → 骨架屏闪烁 → 交错渐入
5. **结果显示** → 绿色徽章展示数量

### 🎨 动画时序
- 骨架屏：0.1秒延迟间隔
- 卡片出现：0.05秒延迟间隔
- 信息叠加：0.4秒滑入动画
- 图片缩放：0.5秒过渡

## 技术栈
- **Next.js 16.1.6** - React框架
- **React Query** - 数据获取
- **CSS Modules** - 样式隔离
- **Lazysizes** - 图片懒加载

## 开发运行

```bash
# 安装依赖
yarn install

# 启动开发服务器
yarn dev

# 构建生产版本
yarn build

# 部署到Cloudflare Pages
yarn pages:deploy
```

访问 http://localhost:3000 查看效果

## 未来优化建议

- [ ] 添加图片全屏查看功能
- [ ] 实现搜索历史记录
- [ ] 添加筛选器（时期、艺术家、博物馆）
- [ ] 支持无限滚动加载更多
- [ ] 添加收藏夹功能
- [ ] 实现暗色/亮色主题切换
- [ ] 添加分享功能
- [ ] 支持图片下载

## 致谢
感谢世界各大博物馆提供的开放API：
- Art Institute of Chicago
- Rijksmuseum
- Harvard Art Museums
- Minneapolis Institute of Art
- The Cleveland Museum of Art
- New York Public Library

---

**Made with ❤️ and modern web technologies**
