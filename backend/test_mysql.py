import asyncio
import aiomysql

async def test():
    try:
        pool = await aiomysql.create_pool(host='localhost', port=3306, user='root', password='', db='agrisense_db')
        print('Success!')
        pool.close()
        await pool.wait_closed()
    except Exception as e:
        print(f"Error: {e}")

asyncio.run(test())
