import httpx
import asyncio

async def test():
    async with httpx.AsyncClient() as client:
        # First request
        r1 = await client.get('https://duckduckgo.com/country.json', 
                              headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})
        print('Country request status:', r1.status_code)
        
        # Second request to get token
        r2 = await client.get('https://duckduckgo.com/duckchat/v1/status', 
                              headers={
                                  'x-vqd-accept': '1', 
                                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                              })
        print('Status request:', r2.status_code)
        print('x-vqd-4 token:', r2.headers.get('x-vqd-4', 'NOT FOUND'))
        print('All headers:', dict(r2.headers))

asyncio.run(test())
