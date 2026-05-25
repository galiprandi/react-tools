---
name: context-organizer
description: Gobierna los 5 .md de Capa 1 (README, AGENTS, DESIGN, BEHAVIOR, ADR) en la raíz del repo. Úsala al iniciar cualquier tarea en un repositorio, al modificar tests/componentes/tokens de diseño, o cuando el usuario enuncie un ADR o regla de diseño candidata. Obliga al modelo a crear los .md faltantes, actualizarlos proactivamente sin consultar y mantenerlos curados, sintetizados y veraces.
---

# context-organizer

Skill imperativa para mantener la **Capa 1 (Los 5 Fantásticos)** de documentación viva en la raíz del repo. Tu deber: que el contexto indexable nunca mienta.

## Principios imperativos

- **Boy Scout obligatorio:** si detectás gap, contradicción o desalineación entre los 5 .md y el código, DETENÉ la tarea principal, corregí el .md y recién después continuá.
- **Crear si falta:** si `README.md`, `AGENTS.md`, `DESIGN.md` o `ADR.md` no existen, CREALOS ya con la plantilla mínima. `BEHAVIOR.md` se genera automáticamente ejecutando los tests (ver motor abajo).
- **Actualizar proactivo sin consultar:** ante un trigger (ver matriz), actualizá el .md correspondiente sin preguntar al usuario. Es tu responsabilidad, no una sugerencia.
- **Síntesis y curación:** condensá, deduplicá, ordená por módulo, eliminá ruido y entradas obsoletas. Prosa breve, jerárquica, alta densidad por token.
- **Leer antes de codear:** consultá los .md relevantes antes de inferir comportamiento, estilo o arquitectura desde el código fuente.

## Matriz de los 5 archivos

| Archivo | Qué guarda | Leer cuando | Actualizar (trigger) | Owner | Mutabilidad |
|---|---|---|---|---|---|
| `README.md` | Propósito, stack, env, prerrequisitos, comandos de bootstrap. | Onboarding, levantar entorno, dudas de stack. | Cambio de runtime, framework, env vars, comandos de init/deploy local. | Humano (vos editás si detectás drift). | Mutable, sobrescribible. |
| `AGENTS.md` | Inventario de skills/tools, restricciones operativas, matriz de enrutamiento documental, políticas de seguridad. | Al iniciar cualquier tarea en el repo (system prompt local). | Nueva skill/tool/regla operativa, fricción detectada en ejecución, nueva restricción de codificación. | Co-owned (humano + vos). | Mutable. |
| `DESIGN.md` | Tokens (color/tipografía/espaciado), catálogo de componentes UI, patrones de estados (loading/error/empty), criterios a11y. | Antes de crear/refactorizar cualquier vista o componente UI. | Nuevo componente reusable, token visual, patrón de estado, decisión de a11y o usuario define regla de diseño. | Vos (autónomo). | Mutable, consolidable. |
| `BEHAVIOR.md` | Reglas de negocio verificadas, en prosa con `DEBE`/`NO DEBE`, agrupadas por módulo. | Antes de tocar lógica de negocio, para entender comportamiento sin leer tests. | Cada modificación/creación de test que pasa en verde (ver motor abajo). | Vos (100% automatizado). | Reescritura determinista; no editar a mano. |
| `ADR.md` | Decisiones arquitectónicas: Contexto, Decisión, Consecuencias. Numeradas, cronológicas. | Antes de proponer refactor estructural o cambio de stack. | Usuario enuncia decisión técnica irreversible / de alto impacto, o vos tomás una autónoma. Actualizá vos mismo. | Vos (append autónomo). | **Append-only e inmutable.** Para revertir: nuevo ADR que `supersedes ADR-NNN`. |

## Triggers proactivos (acción → archivo)

- Modificar/crear test verde → `BEHAVIOR.md`
- Crear/refactor componente UI, token visual, patrón de estado → `DESIGN.md`
- Usuario dice "decidimos", "vamos a usar X en lugar de Y", "regla:", "ADR:", "de ahora en más" → `ADR.md` (append) + posible `DESIGN.md`/`AGENTS.md`
- Cambio de runtime, framework, env var, script npm de bootstrap → `README.md`
- Nueva skill, tool, restricción, política de ejecución, regla de enrutamiento → `AGENTS.md`

Si un cambio dispara varios triggers, actualizá todos los .md afectados en la misma intervención.

## Plantillas e inicialización

### Inicializar un repo nuevo

```bash
bash skills/context-organizer/scripts/init-repo.sh
```

