# Especificación de Requerimientos: Evaluación de Alfabetización Comunitaria GBM

**Documento:** `specs/evaluacion-alfabetizacion.md`  
**Versión:** 1.0  
**Fecha:** Octubre 2026  
**Responsable Técnico:** Ivan Manuel (`icastillero@gbm.net`)  
**Metodología:** Spec-Driven Development (SDD)  

---

## 1. Visión del Producto y Contexto

### 1.1 Propósito
GBM desarrolla iniciativas de Responsabilidad Social Empresarial (RSE) enfocadas en cerrar brechas de alfabetización tradicional (lectoescritura) y digital en Panamá. Para evitar asignar recursos a ciegas, se requiere un instrumento de diagnóstico interactivo y no estigmatizante que opere en kioscos comunitarios instalados en centros neurálgicos (estaciones de transporte, centros comerciales, plazas).

### 1.2 User Personas
* **Marta (Usuario Participante Primario):**
  * 52 años, residente de Curundú. Escolaridad: 4º grado de primaria.
  * Teléfono: Android gama baja (pantalla 360 × 640 px, conexiones intermitentes).
  * Habilidades: Lee palabras aisladas, se guía por íconos conocidos (WhatsApp, cámara, lupa).
  * Fricciones críticas: Gran desconfianza si solicitan cédula, nombre o número de teléfono. Si una aplicación parece un "examen escolar" o muestra mensajes de error en rojo, abandona inmediatamente por vergüenza.
  * **Criterio de éxito humano:** Marta debe poder completar la evaluación sola, sin pedir ayuda al promotor, sin estrés y en menos de 3 minutos.
* **Coordinador RSE GBM (Usuario Analítico):**
  * Necesita métricas agregadas por corregimiento para definir dónde llevar los camiones y aulas de capacitación. No requiere datos personales de nadie; requiere volumen, precisión geográfica y clasificación de brecha.
* **Promotor de Kiosco:**
  * Personal en campo que entrega la recompensa física al participante al validar el código de 4 dígitos o asiste a personas con dudas mínimas.

---

## 2. Arquitectura y Stack Tecnológico

```
+-----------------------------------------------------------------------+
|                        Navegador del Usuario (PWA)                    |
|                                                                       |
|  [Vite + React 19 + TypeScript + Tailwind CSS + Framer Motion]        |
|                                                                       |
|  +---------------------+  +---------------------+  +---------------+  |
|  | Web Speech API      |  | Web Audio API       |  | Service Worker|  |
|  | (Síntesis de voz)   |  | (SFX Procedurales)  |  | (Offline PWA) |  |
|  +---------------------+  +---------------------+  +---------------+  |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  | Persistencia Local: IndexedDB / localStorage (Try/Catch)        |  |
|  | - Sesiones completadas y abandonadas                            |  |
|  | - Token anónimo del dispositivo (24h de control de premio)      |  |
|  | - Sesión activa recuperable (<10 min)                           |  |
|  +-----------------------------------------------------------------+  |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  | Panel Analítico (/datos - PIN: 2026) -> Exportación CSV / JSON  |  |
|  +-----------------------------------------------------------------+  |
+-----------------------------------------------------------------------+
```

* **Sin Backend ni Bases de Datos Externas:** Toda la lógica, cálculo de puntaje, aleatorización y persistencia corre 100% en el dispositivo del cliente.
* **Cero Assets Externos:** Las ilustraciones son SVG en línea. Los sonidos son generados con osciladores de Web Audio API (evita descargas de MP3 y fallas por modo avión/sin conexión).

---

## 3. Historias de Usuario (User Stories) y Criterios de Aceptación

### ÉPICA 1: Incorporación, Privacidad y Verificación Inicial

#### US-01: Acceso contextual desde Kiosco QR (P1)
**Como** transeúnte de la comunidad,  
**Quiero** escanear el código QR en el kiosco y ver una pantalla de bienvenida atractiva y concisa,  
**Para** saber de inmediato qué haré, cuánto tardaré y qué recibiré.

