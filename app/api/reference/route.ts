// app/api/reference/route.ts
import { ApiReference } from '@scalar/nextjs-api-reference'

const config = {
  url: '/openapi.json',
  theme: 'purple' as const,
  showSidebar: true,
}

export const GET = ApiReference(config)
