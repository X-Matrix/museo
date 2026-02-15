import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/router'
import styles from '../styles/SearchInput.module.css'

const PLACEHOLDERS = [
  'Trees',
  'Claude Monet',
  'Van Gogh',
  'Paintings of nature',
  'Maps',
  'Statues',
  'Art with flowers',
  'Scenes from history',
  'Portraits',
  'Clouds',
  'Book illustrations',
  'Abstract art',
  'Mythology paintings',
  'Animal sculptures',
  'Vintage posters',
  'Mountains',
  'Patterns and designs',
  'Landscapes',
  'Art about cities',
  'Still life',
  'Photos of people',
  'Cities',
  'Ocean waves',
  'Medieval art',
  'Renaissance paintings',
  'Japanese prints',
  'Egyptian artifacts',
  'Greek sculptures',
]

const SearchInput = React.memo(({ value, onChange }) => {
  const router = useRouter()
  const [placeholder, setPlaceholder] = useState(PLACEHOLDERS[0])
  const [isFocused, setIsFocused] = useState(false)
  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {
    const picked = PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]
    setPlaceholder(picked)
    
    // 随机选择3个建议词
    const shuffled = [...PLACEHOLDERS].sort(() => Math.random() - 0.5)
    setSuggestions(shuffled.slice(0, 5))
  }, [])

  const handleSuggestionClick = useCallback((suggestion) => {
    // 更新输入值并直接搜索
    onChange({ target: { value: suggestion } })
    router.push(`/?q=${encodeURIComponent(suggestion)}`)
  }, [onChange, router])

  const handleClear = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    onChange({ target: { value: '' } })
  }, [onChange])

  const handleFocus = useCallback(() => setIsFocused(true), [])
  const handleBlur = useCallback(() => setIsFocused(false), [])

  return (
    <div>
      <form
      action='/'
      method='get'
      onSubmit={(e) => e.preventDefault}
      className={styles.form}
    >
      <div className={`${styles.wrapper} ${isFocused ? styles.focused : ''}`}>
        <input
          type='search'
          placeholder={`Search for "${placeholder}"...`}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          name='q'
          aria-label='Search the world’s museums'
          className={styles.input}
        />
        
        {value && (
          <button
            type='button'
            onClick={handleClear}
            className={styles.clearButton}
            aria-label='Clear search'
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
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}

        <button type='submit' className={styles.button}>
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <span className={styles.buttonText}>Search</span>
        </button>
      </div>
    </form>
    
    {!value && (
      <div className={styles.suggestions}>
        <span className={styles.suggestionsLabel}>Try searching:</span>
        {suggestions.map((suggestion, index) => (
          <SuggestionButton
            key={index}
            suggestion={suggestion}
            onClick={handleSuggestionClick}
          />
        ))}
      </div>
    )}
  </div>
  )
})

SearchInput.displayName = 'SearchInput'

// 优化建议按钮为独立组件
const SuggestionButton = React.memo(({ suggestion, onClick }) => {
  const handleClick = useCallback(() => {
    onClick(suggestion)
  }, [suggestion, onClick])

  return (
    <button
      onClick={handleClick}
      className={styles.suggestionChip}
      type="button"
    >
      {suggestion}
    </button>
  )
})

SuggestionButton.displayName = 'SuggestionButton'

export default SearchInput
