import asyncio
from playwright import async_api
from playwright.async_api import expect
<<<<<<< HEAD
=======
from config import config
from utils import take_screenshot, take_screenshot_on_error, TestTimer, get_browser_launch_args, get_context_options
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
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Verify login page elements are present (DO NOT attempt to create accounts)
        try:
            # Check for login form title
            await expect(page.locator('text=¡Bienvenido!')).to_be_visible(timeout=5000)
            # Check for Google login button
            await expect(page.locator('text=Iniciar Sesión con Google')).to_be_visible(timeout=5000)
        except AssertionError as e:
            raise AssertionError(f'Test case failed: Login page elements not found. Error: {str(e)}')
        
        # Note: DO NOT attempt to create new user accounts
        await asyncio.sleep(2)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
=======
    test_name = "TC001_Auth_Page_Load"
    
    try:
        async with TestTimer(test_name):
            pw = await async_api.async_playwright().start()
            
            # Use standarized launch args
            browser = await pw.chromium.launch(**get_browser_launch_args())
            
            context = await browser.new_context(**get_context_options())
            context.set_default_timeout(config.TIMEOUT_MEDIUM)
            
            page = await context.new_page()
            
            # URLs
            login_url = config.get_url("/login")
            print(f"🔗 Navegando a: {login_url}")
            
            # Navigate and wait for network idle to ensure assets are loaded
            await page.goto(login_url, wait_until="networkidle", timeout=config.TIMEOUT_LONG)
            
            # 1. Validate generic API or asset response to ensure backend is alive
            # Since we are not logging in (no credentials safely available in this context),
            # we verify the page loaded successfully (Status 200 is checked implicitly by goto if it didn't throw)
            # We can verify Next.js specific resources
            
            # 2. Strict UI Assertions ("Blindar el Core")
            # Verify specific Neumorphic elements if possible, or at least standard elements
            await expect(page.locator('h1, h2, h3').filter(has_text="Bienvenido")).to_be_visible()
            
            # Verify auth buttons
            google_btn = page.locator('button', has_text="Google")
            await expect(google_btn).to_be_visible()
            # Verify it's not disabled initially
            await expect(google_btn).to_be_enabled()
            
            await take_screenshot(page, f"{test_name}_success")
            print(f"✅ {test_name}: Validación visual completada")
            
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
    