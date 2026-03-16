import asyncio
from playwright.async_api import async_playwright, expect

async def run_test():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )
        context = await browser.new_context()
        context.set_default_timeout(10000)
        page = await context.new_page()

        try:
            # Login
            print("Navegando al login...")
            await page.goto("http://localhost:3000/login")
            await page.fill('input[type="email"]', 'soporte@yopmail.com')
            await page.fill('input[type="password"]', 'SoporteCamacho2025*')
            await page.click('button[type="submit"]')
            await page.wait_for_url("**/dashboard")
            print("Login exitoso.")

            # Test Perfil
            print("Clic en Menú de Usuario (Avatar)...")
            await page.click("text=Administrador")
            print("Clic en Perfil...")
            await page.click("text=Perfil")
            await page.wait_for_url("**/dashboard/perfil")
            await expect(page.locator("text=Perfil de Usuario").first).to_be_visible()
            print("✓ Navegación a Perfil funcional")

            # Test Usuarios
            print("Clic en Usuarios en Sidebar...")
            await page.click("text=Usuarios")
            await page.wait_for_url("**/dashboard/usuarios")
            await expect(page.locator("text=Gestión de Usuarios").first).to_be_visible()
            print("✓ Navegación a Usuarios funcional")

            # Test Configuración
            print("Clic en Configuración en Sidebar...")
            await page.click("text=Configuración")
            await page.wait_for_url("**/dashboard/config")
            await expect(page.locator("text=Configuración del Sistema").first).to_be_visible()
            print("✓ Navegación a Configuración funcional")

            print("¡Todas las navegaciones E2E de TestSprite exitosas!")

        except Exception as e:
            print(f"Error en la prueba: {e}")
            raise e
        finally:
            await context.close()
            await browser.close()

asyncio.run(run_test())
