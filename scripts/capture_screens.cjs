const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CAPTURAS_DIR = path.join(__dirname, '..', 'capturas');
if (!fs.existsSync(CAPTURAS_DIR)) {
  fs.mkdirSync(CAPTURAS_DIR, { recursive: true });
}

async function run() {
  console.log('Iniciando servidor Vite para capturas...');
  const viteProcess = spawn('npx', ['vite', '--port', '4173'], {
    cwd: path.join(__dirname, '..'),
    shell: true,
    stdio: 'pipe',
  });

  // Esperar a que el servidor esté listo
  await new Promise((resolve) => setTimeout(resolve, 3000));

  console.log('Iniciando Chromium en modo móvil (360x640)...');
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 360, height: 640 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  const page = await context.newPage();

  try {
    // 1. P1: Bienvenida
    console.log('Capturando P1...');
    await page.goto('http://localhost:4173/?kiosk=PTYK001');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(CAPTURAS_DIR, 'P1_bienvenida.png') });

    // Avanzar a P2 (Privacidad)
    console.log('Capturando P2...');
    await page.click('button:has-text("Empezar")');
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(CAPTURAS_DIR, 'P2_privacidad.png') });

    // Aceptar privacidad -> P3 (Edad) -> P4 -> P5 -> P6 -> P7
    await page.click('button:has-text("Acepto")');
    await page.waitForTimeout(500);

    // P3: Edad (+18) -> Tocar "Sí"
    await page.click('button:has-text("Sí")');
    await page.waitForTimeout(500);

    // P4: Rango -> Tocar "35 a 44 años"
    await page.click('button:has-text("35 a 44")');
    await page.waitForTimeout(500);

    // P5: Trabajo -> Tocar "Trabajo por mi cuenta"
    await page.click('button:has-text("Trabajo por mi cuenta")');
    await page.waitForTimeout(500);

    // P6: Estudios -> Tocar "Primaria completa"
    await page.click('button:has-text("Primaria")');
    await page.waitForTimeout(500);

    // P7: Residencia
    console.log('Capturando P7...');
    await page.screenshot({ path: path.join(CAPTURAS_DIR, 'P7_residencia.png') });

    // Seleccionar Curundú -> P8 (Práctica)
    await page.click('button:has-text("Curundú")');
    await page.waitForTimeout(500);

    // P8: Saltar práctica ("Ya sé jugar")
    await page.click('button:has-text("Ya sé jugar")');
    await page.waitForTimeout(600);

    // P9: Reto 1
    console.log('Capturando P9...');
    await page.screenshot({ path: path.join(CAPTURAS_DIR, 'P9_reto1.png') });

    // Completar Reto 1 ítem 1
    const optButtons1 = await page.$$('main .grid button');
    if (optButtons1.length > 0) await optButtons1[0].click();
    await page.waitForTimeout(700);

    // Reto 1 ítem 2
    const optButtons2 = await page.$$('main .grid button');
    if (optButtons2.length > 0) await optButtons2[0].click();
    await page.waitForTimeout(700);

    // Reto 2 ítem 1
    const optButtonsR2_1 = await page.$$('main .grid button');
    if (optButtonsR2_1.length > 0) await optButtonsR2_1[0].click();
    await page.waitForTimeout(700);

    // Reto 2 ítem 2
    const optButtonsR2_2 = await page.$$('main .grid button');
    if (optButtonsR2_2.length > 0) await optButtonsR2_2[0].click();
    await page.waitForTimeout(2500); // esperar transición P11

    // Reto 3 ítem 1
    const optButtonsR3_1 = await page.$$('main .grid button');
    if (optButtonsR3_1.length > 0) await optButtonsR3_1[0].click();
    await page.waitForTimeout(700);

    // Reto 3 ítem 2
    const optButtonsR3_2 = await page.$$('main .grid button');
    if (optButtonsR3_2.length > 0) await optButtonsR3_2[0].click();
    await page.waitForTimeout(700);

    // P13: Reto 4
    console.log('Capturando P13...');
    await page.screenshot({ path: path.join(CAPTURAS_DIR, 'P13_reto4.png') });

    // Responder las 3 tarjetas de Reto 4
    await page.click('button:has-text("Seguro")');
    await page.waitForTimeout(700);
    await page.click('button:has-text("Riesgo")');
    await page.waitForTimeout(700);
    await page.click('button:has-text("Seguro")');
    await page.waitForTimeout(1000);

    // P14: Celebración
    console.log('Capturando P14...');
    await page.screenshot({ path: path.join(CAPTURAS_DIR, 'P14_celebracion.png') });

    // Continuar a P15 (Satisfacción)
    await page.click('button:has-text("Continuar")');
    await page.waitForTimeout(600);

    // Tocar carita ¡Mucho! -> P16
    await page.click('button:has-text("¡Mucho!")');
    await page.waitForTimeout(2500); // esperar preparación de premio (1.5s)

    // P16: Premio
    console.log('Capturando P16...');
    await page.screenshot({ path: path.join(CAPTURAS_DIR, 'P16_premio.png') });

    // Panel de Datos (/datos)
    console.log('Capturando Panel de Datos...');
    await page.goto('http://localhost:4173/?view=datos');
    await page.waitForTimeout(500);

    // Introducir PIN 2026
    await page.fill('input[type="password"]', '2026');
    await page.click('button:has-text("Acceder")');
    await page.waitForTimeout(800);

    // Generar 50 de prueba para que el panel se vea completo con gráficos
    await page.click('button:has-text("Generar 50 de prueba")');
    await page.waitForTimeout(1000);

    await page.screenshot({ path: path.join(CAPTURAS_DIR, 'datos_panel.png') });
    console.log('¡Todas las capturas generadas con éxito en capturas/!');
  } catch (err) {
    console.error('Error durante la captura:', err);
  } finally {
    await browser.close();
    viteProcess.kill();
  }
}

run();
