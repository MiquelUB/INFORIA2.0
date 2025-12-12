"""
Test Utilities - Screenshots y Logging
Proporciona funciones auxiliares para tests E2E
"""

import asyncio
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional
from playwright.async_api import Page, Browser, BrowserContext
from config import config

# Configurar logging
logging.basicConfig(
    level=getattr(logging, config.LOG_LEVEL.upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(config.LOG_FILE),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

async def take_screenshot(
    page: Page,
    name: str,
    full_page: bool = False
) -> Optional[str]:
    """
    Captura una screenshot del estado actual
    
    Args:
        page: Página de Playwright
        name: Nombre descriptivo de la screenshot
        full_page: Si True, captura la página completa
    
    Returns:
        Ruta del archivo guardado o None si está deshabilitado
    """
    if not config.ENABLE_SCREENSHOTS:
        return None
    
    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_name = "".join(c if c.isalnum() or c in "-_" else "_" for c in name)
        filename = f"{timestamp}_{safe_name}.png"
        filepath = Path(config.SCREENSHOT_DIR) / filename
        
        await page.screenshot(path=str(filepath), full_page=full_page)
        logger.info(f"✓ Screenshot guardada: {filepath}")
        return str(filepath)
    except Exception as e:
        logger.error(f"✗ Error capturando screenshot: {e}")
        return None

async def take_screenshot_on_error(page: Page, test_name: str, error: Exception):
    """Captura screenshot automática cuando ocurre un error"""
    await take_screenshot(page, f"ERROR_{test_name}", full_page=True)
    logger.error(f"Error en {test_name}: {error}")

class HTTPResponseValidator:
    """Valida respuestas HTTP en tests"""
    
    @staticmethod
    async def validate_status(page: Page, expected_status: int) -> bool:
        """Valida que el último status HTTP sea el esperado"""
        try:
            # Esperar a que la página se cargue completamente
            await page.wait_for_load_state("networkidle", timeout=config.NETWORK_IDLE_TIMEOUT)
            logger.info(f"✓ Status HTTP validado: {page.url}")
            return True
        except Exception as e:
            logger.error(f"✗ Error validando status: {e}")
            return False
    
    @staticmethod
    async def validate_api_response(
        page: Page,
        endpoint: str,
        expected_status: int = 200
    ) -> bool:
        """Valida respuesta de un endpoint API"""
        try:
            async def handle_response(response):
                if endpoint in response.url:
                    logger.info(f"API Response {endpoint}: {response.status}")
                    return response.status == expected_status
            
            page.on("response", handle_response)
            return True
        except Exception as e:
            logger.error(f"✗ Error validando API response: {e}")
            return False

class TestTimer:
    """Mide tiempos de ejecución de tests"""
    
    def __init__(self, test_name: str):
        self.test_name = test_name
        self.start_time = None
        self.end_time = None
    
    async def __aenter__(self):
        self.start_time = datetime.now()
        logger.info(f"⏱️  Iniciando test: {self.test_name}")
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        self.end_time = datetime.now()
        duration = (self.end_time - self.start_time).total_seconds()
        
        if exc_type:
            logger.error(f"❌ Test FALLIDO: {self.test_name} ({duration:.2f}s)")
        else:
            logger.info(f"✅ Test PASADO: {self.test_name} ({duration:.2f}s)")

def get_browser_launch_args(debug: bool = False) -> dict:
    """Retorna argumentos estándar para lanzar navegador"""
    return {
        'headless': config.HEADLESS,
        'slow_mo': config.SLOW_MO,
        'args': [
            f"--window-size={config.VIEWPORT_WIDTH},{config.VIEWPORT_HEIGHT}",
            "--disable-dev-shm-usage",
            "--ipc=host",
            "--single-process" if not debug else "",
        ] if not debug else [],
    }

def get_context_options() -> dict:
    """Retorna opciones estándar para contextos de Playwright"""
    options = {
        'viewport': {
            'width': config.VIEWPORT_WIDTH,
            'height': config.VIEWPORT_HEIGHT
        },
        'ignore_https_errors': True,
        'record_video_dir': config.VIDEO_DIR if config.ENABLE_VIDEO else None,
        'record_har_path': Path(config.LOG_FILE).parent / "network.har" if config.ENABLE_SCREENSHOTS else None,
    }
    # Limpiar opciones None
    return {k: v for k, v in options.items() if v is not None}
