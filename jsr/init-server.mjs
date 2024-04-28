import { execSync } from 'node:child_process'

function getDockerContainerIp(name) {
    const containerId = execSync(`docker compose ps -q ${name}`).toString().trim()
    const ip = execSync(`docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' ${containerId}`)
        .toString()
        .trim()

    return ip
}

for (const stmt of [
    // clean up
    "delete from tokens where user_id = '00000000-0000-0000-0000-000000000000';",
    // insert a token for the "mock user". "3c469e9d6c5875d37a43f353d4f88e61fcf812c66eee3457465a40b0da4153e0" = sha256('token')
    "insert into tokens (hash, user_id, type, expires_at) values ('3c469e9d6c5875d37a43f353d4f88e61fcf812c66eee3457465a40b0da4153e0', '00000000-0000-0000-0000-000000000000', 'web', current_date + interval '100' year);",
    // elevate the "mock user" to staff
    "update users set is_staff = true, scope_limit = 99999 where id = '00000000-0000-0000-0000-000000000000';",
]) {
    execSync(`docker compose exec db psql registry -U user -c "${stmt}"`)
}

console.log('[i] Initialized database')

const GCS_URL = `http://${getDockerContainerIp('gcs')}:4080/`
const API_URL = `http://${getDockerContainerIp('api')}:8001/`

async function createBucket(name) {
    try {
        const resp = await fetch(`${GCS_URL}storage/v1/b`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        })

        await resp.text()

        return resp.ok || resp.status === 409
    } catch (e) {
        console.log(e)

        return false
    }
}

for (const bucket of ['modules', 'docs', 'publishing', 'npm']) {
    const ok = await createBucket(bucket)
    console.log(`[i] Created bucket ${bucket}: ${ok}`)
}
