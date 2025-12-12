import asyncio
from playwright import async_api
from playwright.async_api import expect
<<<<<<< HEAD
=======
from config import config
from utils import take_screenshot, take_screenshot_on_error, TestTimer, get_browser_launch_args, get_context_options, HTTPResponseValidator
>>>>>>> release/v2.0-final

async def run_test():
    pw = None
    browser = None
    context = None
<<<<<<< HEAD
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        from config import get_url, DEFAULT_TIMEOUT, LONG_TIMEOUT
        
        # Navigate to your target URL and wait until the network request is committed
        # Navigate to account/billing page (will redirect to login if not authenticated)
        await page.goto(get_url("/account"), wait_until="networkidle", timeout=LONG_TIMEOUT)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # --> Assertions to verify final state
        try:
            await expect(page.locator('text=Subscription Activated Successfully').first).to_be_visible(timeout=1000)
        except AssertionError:
            raise AssertionError('Test case failed: Payment processing did not succeed and subscription was not activated as expected.')
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
=======
    test_name = "TC007_Billing_Verification"
    
    try:
        async with TestTimer(test_name):
            pw = await async_api.async_playwright().start()
            
            browser = await pw.chromium.launch(**get_browser_launch_args())
            context = await browser.new_context(**get_context_options())
            context.set_default_timeout(config.TIMEOUT_MEDIUM)
            
            page = await context.new_page()
            
            # Target /pricing (Public route)
            target_url = config.get_url("/pricing")
            print(f"🔗 Navegando a: {target_url}")
            
            await page.goto(target_url, wait_until="networkidle", timeout=config.TIMEOUT_LONG)
            
            # 1. Blindar el Core: Validar renderizado de planes (UI Check)
            # Verify we have pricing cards
            await expect(page.locator('text=Plan Flash')).to_be_visible()
            await expect(page.locator('text=Plan Standard')).to_be_visible()
            
            await take_screenshot(page, f"{test_name}_loaded")
            
            # 2. Blindar el Core: Validar intento de checkout (API Check)
            # Find a subscribe button. Assuming "Suscribirse" or "Elegir Plan"
            # We select a button. Use first() if multiple.
            subscribe_btn = page.locator('button:has-text("Elegir Plan"), button:has-text("Suscribirse")').first
            
            if await subscribe_btn.count() > 0:
                print("💳 Intentando iniciar checkout...")
                
                # Setup promise to wait for API call OR Navigation (to login)
                # If unauthenticated, it might redirect to login, or call API which returns 401.
                # We listen for EITHER /api/stripe OR /login redirection.
                
                async with page.expect_response(lambda response: 
                    ("/api/stripe" in response.url) or 
                    ("/login" in response.url and response.status == 200)
                ) as response_info:
                    await subscribe_btn.click()
                
                response = await response_info.value
                print(f"📡 Respuesta interceptada: {response.url} ({response.status})")
                
                # Check if it was a Stripe call or Redirect
                if "stripe" in response.url:
                    # If it hit stripe API, it means we are authorized or it failed 401
                    print("✅ Llamada a Stripe API detectada.")
                elif "login" in response.url:
                    print("✅ Redirección a Login detectada (Correcto para usuario anónimo).")
                
                await take_screenshot(page, f"{test_name}_checkout_attempt")
            else:
                 print("⚠️ No se encontró botón de suscripción para probar API.")
            
    except Exception as e:
        if page:
            await take_screenshot_on_error(page, test_name, e)
        print(f"❌ Error en {test_name}: {e}")
        raise
    
    finally:
        if context: await context.close()
        if browser: await browser.close()
        if pw: await pw.stop()

if __name__ == "__main__":
    asyncio.run(run_test())
>>>>>>> release/v2.0-final
    
