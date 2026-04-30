# server/pb_hooks/

## Responsibility
Runtime hooks directory (identical copy of `server/hooks/`). Exists as a convenience for local development where the directory can be bind-mounted to `/pb_hooks` without building a custom Docker image. In production, the authoritative `server/hooks/` directory is baked into the Docker image by `Dockerfile.pocketbase`.

## Files
- **main.pb.js** — Identical content to `server/hooks/main.pb.js`. Contains `onRecordCreateRequest` and `onRecordUpdateRequest` handlers for all 6 data collections (`bible_notes`, `small_group_notes`, `sermons`, `reading_plans`, `reading_plan_progress`, `revelations`).

## Design
Same as `server/hooks/`. Each handler enforces:
- **On create**: `user_id` is set from the authenticated user's ID (`e.auth.id`), preventing client-side spoofing.
- **On update**: `user_id` is locked to its existing value, preventing ownership transfer.

## Why two copies?
- `server/hooks/` is the **source of truth** — baked into the production Docker image.
- `server/pb_hooks/` is a **working copy** for local `docker compose` development, where bind-mount is acceptable and avoids needing to rebuild the image on every hook change.

**Keep them in sync.** Any change to `server/hooks/main.pb.js` should be mirrored to `server/pb_hooks/main.pb.js`.

## Integration
- **Local dev**: `docker-compose.yml` bind-mounts `./server/pb_hooks:/pb_hooks` so changes are live-reloaded by PocketBase.
- **Production**: `Dockerfile.pocketbase` does `COPY ./hooks /pb_hooks`, bypassing this directory entirely.
