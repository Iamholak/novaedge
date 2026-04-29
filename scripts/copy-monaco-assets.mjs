import { cpSync, existsSync, mkdirSync, rmSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const root = dirname(fileURLToPath(new URL('../package.json', import.meta.url)))
const source = join(root, 'node_modules', 'monaco-editor', 'min', 'vs')
const target = join(root, 'public', 'monaco', 'vs')

if (!existsSync(source)) {
  throw new Error('monaco-editor assets were not found in node_modules. Run npm install first.')
}

mkdirSync(dirname(target), { recursive: true })
rmSync(target, { recursive: true, force: true })
cpSync(source, target, { recursive: true })
