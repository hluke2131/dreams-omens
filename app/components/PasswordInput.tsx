'use client'

import { useState } from 'react'

interface PasswordInputProps {
  value:        string
  onChange:     (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?:    boolean
  minLength?:   number
  disabled?:    boolean
  style?:       React.CSSProperties
}

export default function PasswordInput({
  value,
  onChange,
  placeholder,
  required,
  minLength,
  disabled,
  style,
}: PasswordInputProps) {
  const [show, setShow] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        disabled={disabled}
        style={{ ...style, paddingRight: 48 }}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        disabled={disabled}
        aria-label={show ? 'Hide password' : 'Show password'}
        style={{
          position:  'absolute',
          right:     14,
          top:       '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border:    'none',
          cursor:    disabled ? 'default' : 'pointer',
          padding:   0,
          color:     'var(--owl-brown)',
          display:   'flex',
          alignItems: 'center',
          opacity:   disabled ? 0.4 : 1,
        }}
      >
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  )
}

function EyeIcon() {
  return (
    <svg
      width="18" height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg
      width="18" height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}
