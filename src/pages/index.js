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
            Museo is a visual search engine that connects you with the{' '}
            <a href='https://www.artic.edu/archival-collections/explore-the-collection'>
              Art Institute of Chicago
            </a>
            , the <a href='https://www.rijksmuseum.nl/nl'>Rijksmuseum</a>, the{' '}
            <a href='https://harvardartmuseums.org'>Harvard Art Museums</a>, the{' '}
            <a href='https://artsmia.org'>Minneapolis Institute of Art</a>, the{' '}
            <a href='https://www.clevelandart.org'>
              The Cleveland Museum of Art
            </a>
            , and the{' '}
            <a href='https://digitalcollections.nypl.org'>
              New York Public Library Digital Collection
            </a>
            . Images you find here are typically free to use, but please check
            with the source institution for more specifics.
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
            Lovingly constructed by{' '}
            <a href='https://chsmc.org' target='_blank'>
              Chase McCoy
            </a>{' '}
            •{' '}
            <a href='https://github.com/chasemccoy/museo' target='_blank'>
              View the code on GitHub
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