* **Criterios de Aceptación (Gherkin):**
  * **Escenario 1.1: Acceso con kiosco válido**
    * *Dado* que abro la URL con parámetro `?kiosk=PTYK001`.
    * *Cuando* renderiza la pantalla P1.
    * *Entonces* veo el titular "Juega 2 minutos y gana un premio", la ilustración del regalo y el botón "Empezar".
  * **Escenario 1.2: Acceso sin kiosco o con identificador desconocido**
    * *Dado* que abro la URL sin parámetro o con `?kiosk=DESCONOCIDO`.
    * *Cuando* renderiza la pantalla P1.
    * *Entonces* el titular cambia a "Juega 2 minutos y ayuda a tu comunidad" y el origen se marca como `UNKNOWN`.
  * **Escenario 1.3: Modo asistido activo**
    * *Dado* que la URL contiene `?assisted=1`.
    * *Cuando* navego cualquier pantalla.
    * *Entonces* se visualiza el distintivo "Asistido" en la cabecera.

#### US-02: Garantía estricta de no recopilación de datos personales (P2)
**Como** participante desconfiado de entregar datos privados,  
**Quiero** ver un compromiso explícito de que no se me pedirá nombre, cédula ni teléfono,  
**Para** sentirme seguro de participar sin temor a fraudes ni llamadas comerciales.

* **Criterios de Aceptación:**
  * **Escenario 2.1: Mensaje breve y comprensible**
    * *Dado* que ingreso a la pantalla P2.
    * *Entonces* el texto principal no supera 40 palabras, está acompañado de 3 íconos explicativos y los botones "Acepto" y "No, gracias" tienen exactamente el mismo tamaño y jerarquía táctil.
  * **Escenario 2.2: Aceptación de términos**
    * *Dado* que toco el botón "Acepto".
    * *Entonces* se fija `consent_version: "CONS_PROTO_01"` y avanzo a P3.
  * **Escenario 2.3: Rechazo de privacidad**
    * *Dado* que toco el botón "No, gracias".
    * *Entonces* se despliega una pantalla de despedida cordial y **no se persiste ningún dato** en el almacenamiento local.

#### US-03: Filtro de Mayoría de Edad (P3)
**Como** promotor de RSE,  
**Quiero** validar que el participante tenga 18 años o más,  
**Para** cumplir con normativas éticas de recolección comunitaria.

* **Criterios de Aceptación:**
  * **Escenario 3.1: Mayor de edad**
    * *Dado* que toco "Sí" en P3.
    * *Entonces* avanzo inmediatamente a P4 sin requerir botón "Siguiente".
  * **Escenario 3.2: Menor de edad**
    * *Dado* que toco "No" en P3.
    * *Entonces* se muestra un mensaje de agradecimiento informando que la actividad es para adultos y no se guarda ninguna sesión.

---

### ÉPICA 2: Captura Sociodemográfica Accesible (Sin Teclado)

#### US-04: Rango Etario, Ocupación y Escolaridad al Toque (P4, P5, P6)
**Como** persona con baja fluidez lectora,  
**Quiero** responder mi edad, trabajo y nivel de estudios tocando tarjetas con íconos,  
**Para** no tener que escribir en el teclado ni sentirme juzgado.

* **Criterios de Aceptación:**
  * **Escenario 4.1: Avance inmediato por toque**
    * *Dado* que estoy en P4, P5 o P6.
    * *Cuando* toco cualquier opción.
    * *Entonces* emite un sonido háptico/tono suave de confirmación y avanza de pantalla en menos de 250 ms sin botón "Siguiente".
  * **Escenario 4.2: Codificación canónica estandarizada**
    * *Dado* que selecciono opciones demográficas.
    * *Entonces* se guardan los códigos estandarizados:
      * Edad: `18_24`, `25_34`, `35_44`, `45_59`, `60_PLUS`, `NA`.
      * Trabajo: `FORMAL`, `INFORMAL`, `UNEMPLOYED`, `STUDENT`, `HOME`, `RETIRED`, `NA`.
      * Estudios: `PRIMARY_INCOMPLETE`, `PRIMARY`, `SECONDARY`, `TERTIARY`, `NA`.

#### US-05: Localización de Residencia con Buscador Tolerante a Errores (P7)
**Como** vecino de una comunidad,  
**Quiero** encontrar rápidamente mi corregimiento mediante botones rápidos o un buscador tolerante a faltas tipográficas,  
**Para** no frustrarme si no recuerdo la ortografía exacta.

