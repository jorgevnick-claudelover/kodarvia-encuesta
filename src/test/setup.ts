import { afterEach, beforeEach } from 'vitest'
import { clearAll } from '../lib/storage'

beforeEach(() => {
  clearAll()
})

afterEach(() => {
  clearAll()
})
