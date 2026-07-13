# Posts JSON CRUD Server

Small TypeScript Node.js API for basic CRUD operations on posts. Data is stored
in JSON files under the `data` folder.

## Setup

Install dependencies before building from TypeScript:

```bash
npm install
```

Build TypeScript:

```bash
npm run build
```

## Run

```bash
npm start
```

The server runs at `http://localhost:3000` by default.

CORS is allowed only for browser origins whose hostname is exactly `localhost`,
for example `http://localhost:5173`.

Responses are delayed by `1000` ms so frontend loading states are easy to test.
Change `RESPONSE_DELAY_MS` near the top of `server.js`, or override it when starting:

```bash
RESPONSE_DELAY_MS=2000 npm start
```

PowerShell:

```powershell
$env:RESPONSE_DELAY_MS = "2000"
npm start
```

Errors are written to the `log` folder. The server uses the current date as the
filename, for example `log/2026-07-07.log`, and appends new errors to the same
file if it already exists.

## Endpoints

| Method   | Path          | Description                     |
| -------- | ------------- | ------------------------------- |
| `GET`    | `/posts`      | List all posts                  |
| `GET`    | `/posts/:id`  | Get one post                    |
| `POST`   | `/posts`      | Create a post                   |
| `PUT`    | `/posts/:id`  | Replace a post                  |
| `PATCH`  | `/posts/:id`  | Partially update a post         |
| `DELETE` | `/posts/:id`  | Delete a post                   |
| `GET`    | `/json/:path` | Read any JSON file under `data` |

## Dynamic JSON endpoint

Use `/json/:path` to fetch different JSON files from the `data` folder. The
`.json` extension is optional.

Examples:

```bash
curl http://localhost:3000/json/posts
curl http://localhost:3000/json/users
curl http://localhost:3000/json/comments.json
curl http://localhost:3000/json/examples/items
```

The path is restricted to the `data` folder, so paths like `../package.json`
are rejected.

## Example requests

Create:

```bash
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"New post\",\"body\":\"Post body\"}"
```

Update:

```bash
curl -X PATCH http://localhost:3000/posts/1 \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Updated title\"}"
```

Delete:

```bash
curl -X DELETE http://localhost:3000/posts/1
```
