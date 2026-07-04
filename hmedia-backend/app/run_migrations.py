# from alembic import command
# from alembic.config import Config

# def run_migrations():
#     alembic_cfg = Config("alembic.ini")  # your Alembic settings
#     command.upgrade(alembic_cfg, "head")  # apply all migrations

# if __name__ == "__main__":


# from alembic import command
# from alembic.config import Config
# import os

# def run_migrations():
#     alembic_cfg = Config("alembic.ini")
#     alembic_cfg.set_main_option(
#         "script_location",
#         os.path.join(os.getcwd(), "alembic")
#     )

#     # 🔥 PURGE broken alembic_version and stamp fresh
#     command.stamp(alembic_cfg, "head", purge=True)

# if __name__ == "__main__":
#     run_migrations()


from alembic import command
from alembic.config import Config
import os

def run_migrations():
    alembic_cfg = Config("alembic.ini")
    alembic_cfg.set_main_option(
        "script_location",
        os.path.join(os.getcwd(), "alembic")
    )

    # Apply all pending migrations
    command.upgrade(alembic_cfg, "head")

if __name__ == "__main__":
    run_migrations()
