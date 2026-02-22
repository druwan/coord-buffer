# Coord Buffer - Frontend

## Quick Start

```bash
bun install
bun run dev
```

## Generate Client

### Automatically

- Activate the backend virtual environment.
- From the top level project directory, run the script:

```bash
bash ./scripts/generate-client.sh
```

- Commit the changes.

### Manually

- Start the Docker Compose stack.

- Download the OpenAPI JSON file from `http://localhost/api/v1/openapi.json` and copy it to a new file `openapi.json` at the root of the `frontend` directory.

- To generate the frontend client, run:

```bash
bun run generate-client
```

- Commit the changes.

## Code Structure

The frontend code is structured as follows:

- `frontend/src` - The main frontend code.
- `frontend/src/assets` - Static assets.
- `frontend/src/client` - The generated OpenAPI client.
- `frontend/src/components` - The different components of the frontend.
- `frontend/src/hooks` - Custom hooks.
- `frontend/src/routes` - The different routes of the frontend which include the pages.
