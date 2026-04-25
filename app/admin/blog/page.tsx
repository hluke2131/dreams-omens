import Link from 'next/link'
import { getAllPostsForAdmin, formatDate, type BlogPost, type BlogCategory } from '@/lib/blog'
import PageFooter from '@/app/components/PageFooter'
import { togglePostStatus } from './actions'
import DeletePostForm from './DeletePostForm'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Blog Admin — Dreams & Omens' }

const CATEGORY_COLOR: Record<BlogCategory, string> = {
  dream:    '#7C5F44',
  omen:     '#5B6E4D',
  practice: '#8FA382',
}

export default async function AdminBlogPage() {
  const posts = await getAllPostsForAdmin()

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '40px 20px' }}>

      {/* Header */}
      <div
        style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
          marginBottom:   32,
          gap:            12,
        }}
      >
        <div>
          <h1 className="text-title-l" style={{ color: 'var(--ink)' }}>Blog Posts</h1>
          <p className="text-helper" style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            {posts.length} post{posts.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link href="/admin/blog/new" style={{ textDecoration: 'none' }}>
          <button
            className="btn-primary"
            style={{ width: 'auto', padding: '10px 24px', fontSize: 14 }}
          >
            + New Post
          </button>
        </Link>
      </div>

      {/* Table */}
      {posts.length === 0 ? (
        <div className="card-secondary" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
            No posts yet. Create your first one!
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Title', 'Category', 'Status', 'Updated', 'Actions'].map(h => (
                  <th
                    key={h}
                    style={{
                      textAlign:     'left',
                      padding:       '10px 14px',
                      color:         'var(--owl-brown)',
                      fontSize:      11,
                      fontWeight:    700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      borderBottom:  '2px solid var(--stroke-soft)',
                      whiteSpace:    'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <PostRow key={post.id} post={post} categoryColor={CATEGORY_COLOR[post.category]} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <footer style={{ textAlign: 'center', marginTop: 48 }}>
        <PageFooter />
      </footer>
    </main>
  )
}

function PostRow({ post, categoryColor }: { post: BlogPost; categoryColor: string }) {
  return (
    <tr style={{ borderBottom: '1px solid var(--divider)' }}>
      <td style={{ padding: '14px' }}>
        <p className="text-helper" style={{ color: 'var(--ink)', fontWeight: 600, marginBottom: 2 }}>
          {post.title}
        </p>
        <p className="text-caption" style={{ color: 'var(--owl-brown)' }}>
          /blog/{post.slug}
        </p>
      </td>
      <td style={{ padding: '14px', whiteSpace: 'nowrap' }}>
        <span
          style={{
            display:       'inline-block',
            background:    categoryColor,
            color:         'white',
            fontSize:      10,
            fontWeight:    700,
            padding:       '3px 8px',
            borderRadius:  6,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          {post.category}
        </span>
      </td>
      <td style={{ padding: '14px', whiteSpace: 'nowrap' }}>
        <span
          style={{
            fontWeight: 600,
            fontSize:   13,
            color:      post.status === 'published' ? 'var(--moss)' : 'var(--owl-brown)',
          }}
        >
          {post.status}
        </span>
      </td>
      <td style={{ padding: '14px', whiteSpace: 'nowrap' }}>
        <span className="text-helper" style={{ color: 'var(--text-secondary)' }}>
          {formatDate(post.updated_at)}
        </span>
      </td>
      <td style={{ padding: '14px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link
            href={`/admin/blog/edit/${post.id}`}
            style={{ fontSize: 13, color: 'var(--cedar)', fontWeight: 600, textDecoration: 'none' }}
          >
            Edit
          </Link>

          <form action={togglePostStatus}>
            <input type="hidden" name="id" value={post.id} />
            <input type="hidden" name="status" value={post.status} />
            <button
              type="submit"
              style={actionBtnStyle('var(--sage)')}
            >
              {post.status === 'published' ? 'Unpublish' : 'Publish'}
            </button>
          </form>

          <DeletePostForm postId={post.id} postTitle={post.title} />
        </div>
      </td>
    </tr>
  )
}

function actionBtnStyle(color: string): React.CSSProperties {
  return {
    background:  'none',
    border:      'none',
    padding:     0,
    cursor:      'pointer',
    fontSize:    13,
    color:       color,
    fontWeight:  600,
    fontFamily:  'inherit',
  }
}