* **Criterios de Aceptación:**
  * **Escenario 5.1: Chips locales directos**
    * *Dado* que el kiosco es `PTYK001` (Campus universitario).
    * *Entonces* veo los 5 chips directos: Bethania, Pueblo Nuevo, Curundú, San Francisco, Ancón.
    * *Y* al tocar uno, se guarda `residence_method: "CHIP"` y avanzo a P8.
  * **Escenario 5.2: Búsqueda difusa tolerante (Criterio 5)**
    * *Dado* que abro el buscador "Otro lugar".
    * *Cuando* ingreso cualquiera de los siguientes términos: `"toc"`, `"TOC"`, `"tokumen"` o `"Tocúmen"`.
    * *Entonces* el sistema muestra en la lista de resultados a `"Tocumen"` (código `Z014`).
  * **Escenario 5.3: Prohibición de texto libre**
    * *Dado* que el usuario escribe en el campo de búsqueda.
    * *Entonces* el sistema nunca guarda la cadena escrita directamente; solo permite seleccionar un elemento del catálogo oficial (`zonas.json`) guardando su identificador `Z001`–`Z036`.
  * **Escenario 5.4: Opción de declinar**
    * *Dado* que toco "Prefiero no decir".
    * *Entonces* se guarda `residence_method: "DECLINED"` sin `residence_zone_id` y avanzo.

---

### ÉPICA 3: Microrretos de Alfabetización y Gamificación

#### US-06: Práctica Libre de Mecánicas (P8)
**Como** participante novato con pantallas táctiles,  
**Quiero** realizar una práctica rápida de tocar y deslizar,  
**Para** entender cómo responder sin la presión de una evaluación.

* **Criterios de Aceptación:**
  * **Escenario 6.1: Práctica guiada**
    * Contiene un ejercicio de toque y uno de deslizamiento interactivo.
    * No genera puntuación ni penalidades.
  * **Escenario 6.2: Salto directo**
    * Existe un botón siempre visible "Ya sé jugar" que permite saltar inmediatamente a los retos.

#### US-07: Reto 1 - Lectura Visual de Letreros Cotidianos (P9)
**Como** evaluador comunitario,  
**Quiero** medir si el participante comprende información textual crítica en su entorno (farmacias, medicamentos, paradas),  
**Para** diagnosticar alfabetización tradicional contextual.

* **Criterios de Aceptación:**
  * **Escenario 7.1: Selección aleatoria**
    * Se eligen exactamente 2 ítems al azar del banco R1 (`R1_FARMACIA`, `R1_MEDICINA`, `R1_PISO`, `R1_BUS`).
  * **Escenario 7.2: Regla estricta de voz (Principio 1 y Criterio 8)**
    * *Cuando* el usuario presiona el botón de audio.
    * *Entonces* el sintetizador lee **únicamente** la pregunta (ej. *"¿Qué día está cerrada la farmacia?"*).
    * *Y* **nunca** lee el contenido del letrero (ej. no lee *"Domingo CERRADO"*).
  * **Escenario 7.3: Tocar avanza**
    * Al tocar cualquiera de las 4 opciones, se registra la respuesta (`correct`, `ms`, `audio_used`, `input: 'TAP'`) y avanza de ítem.

#### US-08: Reto 2 - Completar la Frase con Apoyo Icónico (P10)
**Como** participante con vocabulario cotidiano,  
**Quiero** completar oraciones simples seleccionando la palabra correcta entre 4 alternativas con íconos,  
**Para** demostrar fluidez lectoescritora básica.

* **Criterios de Aceptación:**
  * **Escenario 8.1: Presentación y audio**
    * Muestra una frase con espacio en blanco (`"Para viajar en metro necesito recargar mi ____."`).
    * El botón de audio lee **únicamente:** *"Toca la palabra que falta"*.
  * **Escenario 8.2: Opciones con refuerzo visual**
    * Las 4 opciones combinan palabra e ícono (ej. tarjeta, cuchara, zapato, pelota).
    * Tocar una opción rellena visualmente el espacio y avanza.

#### US-09: Transición Motivacional (P11)
**Como** participante,  
**Quiero** recibir una pausa estimulante al terminar el bloque de lectura,  
**Para** sentirme motivado antes de iniciar los retos digitales.

* **Criterios de Aceptación:**
  * Muestra animación de estrellas y el mensaje "¡Vas muy bien!".
  * Reproduce un sonido armónico de logro.
  * Avanza automáticamente tras máximo 2 segundos o de inmediato si el usuario toca la pantalla.

#### US-10: Reto 3 - Íconos Digitales del Smartphone (P12)
**Como** evaluador de habilidades digitales,  
**Quiero** medir si la persona reconoce íconos esenciales del sistema operativo móvil (lupa, wifi, engranaje, atrás),  
**Para** diagnosticar su autonomía de navegación en smartphones.

