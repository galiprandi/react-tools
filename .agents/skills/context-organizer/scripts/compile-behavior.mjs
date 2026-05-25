#!/usr/bin/env node
/**
 * Compila BEHAVIOR.md a partir de test-results.json
 * Uso: node compile-behavior.mjs
 * Requiere: .context/test-results.json (generado por Jest/Vitest)
 */

import { readFileSync, writeFileSync } from 'node:fs'

const raw = JSON.parse(readFileSync('.context/test-results.json', 'utf8'))
const results = raw.testResults ?? raw.results ?? []

const modules = new Map()
for (const file of results) {
  for (const t of (file.assertionResults ?? file.tests ?? [])) {
    if (t.status !== 'passed') continue
    const [mod, ...rest] = t.ancestorTitles?.length ? t.ancestorTitles : ['General']
    const desc = `${rest.join(' › ')} ${t.title}`.trim()
    if (!modules.has(mod)) modules.set(mod, new Set())
    modules.get(mod).add(normalize(desc))
  }
}

function normalize(s) {
  // DEBE / NO DEBE a partir de "should"/"should not"
  return s
    .replace(/^should not /i, 'NO DEBE ')
    .replace(/^should /i, 'DEBE ')
    .replace(/\s+/g, ' ')
}

const out = ['# BEHAVIOR.md', '> Generado por context-organizer. No editar a mano.', '']
for (const [mod, set] of modules) {
  out.push(`## Módulo: ${mod}`)
  for (const line of [...set].sort()) out.push(`- ${line}`)
  out.push('')
}
writeFileSync('BEHAVIOR.md', out.join('\n'))
console.log('✅ BEHAVIOR.md actualizado')
