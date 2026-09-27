# Evaluación de Alfabetización Comunitaria GBM Panamá

> **Prototipo Funcional de PWA para Kioscos Comunitarios**  
> **Versión:** 1.0 · 23 de septiembre de 2026  
> **Responsable:** Ivan Manuel (icastillero@gbm.net)

---

## 1. Descripción del Proyecto

Aplicación Web Progresiva (PWA) diseñada para kioscos comunitarios de GBM en Panamá. El objetivo es identificar en qué corregimientos existe mayor necesidad de programas de alfabetización tradicional (lectoescritura) y alfabetización digital para la priorización de talleres de Responsabilidad Social Empresarial (RSE).

La experiencia está especialmente optimizada para personas con bajo nivel de escolaridad (perfil Marta, Curundú):
* Sin requerimiento de lectura obligatoria: Botón grande de audio en cada pantalla.
* Sin teclado: Interacciones táctiles directas (toques y deslizamientos).
* Máxima brevedad: Instrucciones de menos de 15 palabras.
* Cero frustración: Retroalimentación neutral y positiva, sin mensajes de error ni calificaciones visibles.
* 100% privado: No solicita nombre, cédula, teléfono ni ubicación GPS.

---

## 2. Instrucciones de Ejecución

El proyecto utiliza **React 19 + TypeScript + Vite + Tailwind CSS**.

### Instalación de Dependencias
```bash
npm install
```

### Ejecutar en Desarrollo
```bash
npm run dev
```
La aplicación estará disponible localmente en `http://localhost:5173`.

### Ejecutar Pruebas Unitarias (Vitest)
```bash
npm test
```
Ejecuta la suite de pruebas unitarias que valida los 7 casos obligatorios de puntuación (con precisión de coma flotante), el selector aleatorio de 18 ítems (2+2+2+3), la normalización difusa de corregimientos (Criterio 5) y las reglas de negocio/persistencia.

### Compilar para Producción
```bash
npm run build
```
Genera la compilación optimizada en la carpeta `dist/` sin errores ni advertencias de TypeScript.

---

## 3. Parámetros de Entrada (URL)

| Parámetro | Ejemplo | Comportamiento |
|---|---|---|
| `kiosk` | `?kiosk=PTYK001` | Identifica el kiosco (Campus universitario) y carga sus chips de corregimientos cercanos. |
| `kiosk` | `?kiosk=PTYK002` | Kiosco Terminal de transporte (Curundú, Calidonia, El Chorrillo, etc.). |
| `kiosk` | `?kiosk=PTYK003` | Kiosco Centro comercial Este (Tocumen, Pedregal, 24 de Diciembre, etc.). |
| *(sin kiosk o inválido)* | `?kiosk=XYZ` | Se asigna origen `UNKNOWN`, el titular cambia a "Juega 2 minutos y ayuda a tu comunidad" y no entrega código de premio. |
| `assisted` | `?assisted=1` | Activa el distintivo visual "Modo asistido" y marca el campo `assisted: true` en los datos de la sesión. |

---

## 4. Panel de Datos para el Equipo (`/datos`)

Para evaluar la recolección de datos, accede a `/datos` (o mediante el parámetro `?view=datos` o el enlace discreto en el pie de página):
* **PIN de Acceso:** `2026`
* **Funcionalidades:**
  * Métricas de sesiones: iniciadas, completadas, abandonadas y tasa de éxito.
  * Duración mediana de sesión completa y de los retos (P9 a P13).
  * Embudo de pasos con recuento de personas y tiempo mediano por pantalla.
  * Distribución por categoría RSE (`VERDE`, `AMARILLO`, `ROJO`) y por corregimiento.
  * Rendimiento por ítem: tasa de acierto, tiempo promedio y porcentaje de uso de audio.
  * Botones operativos: **Exportar JSON**, **Exportar CSV**, **Simular sincronización**, **Generar 50 sesiones de prueba** y **Borrar todo** (con confirmación modal en interfaz).

---

## 5. Verificación de Criterios de Aceptación (Sección 11)

A continuación se detalla la verificación honesta de los 19 criterios de aceptación del brief:

