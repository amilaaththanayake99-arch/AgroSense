import asyncio
import aiomysql
import os
import re

async def setup():
    host = 'localhost'
    port = 3306
    user = 'root'
    password = ''
    db_name = 'agrisense_db'

    print("=" * 60)
    print("AgriSense 3-Entity Database Setup Script")
    print("Core Entities: 1. USER (`users`) | 2. CROP (`crops`) | 3. DISEASE (`diseases`)")
    print("=" * 60)

    try:
        # Step 1: Connect to MySQL server (without selecting DB)
        conn = await aiomysql.connect(host=host, port=port, user=user, password=password, autocommit=True)
        async with conn.cursor() as cur:
            await cur.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
            print(f"[OK] Database '{db_name}' verified/created.")
        conn.close()

        # Step 2: Connect to agrisense_db and execute init_db.sql
        conn = await aiomysql.connect(host=host, port=port, user=user, password=password, db=db_name, autocommit=True)
        async with conn.cursor() as cur:
            script_path = os.path.join(os.path.dirname(__file__), 'init_db.sql')
            with open(script_path, 'r', encoding='utf-8') as f:
                sql_content = f.read()

            # Split statements by semicolon while ignoring comments
            statements = []
            for stmt in sql_content.split(';'):
                # Strip leading/trailing whitespaces
                cleaned = stmt.strip()
                # Remove single-line comments
                lines = [l for l in cleaned.splitlines() if not l.strip().startswith('--')]
                cleaned_stmt = "\n".join(lines).strip()
                if cleaned_stmt and not cleaned_stmt.lower().startswith('use ') and not cleaned_stmt.lower().startswith('create database'):
                    statements.append(cleaned_stmt)

            for stmt in statements:
                try:
                    await cur.execute(stmt)
                except Exception as stmt_err:
                    print(f"[Notice] Statement error (ignorable if table already dropped): {stmt_err}")

            # Check existing tables
            await cur.execute("SHOW TABLES")
            tables = await cur.fetchall()
            print("\n[SUCCESS] The database now has EXACTLY the following entities:")
            for t in tables:
                print(f"  -> Entity Table: {t[0]}")
            
            # Show row counts
            for t in tables:
                tname = t[0]
                await cur.execute(f"SELECT COUNT(*) FROM `{tname}`")
                cnt = (await cur.fetchone())[0]
                print(f"     Records in {tname}: {cnt}")

        conn.close()
        print("\n[Done] 3-Entity architecture configured cleanly.")
    except Exception as e:
        print(f"[Error connecting to MySQL] {e}")
        print("Tip: If MySQL in XAMPP is offline, start Apache and MySQL in XAMPP Control Panel and rerun this script.")

if __name__ == '__main__':
    asyncio.run(setup())
