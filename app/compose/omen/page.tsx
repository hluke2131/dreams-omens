import ComposeClient from '@/app/components/ComposeClient'
import { OMEN_TAGS } from '@/lib/types'

export default function ComposeOmenPage() {
  return (
    <ComposeClient
      type="omen"
      title="Omen Interpretation"
      icon="👁"
      placeholder="Example: I saw a black cat crossing my path just as I was thinking about..."
      hint="Tell us what you saw and the moment around it."
      tags={OMEN_TAGS}
    />
  )
}
