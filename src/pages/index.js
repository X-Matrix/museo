import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import SearchInput from '../components/SearchInput'
import ColorFilter from '../components/ColorFilter'
import { extractDominantColor, matchesColorFilter, getColorLabels, COLOR_FILTERS } from '../utils/colorExtractor'
import styles from '../styles/Home.module.css'

const URL = (searchTerm) => `/api/museo?q=${searchTerm}`

const fetchData = async ({ queryKey }) => {
  const [searchTerm] = queryKey

  if (!searchTerm) {
    return null
  }

  try {
    const response = await fetch(URL(searchTerm))
    if (!response.ok) {
      throw 'Query to Museo API failed'
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.log(error)
    return []
  }
}

const ArtworkCard = ({ item, index, onColorExtracted }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  const toggleInfo = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setShowInfo(!showInfo)
  }

  const handleLinkClick = (e) => {
    e.stopPropagation()
  }

  return (
    <li 
      className={`${styles.artworkCard} ${imageLoaded ? styles.loaded : ''}`}
      style={{ animationDelay: `${index * 0.05}s` }}
      onMouseEnter={() => window.innerWidth > 768 && setShowInfo(true)}
      onMouseLeave={() => window.innerWidth > 768 && setShowInfo(false)}
    >
      <div className={styles.cardContent}>
        <div className={styles.imageWrapper}>
          <img
            data-src={item.image}
            alt={item.title}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              e.target.parentNode.parentNode.parentNode.removeChild(
                e.target.parentNode.parentNode
              )
            }}
            className='lazyload'
          />
          {!imageLoaded && (
            <div className={styles.imagePlaceholder}>
              <div className={styles.loadingSpinner}></div>
            </div>
          )}
          
          {/* 主色调指示器 - 显示多个颜色 */}
          {item.dominantColor && (() => {
            const colors = Array.isArray(item.dominantColor) ? item.dominantColor : [item.dominantColor]
            const colorLabels = getColorLabels(colors)
            
            return (
              <div className={styles.dominantColorBadge}>
                <div className={styles.colorDotsContainer}>
                  {colors.map((color, idx) => (
                    <div 
                      key={idx}
                      className={styles.dominantColorDot}
                      style={{ 
                        backgroundColor: `rgb(${color.join(',')})` 
                      }}
                    />
                  ))}
                </div>
                {colorLabels.length > 0 && (
                  <span className={styles.dominantColorLabel}>
                    {colorLabels.map(label => label.name).join(' · ')}
                  </span>
                )}
              </div>
            )
          })()}
          
          {/* 右上角跳转链接 */}
          <a 
            href={item.url} 
            target='_blank' 
            rel='noopener noreferrer'
            className={styles.externalLink}
            onClick={handleLinkClick}
            aria-label='View on museum website'
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        </div>
        
        <div 
          className={`${styles.artworkInfo} ${showInfo ? styles.visible : ''}`}
          onClick={toggleInfo}
        >
          <h3 className={styles.artworkTitle}>{item.title}</h3>
          {item.museum && <p className={styles.artworkMuseum}>{item.museum}</p>}
          {item.artist && <p className={styles.artworkArtist}>{item.artist}</p>}
          {item.date && <p className={styles.artworkDate}>{item.date}</p>}
          {(item.culture || item.medium) && (
            <p className={styles.artworkMeta}>
              {[item.culture, item.medium].filter(Boolean).join(' • ')}
            </p>
          )}
          {item.popularity && item.popularity > 50 && (
            <p className={styles.artworkPopularity}>
              ❤️ {item.popularity} hearts
            </p>
          )}
          <span className={styles.tapHint}>
            {showInfo ? 'Tap to close' : 'Tap for details'}
          </span>
        </div>
      </div>
    </li>
  )
}

