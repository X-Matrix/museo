/**
 * 颜色提取和匹配工具
 */

// 预定义的颜色筛选选项
export const COLOR_FILTERS = [
  // 暖色系 - 红色调
  { name: '红色', rgb: [220, 50, 50], tolerance: 85, category: 'warm' },
  { name: '深红', rgb: [140, 40, 40], tolerance: 75, category: 'warm' },
  { name: '橙红', rgb: [240, 80, 50], tolerance: 80, category: 'warm' },
  
  // 暖色系 - 橙黄调
  { name: '橙色', rgb: [255, 140, 50], tolerance: 85, category: 'warm' },
  { name: '金黄', rgb: [230, 180, 50], tolerance: 80, category: 'warm' },
  { name: '黄色', rgb: [255, 230, 80], tolerance: 85, category: 'warm' },
  
  // 暖色系 - 粉红调
  { name: '粉色', rgb: [255, 180, 200], tolerance: 85, category: 'warm' },
  { name: '玫红', rgb: [200, 80, 130], tolerance: 80, category: 'warm' },
  
  // 冷色系 - 绿色调
  { name: '绿色', rgb: [80, 180, 80], tolerance: 85, category: 'cool' },
  { name: '深绿', rgb: [50, 100, 50], tolerance: 75, category: 'cool' },
  { name: '青绿', rgb: [70, 180, 140], tolerance: 80, category: 'cool' },
  
  // 冷色系 - 青蓝调
  { name: '青色', rgb: [60, 170, 200], tolerance: 85, category: 'cool' },
  { name: '天蓝', rgb: [100, 160, 240], tolerance: 85, category: 'cool' },
  { name: '蓝色', rgb: [50, 90, 200], tolerance: 85, category: 'cool' },
  
  // 冷色系 - 紫色调
  { name: '紫色', rgb: [150, 80, 190], tolerance: 85, category: 'cool' },
  { name: '靛紫', rgb: [90, 50, 150], tolerance: 80, category: 'cool' },
  
  // 中性色系 - 棕色调（重要：古典画作常见）
  { name: '棕色', rgb: [120, 80, 50], tolerance: 80, category: 'neutral' },
  { name: '赭色', rgb: [160, 110, 70], tolerance: 75, category: 'neutral' },
  { name: '米色', rgb: [220, 200, 170], tolerance: 70, category: 'neutral' },
  
  // 中性色系 - 灰色调
  { name: '灰色', rgb: [130, 130, 130], tolerance: 65, category: 'neutral' },
  { name: '黑白', rgb: [128, 128, 128], tolerance: 100, isMonochrome: true, category: 'neutral' }
]

/**
 * 计算两个RGB颜色之间的欧几里得距离
 */
export const colorDistance = (color1, color2) => {
  return Math.sqrt(
    Math.pow(color1[0] - color2[0], 2) +
    Math.pow(color1[1] - color2[1], 2) +
    Math.pow(color1[2] - color2[2], 2)
  )
}

/**
 * RGB 转 HSL
 * 返回 { h: 0-360, s: 0-100, l: 0-100 }
 */
const rgbToHsl = (rgb) => {
  const r = rgb[0] / 255
  const g = rgb[1] / 255
  const b = rgb[2] / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const diff = max - min
  
  let h = 0
  let s = 0
  let l = (max + min) / 2

  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min)
    
    switch (max) {
      case r:
        h = ((g - b) / diff + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / diff + 2) / 6
        break
      case b:
        h = ((r - g) / diff + 4) / 6
        break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

/**
 * 根据色相判断颜色名称
 */
const getColorNameFromHue = (h, s, l) => {
  // 只有饱和度极低才判定为黑白（真正的无色）
  if (s < 3) {
    return '黑白'
  }

  // 深色调（亮度很低）
  if (l < 20) {
    if (h >= 15 && h < 85) return '棕色'
    if (h >= 85 && h < 180) return '深绿'
    if (h >= 330 || h < 15) return '深红'
    return '黑白'
  }

  // 非常浅的颜色（亮度很高且饱和度低）
  if (l > 85 && s < 15) {
    return '米色'
  }

  // 灰色：饱和度很低
  if (s < 8) {
    return '灰色'
  }

  // 根据色相判断主要颜色
  // 红色系 (330-30)
  if (h >= 330 || h < 30) {
    if (h >= 330 || h < 10) {
      return s > 40 ? '红色' : (l > 60 ? '粉色' : '深红')
    }
    return '橙红'
  }

  // 橙黄色系 (30-85)
  if (h >= 30 && h < 85) {
    if (l < 35 && s < 30) return '棕色'
    if (l < 50 && s > 20) return '赭色'
    if (l > 70 && s < 25) return '米色'
    if (h < 50) return '橙色'
    if (h < 70) return '金黄'
    return '黄色'
  }

  // 绿色系 (85-180)
  if (h >= 85 && h < 180) {
    if (l < 35) return '深绿'
    if (h >= 155) return '青绿'
    return '绿色'
  }

  // 青蓝色系 (180-245)
  if (h >= 180 && h < 245) {
    if (h < 205) return '青色'
    if (h < 240) return '蓝色'
    return '天蓝'
  }

  // 紫色系 (245-330)
  if (h >= 245 && h < 330) {
    if (h < 275) return '靛紫'
    if (h < 310) return '紫色'
    if (l > 65 && s < 35) return '粉色'
    return '玫红'
  }

  return '灰色'
}

/**
 * 检查颜色是否为单色（黑白灰）
 * 使用更严格的标准：RGB值必须非常接近
 */
const isMonochrome = (rgb, threshold = 25) => {
  const [r, g, b] = rgb
  const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b))
  return maxDiff < threshold
}