* **Criterios de Aceptación:**
  * **Escenario 10.1: Selección y audio completo**
    * 2 ítems al azar de R3.
    * El audio lee la instrucción completa (ej. *"Toca el ícono para conectarte a internet sin gastar datos"*).
  * **Escenario 10.2: Cuadrícula táctil**
    * 4 íconos grandes distribuidos en cuadrícula 2×2 en orden aleatorio.
    * Tamaño de cada botón $\ge 80 \times 80$ px.

#### US-11: Reto 4 - Ciberseguridad Básica: Riesgo vs. Seguro con Deslizamiento (P13)
**Como** participante expuesto a estafas digitales,  
**Quiero** evaluar situaciones comunes de celular clasificándolas como Riesgo o Seguro mediante gestos o botones,  
**Para** demostrar conciencia básica de seguridad digital.

* **Criterios de Aceptación:**
  * **Escenario 11.1: Mecánica dual (Criterio 6)**
    * El participante puede clasificar la tarjeta deslizando a la izquierda (Riesgo) o a la derecha (Seguro).
    * O tocar los botones fijos inferiores "Riesgo" (amarillo/naranja) y "Seguro" (verde).
  * **Escenario 11.2: Feedback visual continuo**
    * Al arrastrar la tarjeta, esta rota suavemente y su borde se tiñe progresivamente hacia el color de la decisión.
  * **Escenario 11.3: Audio integral**
    * El botón de audio lee la situación completa descrita en la tarjeta.

---

### ÉPICA 4: Celebración, Recompensa y Cierre de Sesión

#### US-12: Celebración Libre de Juicios y Satisfacción (P14, P15)
**Como** participante que completó los retos,  
**Quiero** recibir una felicitación entusiasta y un consejo útil,  
**Para** sentirme valorado sin ser calificado numéricamente.

* **Criterios de Aceptación:**
  * **Escenario 12.1: Cero estigma (Criterio 7)**
    * En ningún momento se muestra puntaje numérico, porcentaje ni categoría (`ROJO`, `AMARILLO`, `VERDE`) al participante.
  * **Escenario 12.2: Celebración con accesibilidad (Criterio 9)**
    * Despliega animación de trofeo, fanfarria sonora y confeti suave.
    * Si el sistema tiene activo `prefers-reduced-motion`, el confeti se desactiva y las animaciones se detienen.
  * **Escenario 12.3: Consejo de seguridad aleatorio**
    * Presenta uno de los consejos de seguridad bancaria/celular definidos en `items.json`.
  * **Escenario 12.4: Encuesta de satisfacción opcional**
    * En P15 ofrece 3 caritas (Poco, Bien, ¡Mucho!) y un botón "Saltar".

#### US-13: Emisión de Recompensa y Control de Abuso (P16)
**Como** participante y gestor del kiosco,  
**Quiero** entregar un código de canje único y limitar las recompensas a una por dispositivo cada 24 horas,  
**Para** incentivar la participación comunitaria sin agotar el stock de premios.

* **Criterios de Aceptación:**
  * **Escenario 13.1: Primer intento válido**
    * Muestra estado "Preparando tu premio..." (1.5 s) y genera un código de 4 dígitos (ej. `4821`).
    * Registra la marca temporal del premio en el dispositivo.
  * **Escenario 13.2: Reintento dentro de 24 horas (Criterio 15)**
    * Si el mismo dispositivo intenta jugar antes de 24 horas, la sesión se marca `repeat_device: true`, no entrega código y muestra: *"Hoy ya recibiste tu premio. ¡Gracias por jugar otra vez!"*.
  * **Escenario 13.3: Modo sin conexión (Criterio 14)**
    * Si el dispositivo no tiene internet, no espera 1.5s; muestra directamente el código con la instrucción: *"Muestra este código al promotor"*.
  * **Escenario 13.4: Kiosco UNKNOWN (Criterio 16)**
    * No ofrece código de premio; agradece la colaboración comunitaria.

#### US-14: Cierre Higiénico y Retorno Automático (P17)
**Como** promotor de kiosco en un espacio público,  
**Quiero** que la aplicación vuelva a la pantalla de bienvenida sola tras terminar,  
**Para** que quede lista para el siguiente transeúnte sin intervención manual.

* **Criterios de Aceptación:**
  * Cuenta regresiva visible de 10 segundos para retornar a P1.
  * Botón "Terminar" que reinicia de inmediato.
  * Limpia las variables de sesión activa en progreso.

---

### ÉPICA 5: Resiliencia, Accesibilidad y Casos Borde

