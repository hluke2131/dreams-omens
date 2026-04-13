import ComposeClient from '@/app/components/ComposeClient'
import { DREAM_TAGS } from '@/lib/types'

export default function ComposeDreamPage() {
  return (
    <ComposeClient
      type="dream"
      title="Dream Interpretation"
      icon="🌙"
      placeholder="I dreamed I was..."
      hint="Describe who, where, feelings, and standout symbols."
      tags={DREAM_TAGS}
    />
  )
}