export default function Home() {
  const { query } = useRouter()
  const searchTerm = query.q
  const [value, setValue] = useState(searchTerm || '')
  const [selectedColors, setSelectedColors] = useState([])  // 改为数组
  const [selectedMuseums, setSelectedMuseums] = useState([]) // 改为数组
  const [selectedArtists, setSelectedArtists] = useState([]) // 改为数组
  const [artworksWithColors, setArtworksWithColors] = useState([])
  const [colorExtractionQueue, setColorExtractionQueue] = useState([])
  const [processingIndexes, setProcessingIndexes] = useState(new Set()) // 正在处理的索引

  const { data, isLoading } = useQuery([searchTerm], fetchData)

  useEffect(() => {
    setValue(searchTerm || '')
    // 搜索词改变时重置筛选
    setSelectedColors([])
    setSelectedMuseums([])
    setSelectedArtists([])
    setArtworksWithColors([])
    setColorExtractionQueue([])
    setProcessingIndexes(new Set())
  }, [searchTerm])

  // 当数据加载完成时，初始化颜色数据并启动后台提取
  useEffect(() => {
    if (data && data.length > 0) {
      const artworks = data.map(item => ({ ...item, dominantColor: null }))
      setArtworksWithColors(artworks)
      // 设置提取队列
      setColorExtractionQueue(artworks.map((_, index) => index))
      console.log(`🎨 开始提取颜色，共 ${artworks.length} 张图片`)
    }
  }, [data])

  // 后台并发提取颜色
  useEffect(() => {
    if (colorExtractionQueue.length === 0) return

    const CONCURRENT_LIMIT = 5 // 并发数量
    const total = artworksWithColors.length

    // 获取可以处理的索引（不在处理中的）
    const availableIndexes = colorExtractionQueue
      .filter(index => !processingIndexes.has(index))
      .slice(0, CONCURRENT_LIMIT)

    if (availableIndexes.length === 0) return

    // 标记为正在处理
    setProcessingIndexes(prev => {
      const newSet = new Set(prev)
      availableIndexes.forEach(index => newSet.add(index))
      return newSet
    })

    // 并发处理多个图片
    const processImage = async (index) => {
      const artwork = artworksWithColors[index]
      const processed = total - colorExtractionQueue.length + 1

      if (artwork && !artwork.dominantColor && typeof window !== 'undefined') {
        try {
          const color = await extractDominantColor(artwork.image)
          console.log(`🎨 [${processed}/${total}] 提取成功 - RGB(${color.join(', ')}) - ${artwork.title || '未知作品'}`)
          
          setArtworksWithColors(prev => {
            const updated = [...prev]
            updated[index] = { ...updated[index], dominantColor: color }
            return updated
          })
        } catch (error) {
          console.error(`❌ [${processed}/${total}] 提取失败 - ${artwork.title || '未知作品'}:`, error.message)
        }
      } else {
        console.log(`⏭️  [${processed}/${total}] 跳过 - 已有颜色或无效图片`)
      }

      // 从队列和处理中集合移除
      setColorExtractionQueue(prev => {
        const newQueue = prev.filter(i => i !== index)
        if (newQueue.length === 0) {
          console.log('✅ 所有图片颜色提取完成！')
        }
        return newQueue
      })
      
      setProcessingIndexes(prev => {
        const newSet = new Set(prev)
        newSet.delete(index)
        return newSet
      })
    }

    // 并发执行
    availableIndexes.forEach(index => processImage(index))
  }, [colorExtractionQueue, artworksWithColors, processingIndexes])

  // 颜色切换函数
  const handleColorToggle = (color, clearAll = false) => {
    if (clearAll) {
      setSelectedColors([])
      return
    }
    setSelectedColors(prev => {
      const exists = prev.some(c => c.name === color.name)
      if (exists) {
        return prev.filter(c => c.name !== color.name)
      } else {
        return [...prev, color]
      }
    })
  }

  // 来源切换函数
  const handleMuseumToggle = (museum, clearAll = false) => {
    if (clearAll) {
      setSelectedMuseums([])
      return
    }
    setSelectedMuseums(prev => {
      if (prev.includes(museum)) {
        return prev.filter(m => m !== museum)
      } else {
        return [...prev, museum]
      }
    })
  }

  // 作者切换函数
  const handleArtistToggle = (artist, clearAll = false) => {
    if (clearAll) {
      setSelectedArtists([])
      return
    }
    setSelectedArtists(prev => {
      if (prev.includes(artist)) {
        return prev.filter(a => a !== artist)
      } else {
        return [...prev, artist]
      }
    })
  }

  // 计算每个颜色的匹配数量
  const colorCounts = React.useMemo(() => {
    const counts = {}
    COLOR_FILTERS.forEach(filter => {
      counts[filter.name] = artworksWithColors.filter(item => 
        item.dominantColor && matchesColorFilter(item.dominantColor, filter)
      ).length
    })
    return counts
  }, [artworksWithColors])

  // 计算来源统计
  const museums = React.useMemo(() => {
    const museumMap = {}
    artworksWithColors.forEach(item => {
      if (item.museum) {
        museumMap[item.museum] = (museumMap[item.museum] || 0) + 1
      }
    })
    return Object.entries(museumMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [artworksWithColors])

  // 计算作者统计
  const artists = React.useMemo(() => {
    const artistMap = {}
    artworksWithColors.forEach(item => {
      if (item.artist) {
        artistMap[item.artist] = (artistMap[item.artist] || 0) + 1
      }
    })
    return Object.entries(artistMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [artworksWithColors])

  // 筛选作品 - 支持多选
  const filteredArtworks = React.useMemo(() => {
    let filtered = artworksWithColors

    // 颜色筛选 - 多选（满足任意一个）
    if (selectedColors.length > 0) {
      filtered = filtered.filter(item => {
        if (!item.dominantColor) return false
        return selectedColors.some(color => 
          matchesColorFilter(item.dominantColor, color)
        )
      })
    }

    // 来源筛选 - 多选（满足任意一个）
    if (selectedMuseums.length > 0) {
      filtered = filtered.filter(item => 
        selectedMuseums.includes(item.museum)
      )
    }

    // 作者筛选 - 多选（满足任意一个）
    if (selectedArtists.length > 0) {
      filtered = filtered.filter(item => 
        selectedArtists.includes(item.artist)
      )
    }

    return filtered
  }, [artworksWithColors, selectedColors, selectedMuseums, selectedArtists])

  const emptyState = isLoading
    ? null
    : searchTerm
    ? 'Hmm, there are no results for that query. Try something else?'
    : null

  const resultCount = data?.length || 0
  const filteredCount = filteredArtworks?.length || 0

  return (
    <React.Fragment>
      <Head>
        <title>Museo - 探索世界博物馆的视觉搜索引擎</title>
        <link rel='icon' href='/favicon.ico' />
        <meta
          name='description'
          content='Museo 是一个视觉搜索引擎，连接芝加哥艺术学院、荷兰国立博物馆、哈佛艺术博物馆等世界知名博物馆，免费探索和使用高质量艺术图像。'
        />
        <meta name='keywords' content='博物馆,艺术,图像搜索,免费图片,艺术作品,视觉搜索,Museum,Art,Free Images' />
        <meta name='author' content='X-Matrix' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        
        {/* Open Graph / Facebook */}
        <meta property='og:type' content='website' />
        <meta property='og:url' content='https://museo.xmatrix.wiki/' />
        <meta property='og:title' content='Museo - 探索世界博物馆的视觉搜索引擎' />
        <meta property='og:description' content='连接世界知名博物馆，免费探索和使用高质量艺术图像。搜索来自芝加哥艺术学院、荷兰国立博物馆、哈佛艺术博物馆等机构的艺术作品。' />
        <meta property='og:image' content='https://museo.xmatrix.wiki/og-image.jpg' />
        <meta property='og:locale' content='zh_CN' />
        
        {/* Twitter */}
        <meta property='twitter:card' content='summary_large_image' />
        <meta property='twitter:url' content='https://museo.xmatrix.wiki/' />
        <meta property='twitter:title' content='Museo - 探索世界博物馆的视觉搜索引擎' />
        <meta property='twitter:description' content='连接世界知名博物馆，免费探索和使用高质量艺术图像。' />
        <meta property='twitter:image' content='https://museo.xmatrix.wiki/og-image.jpg' />
        
        {/* Additional SEO */}
        <meta name='robots' content='index, follow' />
        <meta name='language' content='Chinese' />
        <meta httpEquiv='Content-Type' content='text/html; charset=utf-8' />
        <link rel='canonical' href='https://museo.xmatrix.wiki/' />
      </Head>

      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            <a href='/'>Mus&shy;eo</a>
          </h1>

          <p className={styles.subtitle}>
            Museo 是一个视觉搜索引擎，连接了{' '}
            <a href='https://www.artic.edu/archival-collections/explore-the-collection'>
              芝加哥艺术学院
            </a>
            、<a href='https://www.rijksmuseum.nl/nl'>荷兰国立博物馆</a>、{' '}
            <a href='https://harvardartmuseums.org'>哈佛艺术博物馆</a>、{' '}
            <a href='https://artsmia.org'>明尼阿波利斯艺术学院</a>、{' '}
            <a href='https://www.clevelandart.org'>
              克利夫兰艺术博物馆
            </a>
            、{' '}
            <a href='https://digitalcollections.nypl.org'>
              纽约公共图书馆数字收藏
            </a>
            、以及{' '}
            <a href='https://www.useum.org'>
              Useum
            </a>
            。您在这里找到的图像通常可以免费使用，但请向原机构确认具体使用条款。
          </p>

          {!searchTerm && !isLoading && (
            <svg
              height='100'
              viewBox='0 0 29 244'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
              className={styles.divider}
            >
              <path
                d='M14.5 2C31.1667 15.3333 31.1667 28.6667 14.5 42C-2.16665 55.3333 -2.16665 68.6667 14.5 82C31.1667 95.3333 31.1667 108.667 14.5 122C-2.16666 135.333 -2.16666 148.667 14.5 162C31.1667 175.333 31.1667 188.667 14.5 202C-2.16666 215.333 -2.16666 228.667 14.5 242'
                stroke='mediumseagreen'
                strokeWidth='4'
                strokeLinecap='round'
              />
            </svg>
          )}

          <SearchInput
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />

          {searchTerm && !isLoading && data && data.length > 0 && (
            <div className={styles.resultCount}>
              <span className={styles.countBadge}>{resultCount}</span>
              <span className={styles.countText}>
                {resultCount === 1 ? 'artwork found' : 'artworks found'}
              </span>
            </div>
          )}

          <p className={styles.credits}>
            基于{' '}
            <a href='https://museo.app/' target='_blank'>
              museo.app
            </a>
            {' '}(
            <a href='https://github.com/chasemccoy/museo' target='_blank'>
              GitHub
            </a>
            ){' '}
            的原版构建{' '}
            •{' '}
            改进版来自{' '}
            <a href='https://github.com/X-Matrix/museo' target='_blank'>
              X-Matrix/museo
            </a>
          </p>
        </header>

        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingGrid}>
              {[...Array(12)].map((_, i) => (
                <div key={i} className={styles.loadingSkeleton} style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className={styles.skeletonShimmer}></div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredArtworks && filteredArtworks.length > 0 ? (
          <ul className={styles.photoList}>
            {filteredArtworks.map((item, i) => (
              <ArtworkCard 
                key={i} 
                item={item} 
                index={i} 
                onColorExtracted={() => {}} // 不再需要，后台自动处理
              />
            ))}
          </ul>
        ) : (selectedColors.length > 0 || selectedMuseums.length > 0 || selectedArtists.length > 0) && data && data.length > 0 ? (
          <p className={styles.emptyState}>
            没有找到匹配的作品。试试调整筛选条件？
          </p>
        ) : (
          <>{emptyState && <p className={styles.emptyState}>{emptyState}</p>}</>
        )}
      </main>

      {/* 筛选侧边栏 */}
      <ColorFilter
        selectedColors={selectedColors}
        onColorToggle={handleColorToggle}
        colorCounts={colorCounts}
        selectedMuseums={selectedMuseums}
        onMuseumToggle={handleMuseumToggle}
        museums={museums}
        selectedArtists={selectedArtists}
        onArtistToggle={handleArtistToggle}
        artists={artists}
        isVisible={searchTerm && !isLoading && data && data.length > 0}
      />
    </React.Fragment>
  )
}
