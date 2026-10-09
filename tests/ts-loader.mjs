// Ejecuta los sistemas TS con Node sin instalar otro compilador.
import { readFile } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'

export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'phaser') {
    return { url: new URL('./phaser-headless.mjs', import.meta.url).href, shortCircuit: true }
  }
  if (specifier.startsWith('.') && context.parentURL?.endsWith('.ts') && !/\.[a-z]+$/i.test(specifier)) {
    return { url: new URL(`${specifier}.ts`, context.parentURL).href, shortCircuit: true }
  }
  return nextResolve(specifier, context)
}

export async function load(url, context, nextLoad) {
  if (url.endsWith('.ts')) {
    const source = (await readFile(new URL(url), 'utf8')).replaceAll('import.meta.env.DEV', 'false')
    return { format: 'module', source: stripTypeScriptTypes(source, { mode: 'transform' }), shortCircuit: true }
  }
  return nextLoad(url, context)
}
