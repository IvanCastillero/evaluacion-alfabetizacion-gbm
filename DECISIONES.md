# Registro de Decisiones de Diseño y Arquitectura (DECISIONES.md)

**Proyecto:** Prototipo de Evaluación de Alfabetización Comunitaria GBM Panamá  
**Versión:** 1.0  
**Fecha:** 23 de septiembre de 2026  
**Responsable:** Ivan Manuel (icastillero@gbm.net)

---

### 1. Pila Tecnológica y Dependencias
* **Framework:** React 19 con TypeScript y Vite.
* **Estilos:** Tailwind CSS con configuración extendida para colores institucionales GBM y metas táctiles de 48px.
* **Íconos:** `lucide-react` para iconografía táctil y comprensible.
* **Animaciones y Gestos:** `framer-motion` para la física de arrastre (swipe), inclinación y cambio de color de las tarjetas del Reto 4.
* **Confeti:** `canvas-confetti` para la celebración en P14, desactivado si `prefers-reduced-motion` está activo.
* **Pruebas:** Vitest ejecutando pruebas unitarias de funciones puras de puntuación, buscador y reglas de persistencia.

---

### 2. Audio, Voz y Efectos de Sonido
* **Síntesis de Voz (Web Speech API):**
  - Implementado mediante `window.speechSynthesis` buscando dinámicamente la primera voz en español (`es-PA`, `es-MX`, `es-419`, `es-ES`).
  - Fallback visual: Si el dispositivo carece de voces instaladas o la síntesis no está disponible, el texto de la pantalla se resalta suavemente al presionar el botón de audio.
  - **Regla estricta de evaluación:** En Retos 1 y 2, el audio lee únicamente la instrucción o pregunta (`¿Qué día está cerrada la farmacia?`, `Toca la palabra que falta`), **nunca** el letrero ni la oración con el espacio en blanco.
* **Efectos de Sonido (Web Audio API):**
  - Para evitar assets externos y garantizar funcionamiento 100% offline, se implementó un sintetizador nativo de tonos con `AudioContext` para clics, logros, deslizamiento y fanfarria de cierre.

---

### 3. Buscador de Residencia y Algoritmo Difuso (P7)
* **Normalización:** Se utilizó `normalize('NFD').replace(/[\u0300-\u036f]/g, '')` para ignorar tildes, diacríticos y mayúsculas.
* **Algoritmo Difuso:** Se implementó una combinación de búsqueda de subcadena, coincidencia por prefijos de palabras y distancia de Levenshtein con tolerancia de 1 error ($d \le 1$). Esto garantiza que términos como `"tokumen"`, `"TOC"` o `"Tocúmen"` encuentren `"Tocumen"`.
* **Seguridad de Datos:** El buscador solo permite seleccionar corregimientos existentes de `zonas.json` y guarda su código normalizado (ej. `Z014`), sin almacenar texto libre tipeado por el usuario.

---

### 4. Precisión de Puntuaciones y Clasificación (Sección 8)
* **Cálculo de Coma Flotante Exacto:**
  - $S_{dig} = (\text{aciertos R3} \times 12.5) + (\text{aciertos R4} \times 25 / 3)$.
  - Para evitar fallos por imprecisión binaria IEEE 754 (como $3 \times 25/3 = 24.999999999999996$), el cálculo se evalúa de forma fraccionaria exacta y con tolerancia $\epsilon = 10^{-9}$.
  - El caso de 3 tarjetas correctas resulta exactamente en 25 puntos y clasifica como `VERDE`.
* **Umbrales Desacoplados:** Configurables en `src/lib/scoringConfig.ts`.
* **Sesiones Incompletas:** No reciben puntuación (`undefined`).

---

### 5. Persistencia, Privacidad y Casos Borde
* **Privacidad Absoluta:**
  - No se almacena nombre, cédula, teléfono, correo, ubicación geográfica ni huellas de navegador.
  - El identificador del dispositivo es un UUID generado aleatoriamente en el primer uso.
* **Consentimiento y Edad:**
  - Si el usuario rechaza la privacidad en P2 o indica ser menor de edad en P3, se presenta una pantalla de despedida amable y **no se almacena ninguna información**.
* **Control de 24 Horas:**
  - Se registra la fecha del último premio otorgado. Si se realiza una segunda sesión dentro de las 24 horas, se marca `repeat_device: true`, no se asigna código de premio y se muestra un agradecimiento por participar nuevamente.
* **Inactividad:**
  - A los 45 segundos sin interacción se activa un aviso auditivo y visual "¿Sigues ahí?".
  - A los 90 segundos sin respuesta se registra la sesión como `ABANDONED` y se retorna a la pantalla de bienvenida.
* **Recuperación tras Recarga:**
  - Si el usuario recarga la página durante una sesión activa, se ofrece la opción de "Continuar donde quedaste" si han transcurrido menos de 10 minutos.

---

### 6. Usabilidad y Accesibilidad (Perfil Marta, Curundú)
* **Dimensiones:** Interfaz centrada de 360 px de ancho (máximo 420 px en computadoras de escritorio).
* **Zonas Táctiles:** Áreas interactivas con tamaño mínimo de 48 × 48 px y separación mínima de 8 px.
* **Sin Teclado:** Toda la interacción es mediante toques simples y deslizamiento, con teclado únicamente disponible opcionalmente en el buscador de residencia.
* **Sin Frustración:** No existen mensajes de error, timbres negativos ni colores de alerta. El avance es inmediato al tocar una opción.
