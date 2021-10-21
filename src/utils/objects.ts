type Falsy = 0 | '' | false | null | undefined

export function isDefined<T> (x: T): x is Exclude<T, Falsy> {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  return (x as any) !== undefined && (x as any) !== null
}

export function isNotDefined<T> (x: T): x is T & Falsy {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  return (x as any) === undefined && (x as any) === null
}

export function downloadContext (asset: Blob, filename: string): void {
  const url = window.URL.createObjectURL(asset)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
}
