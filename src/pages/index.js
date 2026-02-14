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
    // 移动端点击切换
    if (window.innerWidth <= 768) {
      e.preventDefault()
      setShowInfo(!showInfo)
    }
  }

  return (
    <li 
      className={`${styles.artworkCard} ${imageLoaded ? styles.loaded : ''}`}
      style={{ animationDelay: `${index * 0.05}s` }}
      onMouseEnter={() => setShowInfo(true)}
      onMouseLeave={() => setShowInfo(false)}
    >
      <a 
        href={item.url} 
        target='_blank' 
        rel='noopener noreferrer'
        onClick={toggleInfo}
      >
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
        </div>
        <div className={`${styles.artworkInfo} ${showInfo ? styles.visible : ''}`}>
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
          <span className={styles.tapHint}>Tap for details</span>
        </div>
      </a>
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
        <title>Museo</title>
        <link rel='icon' href='/favicon.ico' />
        <meta
          name='description'
          content='A visual search engine for discovering free images from some of the best museums in the world.'
        />
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
