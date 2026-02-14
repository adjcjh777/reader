import { describe, expect, it } from 'vitest'
import { TimeoutError, withTimeout } from '@/utils/async'

describe('withTimeout', () => {
  it('超时后抛出 TimeoutError', async () => {
    const never = new Promise<never>(() => undefined)

    await expect(withTimeout(never, 20, 'timeout')).rejects.toBeInstanceOf(
      TimeoutError,
    )
  })

  it('在超时前返回结果', async () => {
    const value = await withTimeout(Promise.resolve('ok'), 100, 'timeout')
    expect(value).toBe('ok')
  })
})