#### US-15: Botón de Audio Universal en Cada Pantalla (Criterio 8)
* Cada pantalla cuenta con un botón táctil destacado $\ge 48$ px de audio.
* Al pulsar mientras habla, detiene la locución (`speechSynthesis.cancel()`).
* Si el navegador carece de motor de voz, activa un resaltado visual sobre el texto correspondiente.

#### US-16: Tolerancia a la Inactividad y Abandono (Criterio 13)
* **45 segundos sin tocar la pantalla:** Alerta auditiva y modal visible: *"¿Sigues ahí? Toca la pantalla para continuar"*.
* **90 segundos de inactividad total:** Cierra la sesión, la persiste con `status: "ABANDONED"` registrando el último paso alcanzado (`last_step`), y regresa a P1.
* **Botón Salir:** En cada paso (salvo P1 y P17) existe un botón discreto "Salir" que termina como abandono sin confirmaciones molestas.

#### US-17: Rescate de Sesión por Recarga Accidental (Criterio 13)
* Si el navegador se cierra o recarga durante una sesión con consentimiento aceptado y han pasado **menos de 10 minutos**:
* Al abrir la aplicación se presenta el modal: *"¿Deseas continuar donde quedaste o empezar de nuevo?"*.
* Si pasaron más de 10 minutos, se descarta automáticamente.

---

### ÉPICA 6: Inteligencia de Datos y Administración (`/datos`)

#### US-18: Panel Analítico Protegido con Métricas RSE
**Como** equipo de analítica y RSE de GBM,  
**Quiero** consultar los resultados consolidados protegidos con PIN,  
**Para** evaluar la necesidad de talleres por corregimiento.

* **Criterios de Aceptación:**
  * **Acceso:** Protegido por PIN `2026`.
  * **Métricas Principales:**
    * Total de sesiones iniciadas, completadas y abandonadas.
    * Tasa de finalización (%).
    * Duración mediana total y duración mediana de los retos (P9 a P13).
  * **Embudo de Conversión:** Conteo y tiempo mediano por cada uno de los 17 pasos.
  * **Distribución RSE:** Porcentaje en `VERDE`, `AMARILLO` y `ROJO`.
  * **Distribución Geográfica:** Sesiones agregadas por cada corregimiento de residencia.
  * **Analítica por Ítem:** Tasa de acierto, tiempo promedio de respuesta y frecuencia de uso del botón de audio.
  * **Acciones Operativas:**
    * Exportar JSON completo.
    * Exportar CSV tabular compatible con Excel / PowerBI.
    * Botón "Simular sincronización" (pasa sesiones locales de `synced: false` a `synced: true`).
    * Botón "Generar 50 de prueba" para demostraciones.
    * Botón "Borrar todo" con modal de confirmación en UI (sin `window.confirm`).

---

## 4. Insumos Técnicos para el Desarrollador

### 4.1 Esquema de Datos Canónico (`SessionData`)
```typescript
export interface SessionData {
  session_id: string;               // UUID v4
  kiosk_origin_id: string;          // PTYK001, PTYK002, PTYK003 o UNKNOWN
  anon_device_id: string;           // UUID aleatorio persistido (no biométrico)
  assisted: boolean;                // Flag URL ?assisted=1
  consent_version: string;          // "CONS_PROTO_01"
  status: 'COMPLETED' | 'ABANDONED';
  last_step: string;                // P1 a P17
  demographics?: {
    age_group?: '18_24' | '25_34' | '35_44' | '45_59' | '60_PLUS' | 'NA';
    employment_status?: 'FORMAL' | 'INFORMAL' | 'UNEMPLOYED' | 'STUDENT' | 'HOME' | 'RETIRED' | 'NA';
    education_level?: 'PRIMARY_INCOMPLETE' | 'PRIMARY' | 'SECONDARY' | 'TERTIARY' | 'NA';
  };
  residence_zone_id?: string;       // Z001 - Z036
  residence_method?: 'CHIP' | 'SEARCH' | 'DECLINED';
  answers: Array<{
    item_id: string;                // Ej. "R1_FARMACIA"
    choice: string;                 // Opción elegida
    correct: boolean;
    ms: number;                     // Tiempo de respuesta en milisegundos
    audio_used: boolean;            // Si pulsó escuchar en este ítem
    input: 'TAP' | 'SWIPE' | 'DRAG';
  }>;
  step_times_ms: Record<string, number>; // Tiempo transcurrido por pantalla
  scores?: {
    s_lit: number;                  // 0 a 50
    s_dig: number;                  // 0 a 50
    s_total: number;                // 0 a 100
    category: 'ROJO' | 'AMARILLO' | 'VERDE';
  };
  satisfaction?: number;            // 1 (Poco), 2 (Bien), 3 (Mucho)
  reward?: {
    eligible: boolean;
    code: string;                   // 4 dígitos aleatorios
    repeat_device: boolean;
  };
  started_at: string;               // ISO 8601
  finished_at?: string;             // ISO 8601
  synced: boolean;
}
```