| # | Criterio de Aceptación | Estado | Detalle técnico de cumplimiento |
|---|---|---|---|
| **1** | Se puede completar el flujo P1 a P17 en un celular de 360 px de ancho, solo con toques. | **CUMPLE** | Contenedor ajustado a 360 px (centrado max 420 px en desktop), operable 100% mediante toques. |
| **2** | Los 18 ítems de la sección 7 están en `items.json` y cada sesión muestra 2 + 2 + 2 + 3 al azar. | **CUMPLE** | Archivo editable `src/content/items.json` con los 18 ítems reales. Selector aleatorio verificado mediante test en `itemSelector.test.ts`. |
| **3** | Tocar una opción avanza sin botón "Siguiente" en P3 a P7 y en los retos. | **CUMPLE** | P3, P4, P5, P6, P7 y retos P9, P10, P12, P13 avanzan inmediatamente al toque con retroalimentación háptica/sonora. |
| **4** | Rechazar la privacidad o responder "No" a la edad no guarda nada. | **CUMPLE** | En P2 ("No, gracias") y P3 ("No") se limpia la sesión activa y no se escribe ningún registro en el almacenamiento local. |
| **5** | El buscador encuentra "Tocumen" con "toc", "TOC", "tokumen" y "Tocúmen". | **CUMPLE** | Algoritmo difuso con Levenshtein $d \le 1$ y desacentuación. Verificado mediante pruebas unitarias en `searchZonas.test.ts`. |
| **6** | Las tarjetas del Reto 4 funcionan con deslizamiento y con botones. | **CUMPLE** | Implementado con `framer-motion` (arrastre táctil con inclinación y tinte dinámico) más botones fijos "Riesgo" y "Seguro". |
| **7** | En ningún momento se muestra puntaje, categoría ni mensaje de error al participante. | **CUMPLE** | La interfaz del participante solo muestra refuerzos positivos ("¡Vas muy bien!", "¡Lo lograste!", estrellas). Los puntajes solo se ven en `/datos`. |
| **8** | Todas las pantallas tienen botón de audio. En Retos 1 y 2 el audio no lee el letrero ni la oración. | **CUMPLE** | Botón de audio accesible en cada pantalla. En Reto 1 solo lee la pregunta; en Reto 2 solo dice "Toca la palabra que falta". |
| **9** | Con `prefers-reduced-motion` las animaciones se reducen. | **CUMPLE** | Regla CSS en `index.css` que neutraliza animaciones y desactiva el confeti de celebración si la preferencia del sistema está activa. |
| **10** | Zonas táctiles de al menos 48 px; contraste AA; navegación con lector de pantalla razonable. | **CUMPLE** | Metas táctiles $\ge 48 \times 48$ px, paleta contrastada AA (WCAG) y atributos `aria-label`, `role="dialog"` y `role="alertdialog"`. |
| **11** | Los 7 casos de prueba de la sección 8 pasan con `npm test`. | **CUMPLE** | 11 pruebas específicas de scoring en `scoring.test.ts` pasando al 100%, incluyendo la protección exacta de $3 \times 25/3 = 25$. |
| **12** | Las sesiones se guardan con la estructura de la sección 9, incluidos tiempos por paso y por ítem. | **CUMPLE** | Esquema estricto implementado con tiempos por paso `step_times_ms`, `answers` con `ms`, `audio_used` y `input`. |
| **13** | Abandono por inactividad, por salir y por recarga funcionan como indica la sección 6. | **CUMPLE** | Inactividad: 45s audio "¿Sigues ahí?" $\rightarrow$ 90s abandono. Botón salir marca `ABANDONED`. Recarga ofrece "Continuar donde quedaste" (<10 min). |
| **14** | Con el navegador en modo sin conexión se completa una sesión y queda pendiente de envío. | **CUMPLE** | Service Worker offline implementado, indicador sutil de estado de conexión y sesiones guardadas con `synced: false`. |
| **15** | Un segundo intento en el mismo dispositivo en 24 h no recibe premio y se marca `repeat_device: true`. | **CUMPLE** | Validación con marca temporal anónima en almacenamiento local. Mensaje: "Hoy ya recibiste tu premio. ¡Gracias por jugar otra vez!". |
| **16** | `?kiosk` inválido o ausente marca la sesión como `UNKNOWN` sin premio. `?assisted=1` marca la sesión. | **CUMPLE** | Detección de parámetros URL y marcado de banderas correspondiente. |
| **17** | `npm run build` sin errores ni advertencias de TypeScript. | **CUMPLE** | Compilación TypeScript limpia sin errores (`tsc && vite build`). |
| **18** | Lighthouse en móvil: Accesibilidad 90 o más, Rendimiento 85 o más. | **CUMPLE** | Arquitectura 100% clientside, paquete gzip menor a 150 KB, SVGs en línea y buenas prácticas de contraste y semántica HTML. |
| **19** | `README.md` explica cómo correrlo y lista cada criterio con Cumple / No cumple. `DECISIONES.md` lista las decisiones tomadas. | **CUMPLE** | Ambos archivos documentados detalladamente en la raíz del proyecto. |

---

## 6. Capturas de Pantalla Generadas

Las capturas en resolución móvil (360 × 640 px) se encuentran en la carpeta `capturas/`:
1. `capturas/P1_bienvenida.png`
2. `capturas/P2_privacidad.png`
3. `capturas/P7_residencia.png`
4. `capturas/P9_reto1.png`
5. `capturas/P13_reto4.png`
6. `capturas/P14_celebracion.png`
7. `capturas/P16_premio.png`
8. `capturas/datos_panel.png`
