import React, { useEffect, useState } from 'react'
import styles from '../styles/SearchInput.module.css'

const PLACEHOLDERS = [
  'Trees',
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

const SearchInput = ({ value, onChange }) => {
  const [placeholder, setPlaceholder] = useState(PLACEHOLDERS[0])
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    const picked = PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]
    setPlaceholder(picked)
  }, [])

  return (
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
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          name='q'
          aria-label='Search the world’s museums'
          className={styles.input}
        />

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
  )
}

export default SearchInput
