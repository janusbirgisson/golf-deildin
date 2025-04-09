# Golfdeildin

Stigakerfi fyrir golfdeild með React framenda og Node.js bakenda.

## Uppsetning og keyrsla

### Forsendur
- Node.js
- Docker
- PostgreSQL
- npm

### Keyrsla á þróunarumhverfi

1. Stöðva PostgreSQL ef það er í gangi:
```bash
pg_ctl -D /usr/local/var/postgres stop
```

2. Ræsa gagnagrunn með Docker:
```bash
docker-compose down
docker-compose up -d
```

3. Ræsa bakenda:
```bash
cd backend
npm install
npm start
```

4. Ræsa framenda (í nýjum terminal glugga):
```bash
cd frontend
npm install
npm start
```

Vefsíðan opnast sjálfkrafa á [http://localhost:4001](http://localhost:4001)

## Aðgerðir

### Framendi (`npm` skipanir)

- `npm start`: Keyrir forritið í þróunarham (development mode) á porti 4001
- `npm test`: Keyrir prófanir með Jest
- `npm run build`: Byggir forritið fyrir framleiðslu

### Helstu eiginleikar

- Notendaskráning og innskráning
- Skráning á golfskori
- Viku- og heildarstigatafla
- Vikuleg stigagjöf
- Tölfræði fyrir hvern golfara

## Teck Stack

- Framendi:
  - React 18
  - Tailwind CSS
  - Jest fyrir prófanir

- Bakendi:
  - Node.js
  - Express
  - PostgreSQL

## Uppsetning fyrir framleiðslu

1. Byggja framenda:
```bash
cd frontend
npm run build
```

2. Byggja bakenda:
```bash
cd backend
npm run build
```

## Gagnagrunnstenging

Forritið notar PostgreSQL gagnagrunn sem keyrir í Docker container. Gagnagrunnstengingin er skilgreind í `docker-compose.yml` skránni.

---

Verkefnið var búið til með [Create React App](https://github.com/facebook/create-react-app).