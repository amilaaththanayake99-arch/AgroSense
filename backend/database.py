# ==============================================================================
# AGRISENSE DATABASE CONNECTION & ASYNCHRONOUS POOL MANAGEMENT
# Handles MySQL connections using aiomysql with automatic non-blocking resilient fallback
# ==============================================================================

import aiomysql
import asyncio
from contextlib import asynccontextmanager
from config import settings

# Global reference to the connection pool
pool = None

async def init_db_pool():
    """
    Initializes the asynchronous MySQL connection pool.
    Connects to MySQL (e.g. XAMPP default localhost:3306) using settings from config.py.
    If MySQL is offline, catches the timeout/exception and gracefully enters 'Resilient Mode',
    allowing the web application to function without crashing.
    """
    global pool
    try:
        pool = await asyncio.wait_for(
            aiomysql.create_pool(
                host=settings.DB_HOST,
                port=settings.DB_PORT,
                user=settings.DB_USER,
                password=settings.DB_PASSWORD,
                db=settings.DB_NAME,
                autocommit=True,       # Automatically commits transactions
                connect_timeout=3      # Connection attempt timeout in seconds
            ),
            timeout=5.0
        )
        print("[AgriSense] MySQL connection pool initialized successfully!")
    except Exception as e:
        pool = None
        print(f"[AgriSense Notice] MySQL is not active on {settings.DB_HOST}:{settings.DB_PORT}. Starting in resilient mode.")
        print("[AgriSense Tip] Start MySQL in your XAMPP Control Panel to enable database persistence.")

async def close_db_pool():
    """Gracefully closes all open connections in the pool during server shutdown."""
    global pool
    if pool:
        try:
            pool.close()
            await pool.wait_closed()
        except Exception:
            pass

@asynccontextmanager
async def get_db_connection():
    """
    Asynchronous context manager to acquire a single connection from the pool.
    Yields None if the pool is unavailable (resilient fallback).
    Usage:
        async with get_db_connection() as conn:
            if conn:
                ...
    """
    global pool
    if pool is None:
        yield None
        return
    try:
        async with pool.acquire() as conn:
            yield conn
    except Exception:
        yield None

def get_db_pool():
    """FastAPI dependency injection helper to provide the database pool to router endpoints."""
    global pool
    return pool
