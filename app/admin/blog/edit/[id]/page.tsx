import { notFound } from 'next/navigation'
import { getPostByIdForAdmin } from '@/lib/blog'
import PostForm from '@/app/components/blog/PostForm'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const post = await getPostByIdForAdmin(id)
  return { title: post ? `Edit: ${post.title}` : 'Post not found' }
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params
  const post = await getPostByIdForAdmin(id)

  if (!post) notFound()

  return <PostForm post={post} />
}
