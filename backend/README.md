# Backend

Start the backend with `docker compose up -d db prestart backend`.

**Clean database & init models**

```shell
docker compose down && rm -rf backend/app/alembic/versions/* && docker volume rm coord-buffer_app-db-data
docker compose up -d db
[backend]$ alembic revision --autogenerate -m "Init table" && alembic upgrade head && docker compose restart db && docker compose up -d backend --build
```
