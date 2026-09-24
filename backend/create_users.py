import asyncio
import aiomysql

async def create_table():
    pool = await aiomysql.create_pool(host='localhost', port=3306, user='root', password='', db='agrisense_db')
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY, 
                    name VARCHAR(255) NOT NULL, 
                    email VARCHAR(255) NOT NULL UNIQUE, 
                    phone VARCHAR(50), 
                    password_hash VARCHAR(255) NOT NULL, 
                    role VARCHAR(50) DEFAULT 'farmer',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            await conn.commit()
            print('Users table created')
    pool.close()
    await pool.wait_closed()

if __name__ == '__main__':
    asyncio.run(create_table())
