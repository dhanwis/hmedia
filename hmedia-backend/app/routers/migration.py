from fastapi import APIRouter
from run_migrations import run_migrations

router = APIRouter(prefix="/migrate", tags=["migrate"])

@router.get("/")
def run_migrations_endpoint():
    run_migrations()
    return {"status": "migrations applied"}