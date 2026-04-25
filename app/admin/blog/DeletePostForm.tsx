'use client'

import { deletePost } from './actions'

export default function DeletePostForm({ postId, postTitle }: { postId: string; postTitle: string }) {
  return (
    <form
      action={deletePost}
      onSubmit={e => {
        if (!confirm(`Delete "${postTitle}"? This cannot be undone.`)) e.preventDefault()
      }}
    >
      <input type="hidden" name="id" value={postId} />
      <button
        type="submit"
        style={{
          background: 'none',
          border:     'none',
          padding:    0,
          cursor:     'pointer',
          fontSize:   13,
          color:      '#dc2626',
          fontWeight: 600,
          fontFamily: 'inherit',
        }}
      >
        Delete
      </button>
    </form>
  )
}
