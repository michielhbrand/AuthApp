import { copyFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const dist = join(process.cwd(), 'dist')

await copyFile(join(dist, 'index.html'), join(dist, '404.html'))
await writeFile(join(dist, '.nojekyll'), '')

console.log('Created dist/404.html and dist/.nojekyll for GitHub Pages.')