/**
 * 计算颜色的亮度（0-255）
 */
const getBrightness = (rgb) => {
  return (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000
}

/**
 * 计算颜色的饱和度（0-1）
 */
const getSaturation = (rgb) => {
  const [r, g, b] = rgb
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  if (max === 0) return 0
  return (max - min) / max
}

/**
 * 使用 ColorThief 提取图片的颜色调色板（客户端版本）
 * 返回前3个最具代表性的颜色
 */
export const extractDominantColor = async (imageUrl) => {
  // 确保只在浏览器端执行
  if (typeof window === 'undefined') {
    throw new Error('extractDominantColor can only be called on the client side')
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    
    img.onload = async () => {
      try {
        // 动态导入 colorthief（仅在浏览器端）
        const ColorThief = (await import('colorthief')).default
        const colorThief = new ColorThief()
        
        // 获取调色板（前8个颜色）
        const palette = colorThief.getPalette(img, 8)
        
        // 按饱和度和亮度评分，选择最有代表性的颜色
        const scoredColors = palette.map(color => {
          const hsl = rgbToHsl(color)
          // 评分：饱和度权重更高，避免太暗或太亮
          const lightnessScore = hsl.l > 15 && hsl.l < 85 ? 1 : 0.4
          const score = hsl.s * lightnessScore
          return { color, score, hsl }
        })
        
        // 按评分排序
        scoredColors.sort((a, b) => b.score - a.score)
        
        // 返回前3个最有代表性的颜色（去重相似颜色）
        const selectedColors = []
        for (let i = 0; i < scoredColors.length && selectedColors.length < 3; i++) {
          const candidate = scoredColors[i].color
          
          // 检查是否与已选颜色太相似
          const isSimilar = selectedColors.some(selected => {
            const distance = colorDistance(candidate, selected)
            return distance < 60 // 颜色距离阈值
          })
          
          if (!isSimilar) {
            selectedColors.push(candidate)
          }
        }
        
        resolve(selectedColors)
      } catch (error) {
        reject(error)
      }
    }
    
    img.onerror = () => {
      reject(new Error('Image failed to load'))
    }
    
    // 使用代理加载图片以避免 CORS 问题
    img.src = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`
  })
}

/**
 * 检查颜色是否匹配指定的筛选器
 * 使用 HSL 色彩空间进行更准确的匹配
 */
export const matchesColorFilter = (dominantColors, filterColor) => {
  if (!dominantColors || !filterColor) return false
  
  // 支持单个颜色或颜色数组
  const colors = Array.isArray(dominantColors) ? dominantColors : [dominantColors]
  
  // 只要任意一个颜色匹配就返回 true
  return colors.some(color => {
    const hsl = rgbToHsl(color)
    const colorName = getColorNameFromHue(hsl.h, hsl.s, hsl.l)
    return colorName === filterColor.name
  })
}

/**
 * 获取图片的最佳匹配颜色标签
 * 使用 HSL 色彩空间进行更精确的颜色识别
 * 支持单个颜色或颜色数组
 */
export const getColorLabel = (dominantColors) => {
  if (!dominantColors) return null
  
  // 如果是数组，返回第一个颜色的标签（主色调）
  const color = Array.isArray(dominantColors) ? dominantColors[0] : dominantColors
  
  // 转换到 HSL 色彩空间
  const hsl = rgbToHsl(color)
  
  // 基于 HSL 判断颜色名称
  const colorName = getColorNameFromHue(hsl.h, hsl.s, hsl.l)
  
  // 从预定义的颜色列表中找到对应的颜色对象
  const matchedColor = COLOR_FILTERS.find(f => f.name === colorName)
  
  // 如果找不到精确匹配，回退到距离最近的颜色
  if (!matchedColor) {
    let bestMatch = COLOR_FILTERS[0]
    let minDistance = Infinity
    
    COLOR_FILTERS.forEach(filter => {
      const distance = colorDistance(color, filter.rgb)
      if (distance < minDistance) {
        minDistance = distance
        bestMatch = filter
      }
    })
    
    return bestMatch
  }
  
  return matchedColor
}

/**
 * 获取颜色数组的所有标签（去重）
 */
export const getColorLabels = (dominantColors) => {
  if (!dominantColors) return []
  
  const colors = Array.isArray(dominantColors) ? dominantColors : [dominantColors]
  
  const colorNames = new Set()
  const uniqueLabels = []
  
  colors.forEach(color => {
    const hsl = rgbToHsl(color)
    const colorName = getColorNameFromHue(hsl.h, hsl.s, hsl.l)
    
    // 只添加未出现过的颜色名称
    if (!colorNames.has(colorName)) {
      colorNames.add(colorName)
      const label = COLOR_FILTERS.find(f => f.name === colorName) || COLOR_FILTERS[0]
      uniqueLabels.push(label)
    }
  })
  
  return uniqueLabels
}

/**
 * 批量提取图片颜色（用于预处理搜索结果）
 */
export const extractColorsForArtworks = async (artworks, onProgress) => {
  const results = []
  
  for (let i = 0; i < artworks.length; i++) {
    const artwork = artworks[i]
    try {
      const color = await extractDominantColor(artwork.image)
      results.push({
        ...artwork,
        dominantColor: color
      })
      
      if (onProgress) {
        onProgress(i + 1, artworks.length)
      }
    } catch (error) {
      console.error(`Failed to extract color for ${artwork.title}:`, error)
      // 即使提取失败也保留原始数据
      results.push(artwork)
    }
    
    // 添加小延迟避免过度请求
    if (i < artworks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  
  return results
}