### 4.2 Fórmulas de Puntuación y Clasificación RSE (Sección 8)
* **$S_{lit}$ (0 a 50):**  
  $$\text{Aciertos en Retos 1 y 2 (máximo 4)} \times 12.5$$
* **$S_{dig}$ (0 a 50):**  
  $$(\text{Aciertos en Reto 3 (máximo 2)} \times 12.5) + \left(\text{Aciertos en Reto 4 (máximo 3)} \times \frac{25}{3}\right)$$
* **$S_{total}$ (0 a 100):**  
  $$S_{lit} + S_{dig}$$
* **Regla de Clasificación Categórica:**
  * **`ROJO`:** Si $S_{lit} < 25$. (Prioridad urgente en alfabetización básica).
  * **`AMARILLO`:** Si $S_{lit} \ge 25$ y $S_{dig} < 25$. (Alfabetización tradicional suficiente, brecha digital).
  * **`VERDE`:** Si $S_{lit} \ge 25$ y $S_{dig} \ge 25$. (Competencias básicas consolidadas).

> [!CAUTION]
> **Aritmética de Coma Flotante:**  
> En el caso de 3 aciertos en Reto 4, $3 \times (25/3)$ debe computarse algebraicamente como 25 exacto o con tolerancia $\epsilon = 10^{-9}$ para evitar que $24.999999999999996$ clasifique erróneamente en `AMARILLO`.

#### Tabla de Casos de Prueba de Verdad:
| Caso | Lectura (de 4) | Íconos (de 2) | Tarjetas (de 3) | $S_{lit}$ | $S_{dig}$ | Categoría |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 1 | 4 | 2 | 3 | 50.00 | 50.00 | **VERDE** |
| 2 | 2 | 1 | 2 | 25.00 | 29.17 | **VERDE** |
| 3 | 3 | 0 | 3 | 37.50 | 25.00 | **VERDE** |
| 4 | 3 | 1 | 1 | 37.50 | 20.83 | **AMARILLO** |
| 5 | 2 | 0 | 2 | 25.00 | 16.67 | **AMARILLO** |
| 6 | 1 | 2 | 3 | 12.50 | 50.00 | **ROJO** |
| 7 | 0 | 0 | 0 | 0.00 | 0.00 | **ROJO** |

### 4.3 Especificación del Algoritmo Difuso para Corregimientos
1. **Normalización:**
   ```typescript
   export function normalizeText(text: string): string {
     return text
       .normalize('NFD')
       .replace(/[\u0300-\u036f]/g, '')
       .toLowerCase()
       .trim();
   }
   ```
2. **Distancia Levenshtein ($d \le 1$):**  
   Evaluar distancia de edición en cadena completa y ventana deslizante para nombres compuestos (ej. "tokumen" $\rightarrow$ "tocumen", "24 de disiembre" $\rightarrow$ "24 de Diciembre").
3. **Condiciones de visualización:**
   * Mostrar resultados únicamente a partir de la 2ª letra ingresada.
   * Máximo 5 resultados grandes ordenados por relevancia.

---

## 5. Criterios de Éxito del Proyecto (Definition of Done)

Para que el desarrollo se considere terminado y apto para campo, debe cumplir:
1. **Verificación Automatizada:**
   * `npm test`: 100% de pruebas unitarias pasando (mínimo los 7 casos de puntuación, aleatoriedad de ítems, búsqueda difusa y persistencia).
   * `npm run build`: Compilación con cero errores de TypeScript en modo estricto.
2. **Auditoría de Calidad (Lighthouse en móvil):**
   * **Accesibilidad:** $\ge 90$ (Contraste WCAG AA, tags semánticos, botones $\ge 48 \times 48$ px).
   * **Rendimiento:** $\ge 85$ (Peso total transferido $< 150$ KB gzip, inicio en $< 1.5$ s en 4G).
3. **Validación con Usuarios Reales:**
   * Tasa de finalización sin asistencia $\ge 80\%$ en pruebas con personas con bajo nivel de escolaridad.
   * Tiempo mediano de finalización entre 1.5 y 2.5 minutos.
