# Discrepancias README vs Codebase - 2026-05-16

## Resumen
Se encontraron **3 discrepancias significativas** entre el README.md y el código fuente de la librería.

---

## 🔴 Discrepancia 1: Dialog - Props inexistentes

**Ubicación**: README.md, sección Dialog (líneas 213-241)

**README lista como props de Dialog**:
- `isOpen`
- `behavior`
- `onOpen`
- `onClose`
- `opener`
- `children`
- ❌ `wrapper` (NO existe en DialogProps)
- ❌ `threshold` (NO existe en DialogProps)
- ❌ `onAppear` (NO existe en DialogProps)
- ❌ `onDisappear` (NO existe en DialogProps)

**Código fuente real** (`lib/components/Dialog/index.tsx`):
```typescript
export interface DialogProps extends React.HTMLAttributes<HTMLDialogElement> {
    isOpen?: boolean
    onOpen?: () => void
    onClose?: () => void
    behavior?: 'dialog' | 'modal'
    opener?: ReactElement
}
```

**Explicación**: Las props `wrapper`, `threshold`, `onAppear`, `onDisappear` pertenecen al componente **Observer**, no a Dialog. El README incorrectamente lista estas props como parte de Dialog.

**Impacto**: Alto - Los usuarios que intenten usar estas props en Dialog recibirán errores de TypeScript.

---

## 🔴 Discrepancia 2: Observer - Props desactualizadas

**Ubicación**: README.md, sección Observer (líneas 243-263)

**README lista como props de Observer**:
- ❌ `onChange: (isVisible: boolean) => void` (NO existe en ObserverProps)
- `threshold: number | number[]` (correcto, pero incompleto)

**Código fuente real** (`lib/components/Observer/index.tsx`):
```typescript
export interface ObserverProps
    extends PropsWithChildren,
        IntersectionObserverInit {
    wrapper?: keyof ReactHTML
    onAppear?: (entry: IntersectionObserverEntry) => void
    onDisappear?: (entry: IntersectionObserverEntry) => void
}
```

**Props reales de Observer**:
- ✅ `threshold` (heredado de IntersectionObserverInit)
- ✅ `root` (heredado de IntersectionObserverInit)
- ✅ `rootMargin` (heredado de IntersectionObserverInit)
- ❌ `wrapper` (NO mencionado en README)
- ❌ `onAppear` (NO mencionado en README)
- ❌ `onDisappear` (NO mencionado en README)
- ❌ `onChange` (NO existe en código, pero sí en README)

**Explicación**: El README está desactualizado. Menciona `onChange` que no existe en el código, y no menciona las props reales `onAppear`, `onDisappear`, `wrapper` que sí existen. Además, no menciona que Observer extiende `IntersectionObserverInit`, lo que significa que también acepta `root` y `rootMargin`.

**Impacto**: Alto - Los usuarios no pueden usar las features principales de Observer (onAppear, onDisappear, wrapper) porque no están documentadas, y pueden intentar usar onChange que no funciona.

---

## 🔴 Discrepancia 3: LazyRender - Props incompletas

**Ubicación**: README.md, sección LazyRender (líneas 265-285)

**README lista como props de LazyRender**:
- `placeholder: ReactNode` (correcto)
- `threshold: number | number[]` (correcto, pero incompleto)

**Código fuente real** (`lib/components/LazyRender/index.tsx`):
```typescript
export interface LazyRenderProps
    extends PropsWithChildren,
        IntersectionObserverInit {
    wrapper?: keyof ReactHTML
    placeholder?: React.ReactNode
}
```

**Props reales de LazyRender**:
- ✅ `placeholder`
- ✅ `threshold` (heredado de IntersectionObserverInit)
- ✅ `root` (heredado de IntersectionObserverInit)
- ✅ `rootMargin` (heredado de IntersectionObserverInit)
- ❌ `wrapper` (NO mencionado en README)

**Explicación**: El README no menciona la prop `wrapper` que existe en el código y es útil para personalizar el elemento contenedor. Tampoco menciona que extiende `IntersectionObserverInit`.

**Impacto**: Medio - Los usuarios no pueden personalizar el wrapper, pero el componente funciona sin esta prop.

---

## ✅ Componentes/Hooks verificados sin discrepancias

Los siguientes componentes y hooks fueron verificados y coinciden con el README:

1. **AsyncBlock** - Todas las props coinciden ✅
2. **Form** - Todas las props coinciden ✅
3. **Input** - Todas las props coinciden ✅
4. **DateTime** - Todas las props coinciden ✅
5. **useAI** - Todas las options coinciden ✅
6. **useAISummarize** - Todas las options coinciden ✅
7. **useLanguageDetection** - Todas las options coinciden ✅
8. **useTranslator** - Todas las options coinciden ✅
9. **useDebounce** - Todos los parámetros coinciden ✅
10. **useTimer** - Todas las options coinciden ✅
11. **useList** - Todos los parámetros coinciden ✅

---

## Recomendaciones

1. **Actualizar README.md - Dialog**: Eliminar las props `wrapper`, `threshold`, `onAppear`, `onDisappear` de la sección Dialog. Estas props pertenecen a Observer.

2. **Actualizar README.md - Observer**: 
   - Eliminar `onChange` (no existe)
   - Agregar `wrapper`, `onAppear`, `onDisappear`
   - Mencionar que extiende `IntersectionObserverInit` (incluye `root`, `rootMargin`)

3. **Actualizar README.md - LazyRender**: 
   - Agregar `wrapper`
   - Mencionar que extiende `IntersectionObserverInit` (incluye `root`, `rootMargin`)

4. **Agregar nota sobre IntersectionObserverInit**: Para Observer y LazyRender, explicar que extienden esta interfaz y qué props adicionales están disponibles (`root`, `rootMargin`, `threshold`).
