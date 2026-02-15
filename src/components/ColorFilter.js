import React, { useState } from 'react'
import styles from '../styles/ColorFilter.module.css'
import { COLOR_FILTERS } from '../utils/colorExtractor'

const ColorFilter = ({ 
  selectedColors,  // 改为数组
  onColorToggle,   // 改为切换方法
  colorCounts,
  selectedMuseums, // 改为数组
  onMuseumToggle,  // 改为切换方法
  museums,
  selectedArtists, // 改为数组
  onArtistToggle,  // 改为切换方法
  artists,
  isVisible 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true) // 默认收起
  const [activeTab, setActiveTab] = useState('color')

  if (!isVisible) return null

  const hasActiveFilter = selectedColors.length > 0 || selectedMuseums.length > 0 || selectedArtists.length > 0

  return (
    <>
      {/* 遮罩层 */}
      {!isCollapsed && (
        <div 
          className={styles.overlay}
          onClick={() => setIsCollapsed(true)}
        />
      )}
      
      {/* 侧边栏 */}
      <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
        {/* 收起/展开按钮 */}
        <button 
          className={styles.toggleButton}
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? '展开筛选' : '收起筛选'}
        >
          <svg 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5"
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            {isCollapsed ? (
              <polyline points="15 18 9 12 15 6"></polyline>
            ) : (
              <polyline points="9 18 15 12 9 6"></polyline>
            )}
          </svg>
        </button>

        <div className={styles.sidebarContent}>
          {/* 头部 */}
          <div className={styles.header}>
            <h3 className={styles.title}>筛选</h3>
            {hasActiveFilter && (
              <button 
                className={styles.clearButton}
                onClick={() => {
                  onColorToggle(null, true) // true 表示清空
                  onMuseumToggle(null, true)
                  onArtistToggle(null, true)
                }}
              >
                清除
              </button>
            )}
          </div>

          {/* 标签页 */}
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === 'color' ? styles.active : ''}`}
              onClick={() => setActiveTab('color')}
            >
              颜色
              {selectedColors.length > 0 && <span className={styles.badge}>{selectedColors.length}</span>}
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'museum' ? styles.active : ''}`}
              onClick={() => setActiveTab('museum')}
            >
              来源
              {selectedMuseums.length > 0 && <span className={styles.badge}>{selectedMuseums.length}</span>}
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'artist' ? styles.active : ''}`}
              onClick={() => setActiveTab('artist')}
            >
              作者
              {selectedArtists.length > 0 && <span className={styles.badge}>{selectedArtists.length}</span>}
            </button>
          </div>

          {/* 颜色筛选 */}
          {activeTab === 'color' && (
            <div className={styles.filterSection}>
              <div className={styles.colorGrid}>
                {COLOR_FILTERS.map((color) => {
                  const count = colorCounts[color.name] || 0
                  if (count === 0) return null
                  
                  const isSelected = selectedColors.some(c => c.name === color.name)
                  
                  return (
                    <button
                      key={color.name}
                      className={`${styles.colorItem} ${isSelected ? styles.selected : ''}`}
                      onClick={() => onColorToggle(color)}
                      title={color.name}
                    >
                      <div 
                        className={styles.colorDot}
                        style={{ 
                          backgroundColor: color.isMonochrome 
                            ? '#888'
                            : `rgb(${color.rgb.join(',')})` 
                        }}
                      >
                        {color.isMonochrome && (
                          <div className={styles.monochromeGradient}></div>
                        )}
                      </div>
                      <span className={styles.itemLabel}>{color.name}</span>
                      <span className={styles.itemCount}>{count}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* 来源筛选 */}
          {activeTab === 'museum' && (
            <div className={styles.filterSection}>
              <div className={styles.listItems}>
                {museums.map((museum) => {
                  const isSelected = selectedMuseums.includes(museum.name)
                  return (
                    <button
                      key={museum.name}
                      className={`${styles.listItem} ${isSelected ? styles.selected : ''}`}
                      onClick={() => onMuseumToggle(museum.name)}
                    >
                      <span className={styles.itemLabel}>{museum.name}</span>
                      <span className={styles.itemCount}>{museum.count}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* 作者筛选 */}
          {activeTab === 'artist' && (
            <div className={styles.filterSection}>
              <div className={styles.listItems}>
                {artists.slice(0, 30).map((artist) => {
                  const isSelected = selectedArtists.includes(artist.name)
                  return (
                    <button
                      key={artist.name}
                      className={`${styles.listItem} ${isSelected ? styles.selected : ''}`}
                      onClick={() => onArtistToggle(artist.name)}
                    >
                      <span className={styles.itemLabel}>{artist.name || '未知作者'}</span>
                      <span className={styles.itemCount}>{artist.count}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ColorFilter
