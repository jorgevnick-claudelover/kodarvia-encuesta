# Feedback inmediato para cicloturistas · Pedalea Rutas

Web app móvil para capturar la opinión de cada ciclista al terminar un recorrido guiado por Buenos Aires, resolver los problemas en el día (alerta al encargado ante 1-2 estrellas) y derivar las reseñas positivas a Google Maps (solo ante 4-5 estrellas). Incluye un panel administrativo en tiempo real con KPIs, gráficos, filtros, alertas y exportación CSV.

Es un frontend completo sin backend: persiste en `localStorage` y simula las notificaciones. Kodarvia integra después el backend, las APIs de WhatsApp y correo, la autenticación y los textos legales definitivos (ver [Qué está simulado](#qué-está-simulado-y-dónde-conecta-kodarvia)).

**URL de previsualización: https://kodarvia-encuesta.vercel.app/**

Panel: https://kodarvia-encuesta.vercel.app/admin · Encuesta con QR de ejemplo: https://kodarvia-encuesta.vercel.app/?recorrido=palermo&guia=mariana

---

## Cómo arrancarlo

Requiere Node 20 o superior.

```bash
npm install
npm run dev      # http://localhost:5173
npm run test     # tests con Vitest
npm run build    # build de producción en dist/
npm run preview  # sirve dist/ localmente
```

Para desplegar en Vercel alcanza con importar el repo: `vercel.json` ya redirige todas las rutas a `index.html` (SPA).

## Rutas

| Ruta | Qué es |
| --- | --- |
| `/` | Encuesta para el ciclista (una pregunta por pantalla, pensada para 360 px). |
| `/admin` | Panel del encargado: KPIs, gráficos, filtros, alertas, historial, CSV. Sin login en esta demo. |

### Parámetros de URL para el QR

Cada salida puede tener su propio QR que precarga datos y salta la pantalla de recorrido:

```
https://<dominio>/?recorrido=palermo&guia=mariana
```

| Parámetro | Valores válidos | Efecto |
| --- | --- | --- |
| `recorrido` | `san-telmo`, `la-boca`, `costanera-sur`, `palermo` | Se guarda y se salta la pregunta 1. |
| `guia` | `mariana`, `tomas`, `julieta`, `nicolas` | Se guarda y la pregunta del guía muestra su nombre. |

Valores desconocidos se ignoran sin romper nada. Los identificadores se editan en `src/config.ts`.

## Estructura de carpetas

```
src/
├── config.ts                 Operador, recorridos, guías, URL de Google Maps, contacto del encargado, zona horaria
├── types.ts                  Tipos de respuesta, alerta, bandeja de salida y filtros
├── main.tsx / App.tsx        Entrada y rutas (react-router-dom); el panel se carga con lazy()
├── index.css                 Tailwind + clases utilitarias (.btn, .chip, .card, .input)
├── lib/
│   ├── storage.ts            Lectura/escritura tipada de localStorage con try/catch y respaldo en memoria
│   ├── store.ts              Operaciones de datos: enviar respuesta, crear alerta, resolver, reiniciar
│   ├── survey.ts             Reglas de la encuesta: canInviteReview, shouldCreateAlert, commentPrompt, canSubmit, parseSurveyParams
│   ├── stats.ts              Funciones puras: promedios, distribución, series diarias, filtros por fecha/estrellas/recorrido
│   ├── csv.ts                Generación y descarga del CSV (BOM, escapado, nombre con fecha)
│   ├── notifications.ts      sendManagerAlert: bandeja de salida simulada de WhatsApp y correo
│   ├── seed.ts               50 respuestas y 6 alertas de ejemplo, relativas a hoy
│   ├── dates.ts              Utilidades de fecha en America/Argentina/Buenos_Aires
│   └── *.test.ts             Tests de Vitest
├── hooks/
│   └── useFeedbackStore.ts   Estado en tiempo real: evento "storage" (otras pestañas) + CustomEvent (misma pestaña)
├── pages/
│   ├── SurveyPage.tsx        Flujo de la encuesta
│   └── AdminPage.tsx         Panel administrativo
└── components/
    ├── survey/               ProgressBar, StepShell, StarRating, ChoiceList, ChipGroup, CommentStep, ConsentStep, PrivacyModal, FinalScreen
    ├── admin/                FiltersBar, KpiCards, Charts, AlertsSection, HistoryTable, OutboxPanel
    └── ui/                   BikeIcon (SVG inline), Logo, Modal, Toast
```

Stack: Vite, React 19, TypeScript, Tailwind CSS 3 (tokens `bg`, `brand`, `accent`, `ink`, `alert` en `tailwind.config.ts`), react-router-dom, Recharts, Vitest. Tipografía Plus Jakarta Sans desde Google Fonts.

## Cómo funciona la encuesta

1. Recorrido (4 chips; se salta si viene por URL).
2. Calificación general, 5 estrellas con `aria-label`.
3. Bicicleta: Impecable / Algún detalle menor / Tuve problemas.
4. Casco y equipamiento: Cómodo y en buen estado / Mejorable / Faltó o estaba dañado.
5. Guía, 1-5 estrellas, con su nombre si vino por URL.
6. Comentario condicional según la calificación general (`commentPrompt` en `src/lib/survey.ts`):
   - 1-2 ★: "¿Qué salió mal? Lo resolvemos hoy", chips de problemas, texto libre y contacto opcional.
   - 3 ★: "¿Qué mejorarías?".
   - 4-5 ★: "¿Qué fue lo mejor?".
7. Consentimiento obligatorio con modal de política de privacidad (texto provisional).
8. Pantalla final: CTA "Contalo en Google Maps" solo con 4-5 ★ (`canInviteReview`), mensaje de alerta con 1-2 ★, agradecimiento con 3 ★.

Las preguntas de elección única avanzan solas al tocar una opción. El botón principal queda anclado abajo y todos los objetivos táctiles miden 48 px o más.

Cada respuesta se guarda con: `id`, `createdAt` (ISO UTC), `recorrido`, `guia`, `estrellasGeneral`, `bici`, `casco`, `estrellasGuia`, `chips[]`, `comentario`, `contactoNombre`, `contactoWhatsapp`, `consentimiento { aceptado, timestamp }`, `reviewInvited`, `reviewClicked`, `alertId`.

## Qué está simulado y dónde conecta Kodarvia

| Pieza | Estado en esta demo | Dónde conectar |
| --- | --- | --- |
| Notificaciones al encargado (WhatsApp y correo) | `sendManagerAlert()` escribe los payloads en la bandeja de salida simulada (`localStorage`, clave `bicifeedback:v1:outbox`), visible desde el panel. No hay llamadas de red. | `src/lib/notifications.ts`, bloque comentado "KODARVIA: punto de integración" y la línea marcada `>>> KODARVIA <<<`. |
| URL de reseña de Google Maps | Placeholder con `TODO`. | `src/config.ts`, campo `googleReviewUrl`. |
| Autenticación del panel | Sin login; banner "Acceso sin autenticación en esta demo". | Envolver la ruta `/admin` en `src/App.tsx` con el proveedor de auth y quitar el banner en `src/pages/AdminPage.tsx`. |
| Persistencia | `localStorage` con prefijo versionado `bicifeedback:v1:` y respaldo en memoria si falla. | `src/lib/storage.ts` (`readJSON`/`writeJSON`) o, a más alto nivel, `src/lib/store.ts` (`submitResponse`, `resolveAlert`, `markReviewClicked`). |
| Textos legales | Política provisional con la marca "Texto provisional: Kodarvia redacta los términos definitivos". | `src/components/survey/PrivacyModal.tsx`. |
| Datos del operador, recorridos y guías | Operador "Pedalea Rutas". | `src/config.ts`. |

## Datos de ejemplo

`src/lib/seed.ts` siembra 50 respuestas repartidas en los últimos 45 días (horarios de 9 a 19 en hora de Buenos Aires, al menos 2 de hoy) con la distribución 5★ 58 %, 4★ 20 %, 3★ 10 %, 2★ 8 %, 1★ 4 %, comentarios verosímiles y distintos, y 6 alertas (2 abiertas, una de hoy; 4 resueltas con nota). Solo se siembra si no existe la clave `bicifeedback:v1:seeded`.

Para reiniciarlos:

- Botón **Reiniciar datos de ejemplo** del panel (pide confirmación), o
- borrar en el navegador las claves `bicifeedback:v1:*` de `localStorage` y recargar.

## Panel en tiempo real

`useFeedbackStore` escucha el evento nativo `storage` (cambios desde otras pestañas) y el `CustomEvent` `bicifeedback:change` (cambios en la misma pestaña). Al enviar una encuesta en una pestaña, el panel abierto en otra recalcula KPIs, gráficos, alertas y tabla sin recargar, y muestra un toast carmesí si entró una alerta nueva.

Los filtros de fecha (Hoy / 7 días / 30 días / Todo / Personalizado) calculan los días en `America/Argentina/Buenos_Aires`, no en UTC. Afectan KPIs, gráficos, tabla y exportación.

El CSV incluye todas las columnas de la respuesta, la marca de tiempo en ISO UTC y en hora de Buenos Aires, separador coma, comillas escapadas y BOM UTF-8. Se llama `feedback-cicloturismo-AAAA-MM-DD.csv`.

## Tests

```bash
npm run test
```

| Archivo | Cubre |
| --- | --- |
| `src/lib/survey.test.ts` | `canInviteReview` (solo 4 y 5), `shouldCreateAlert`, bloqueo del envío sin consentimiento, parámetros de URL. |
| `src/lib/store.test.ts` | Creación de alerta solo con 1 y 2 estrellas, bandeja de salida, resolución con nota obligatoria, clic en reseña. |
| `src/lib/stats.test.ts` | Filtros por fecha en zona de Buenos Aires, filtros por rango de estrellas, promedios, distribución, serie diaria. |
| `src/lib/csv.test.ts` | Cabecera completa, BOM, escapado de comas y comillas, marca de tiempo doble, nombre del archivo. |
| `src/lib/seed.test.ts` | Cantidad, distribución, alertas, horarios y siembra única. |

## Criterios de aceptación

| # | Criterio | Dónde se cumple |
| --- | --- | --- |
| 1 | Encuesta completa desde un celular en menos de 60 s | `src/pages/SurveyPage.tsx`: 7 pantallas máximo, avance automático en elección única, botón anclado abajo, parámetros de URL que saltan pantallas. |
| 2 | 1-2 estrellas generan un registro visible de alerta inmediata | `shouldCreateAlert` en `src/lib/survey.ts`; `submitResponse` en `src/lib/store.ts` crea la alerta y llama a `sendManagerAlert`; se ve en `AlertsSection` y en la bandeja de salida del panel. |
| 3 | Invitación a Google Maps exclusivamente tras 4-5 estrellas | `canInviteReview` en `src/lib/survey.ts` (testeada); `FinalScreen.tsx` solo renderiza el CTA cuando devuelve `true`. |
| 4 | Panel que recalcula promedios y gráficos en tiempo real | `src/hooks/useFeedbackStore.ts` + `emitChange` en `src/lib/storage.ts`; `AdminPage.tsx` deriva todo del snapshot. |
| 5 | Filtros por fecha y por rango de estrellas correctos | `filterByDate`, `filterByStars`, `applyFilters` en `src/lib/stats.ts`, con tests en zona de Buenos Aires. |
| 6 | CSV descargable con todas las columnas y marca de tiempo | `src/lib/csv.ts` (`CSV_HEADERS`, `buildCsv`, `downloadCsv`) y botón "Exportar CSV" del panel. |
| 7 | Consentimiento obligatorio antes del envío | `canSubmit` en `src/lib/survey.ts`, `ConsentStep.tsx` con error accesible (`role="alert"`), `submitResponse` rechaza sin consentimiento. |
| 8 | Repo con README completo y URL de previsualización funcionando | Este README y https://kodarvia-encuesta.vercel.app/ (repo `kodarvia-encuesta`). |
