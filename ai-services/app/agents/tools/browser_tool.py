from playwright.async_api import (
    async_playwright
)

async def browser_tool(
    url: str
):

    async with async_playwright() as p:

        browser = (
            await p.chromium.launch(
                headless=True
            )
        )

        page = await browser.new_page()

        await page.goto(url)

        title = await page.title()

        content = await page.content()

        await browser.close()

        return {
            "title": title,
            "content": content[:3000]
        }