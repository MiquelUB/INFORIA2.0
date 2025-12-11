"""
EJEMPLO: Test Parametrizado con Mejoras
Demuestra cómo usar config y utils en tests modernizados
"""

import asyncio
from playwright import async_api
from playwright.async_api import expect
from config import config
from utils import take_screenshot, take_screenshot_on_error, TestTimer, HTTPResponseValidator

async def improved_login_test():
    """
    Test mejorado con:
    - URLs parametrizadas desde .env.test
    - Screenshots automáticas en errores
    - Validación de status HTTP
    - Logging detallado
    - Manejo robusto de excepciones
    """
    pw = None
    browser = None
    context = None
    
    try:
        async with TestTimer("TC001_Improved_Login"):
            # ✅ MEJORA 1: Usar URLs desde config en lugar de hardcodeadas
            pw = await async_api.async_playwright().start()
            
            # ✅ MEJORA 2: Usar opciones estandarizadas
            browser = await pw.chromium.launch(
                headless=config.HEADLESS,
                slow_mo=config.SLOW_MO,
                args=[
                    f"--window-size={config.VIEWPORT_WIDTH},{config.VIEWPORT_HEIGHT}",
                    "--disable-dev-shm-usage",
                    "--ipc=host",
                    "--single-process"
                ],
            )
            
            context = await browser.new_context(
                viewport={
                    'width': config.VIEWPORT_WIDTH,
                    'height': config.VIEWPORT_HEIGHT
                },
                record_video_dir=config.VIDEO_DIR if config.ENABLE_VIDEO else None,
            )
            
            # ✅ MEJORA 3: Usar timeouts desde config
            context.set_default_timeout(config.TIMEOUT_MEDIUM)
            page = await context.new_page()
            
            try:
                # ✅ MEJORA 4: URL parametrizada
                login_url = config.get_url("/login")
                print(f"🔗 Navegando a: {login_url}")
                
                await page.goto(login_url, wait_until="networkidle", timeout=config.TIMEOUT_LONG)
                
                # ✅ MEJORA 5: Validar estado HTTP
                await HTTPResponseValidator.validate_status(page, 200)
                
                # ✅ MEJORA 6: Screenshot después de carga exitosa
                await take_screenshot(page, "login_page_loaded")
                
                # Verificar elementos de login
                await expect(page.locator('input[type="email"]')).to_be_visible(timeout=config.TIMEOUT_MEDIUM)
                await expect(page.locator('input[type="password"]')).to_be_visible(timeout=config.TIMEOUT_MEDIUM)
                await expect(page.locator('button[type="submit"]')).to_be_visible(timeout=config.TIMEOUT_MEDIUM)
                
                # ✅ MEJORA 7: Screenshot antes de acción
                await take_screenshot(page, "login_form_visible")
                
                print("✅ Test TC001 - Mejorado: PASADO")
                
            except Exception as e:
                # ✅ MEJORA 8: Screenshot automática en error + logging
                await take_screenshot_on_error(page, "TC001_Improved_Login", e)
                raise
            
            finally:
                await context.close()
                await browser.close()
                await pw.stop()
    
    except Exception as e:
        print(f"❌ Error en test: {e}")
        raise

# Ejemplo de ejecución
if __name__ == "__main__":
    print("📋 Ejecutando test parametrizado mejorado...")
    print(f"📝 Configuración cargada:\n{config}")
    asyncio.run(improved_login_test())
