import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import SearchInput from '../components/SearchInput'
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

const ArtworkCard = ({ item, index }) => {
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

  const { data, isLoading } = useQuery([searchTerm], fetchData)

  useEffect(() => {
    setValue(searchTerm || '')
  }, [searchTerm])

  const emptyState = isLoading
    ? null
    : searchTerm
    ? 'Hmm, there are no results for that query. Try something else?'
    : null

  const resultCount = data?.length || 0

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
        ) : data && data.length > 0 ? (
          <ul className={styles.photoList}>
            {data.map((item, i) => (
              <ArtworkCard key={i} item={item} index={i} />
            ))}
          </ul>
        ) : (
          <>{emptyState && <p className={styles.emptyState}>{emptyState}</p>}</>
        )}
      </main>
    </React.Fragment>
  )
}
