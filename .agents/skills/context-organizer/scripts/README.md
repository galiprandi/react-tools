# Scripts de context-organizer

Herramientas auxiliares para mantener BEHAVIOR.md sincronizado con la suite de tests e inicializar la Capa 1 en repos nuevos.

## `compile-behavior.mjs`

Compila `BEHAVIOR.md` a partir de `test-results.json`.

### Uso

1. Generar JSON de tests:
   - **Jest:** `jest --json --outputFile=.context/test-results.json`
   - **Vitest:** `vitest run --reporter=json --outputFile=.context/test-results.json`

2. Ejecutar script:
   ```bash
   node skills/context-organizer/scripts/compile-behavior.mjs
   ```

El script:
- Lee `.context/test-results.json`
- Agrupa tests por módulo (`describe`)
- Normaliza "should" → "DEBE", "should not" → "NO DEBE"
- Escribe `BEHAVIOR.md` en la raíz del repo

## `pre-commit.sh`

Hook de Husky para regenerar BEHAVIOR.md automáticamente en cada commit.

### Instalación

```bash
cp skills/context-organizer/scripts/pre-commit.sh .husky/pre-commit
chmod +x .husky/pre-commit
```

### Qué hace

1. Ejecuta tests con reporter JSON
2. Si pasan, corre `compile-behavior.mjs`
3. Stagea `BEHAVIOR.md` en el commit

### Requisitos

- Husky instalado en el repo
- Script `compile-behavior.mjs` disponible
- Tests configurados para salida JSON

## `init-repo.sh`

Inicializa un repo nuevo con los 4 .md de Capa 1 (excepto BEHAVIOR.md que se genera vía tests).

### Uso

```bash
bash skills/context-organizer/scripts/init-repo.sh
```

### Qué hace

1. Copia `README.md`, `AGENTS.md`, `DESIGN.md`, `ADR.md` desde `templates/` al root del repo si no existen
2. Crea directorio `.context/` para `test-results.json`
3. Instala hook `pre-commit` si Husky está disponible

### Plantillas

Las plantillas residen en `scripts/templates/`:
- `README.md` — propósito, stack, env, bootstrap
- `AGENTS.md` — matriz de consulta, restricciones operativas
- `DESIGN.md` — tokens, componentes, estados
- `ADR.md` — formato de decision records

Editá estos archivos según tu proyecto después de inicializar.
