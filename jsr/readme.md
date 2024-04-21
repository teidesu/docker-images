simple docker image to run [jsr](https://github.com/jsr-io/jsr)

npm compatibility is not supported in the `docker-compose.yaml`, as it relies on gcs storage.
which is added complexity and i personally don't need it (feel free to customize or make a pr)

## initializing db for headless use

```bash
docker compose exec db psql registry -U user -c "insert into tokens (hash, user_id, type, expires_at) values ('3c469e9d6c5875d37a43f353d4f88e61fcf812c66eee3457465a40b0da4153e0', '00000000-0000-0000-0000-000000000000', 'web', current_date + interval '100' year);"
docker compose exec db psql registry -U user -c "update users set is_staff = true, scope_limit = 99999 where id = '00000000-0000-0000-0000-000000000000';"
```

- `3c469e9d6c5875d37a43f353d4f88e61fcf812c66eee3457465a40b0da4153e0` is `sha256("token")`, where `token` is the token you can use to authenticate with the registry
  - **tip**: you can set is a a value for `token` cookie in the browser to use the frontend and any of its apis
- `00000000-0000-0000-0000-000000000000` is an id of a mock user, created by the jsr itself.