Este script:
- Copia `README.md`, `AGENTS.md`, `DESIGN.md`, `ADR.md` desde `scripts/templates/` al root si no existen
- Crea `.context/` para `test-results.json`
- Instala hook `pre-commit` si Husky está disponible

### Plantillas

Las plantillas residen en `scripts/templates/`:
- `README.md` — propósito, stack, env, bootstrap
- `AGENTS.md` — matriz de consulta, restricciones operativas
- `DESIGN.md` — tokens, componentes, estados
- `ADR.md` — formato de decision records

Editá las plantillas según tu proyecto después de inicializar.

### `BEHAVIOR.md`

> **NO crear manualmente.** Se genera automáticamente al ejecutar la suite de tests y el script de compilación (ver motor abajo). Formato esperado:

```markdown
# BEHAVIOR.md
> Generado por context-organizer. No editar a mano.
## Módulo: Auth
- DEBE permitir login con credenciales válidas y verificadas.
- NO DEBE permitir acceso con password incorrecto (retorna 401).
- DEBE bloquear cuenta 15 min tras 5 fallos consecutivos.
## Módulo: Pagos
- DEBE emitir `order.paid` a SQS tras confirmación de pasarela.
- DEBE revertir reserva de stock si la tarjeta es rechazada.
```

## Motor BEHAVIOR.md (automatizado)

Flujo determinista:

```
[cambio en tests] → [suite en verde + reporter JSON] → [parse] → [síntesis semántica] → [BEHAVIOR.md]
```

### Comandos de reporter

- **Jest:** `jest --json --outputFile=.context/test-results.json`
- **Vitest:** `vitest run --reporter=json --outputFile=.context/test-results.json`

### Script de compilación

Ejecutá:
```bash
node skills/context-organizer/scripts/compile-behavior.mjs
```

(requiere `.context/test-results.json` generado por el reporter; ver `scripts/README.md` para detalles)

### Hook `pre-commit`

Instalá:
```bash
cp skills/context-organizer/scripts/pre-commit.sh .husky/pre-commit
chmod +x .husky/pre-commit
```

(ver `scripts/README.md` para requisitos y flujo)

### Descripciones ambiguas

Si encontrás `it("should work")`, `it("test 4")`, `it("foo")` o similares:

1. Leé el `expect`/assert del test.
2. Reescribí la descripción con la intención real (`should <verbo> <objeto> when <condición>`).
3. Recompilá `BEHAVIOR.md`.

No tolerés descripciones vacías de semántica: son deuda documental.

## Reglas de curación

- **Deduplicar:** si dos bullets dicen lo mismo con palabras distintas, fusionalos.
- **Agrupar:** ordená por módulo/dominio, no por archivo de test.
- **Podar:** eliminá entradas que ya no aparecen en la suite verde.
- **Compactar `DESIGN.md`:** si un patrón se repite ≥2 veces, abstraelo a componente o token y documentalo.
- **`ADR.md` es append-only:** nunca borres ni reescribas un ADR. Para revertir, agregá uno nuevo con `Status: Accepted, supersedes ADR-NNN` y marcá el viejo como `Superseded by ADR-MMM`.
- **`AGENTS.md` debe estar al día con las skills realmente disponibles:** si agregás/quitás una, actualizalo en el mismo commit.

## Anti-patrones (NO hacer)

- ❌ Inferir comportamiento leyendo código fuente cuando `BEHAVIOR.md` existe y está fresco.
- ❌ Crear componentes ad-hoc sin chequear `DESIGN.md`.
- ❌ Proponer refactors o cambios de stack sin leer `ADR.md` (riesgo de loop infinito).
- ❌ Editar `BEHAVIOR.md` a mano: siempre vía script.
- ❌ Sobrescribir o borrar un ADR.
- ❌ Preguntar al usuario "¿actualizo el .md?" cuando hay trigger claro: actualizá y avisá brevemente en el resumen.

## Checklist mental por intervención

1. ¿Existen `README.md`, `AGENTS.md`, `DESIGN.md`, `ADR.md`? Si no, creá los faltantes. `BEHAVIOR.md` se genera vía script al correr tests.
2. ¿Leí los relevantes a la tarea? (matriz de enrutamiento de `AGENTS.md`)
3. ¿Mi cambio dispara algún trigger? Actualizá los .md afectados.
4. ¿Tests modificados? Corré el motor y regenerá `BEHAVIOR.md`.
5. ¿Quedaron entradas duplicadas u obsoletas? Curá.
