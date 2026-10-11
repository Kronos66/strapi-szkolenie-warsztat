# Ćwiczenie 04 — Plugin: Activity Log

## Cel

Zbuduj lokalny plugin `activity-log` w TypeScripcie, który:
- Loguje operacje `create`, `update`, `delete`, `publish` na artykułach
- Przechowuje logi w dedykowanej kolekcji `activity-log`
- Wyświetla ostatnie logi na stronie w panelu administracyjnym

## Jak działa lokalny plugin w TypeScripcie

Projekt Strapi **nie kompiluje** katalogu `src/plugins/` (jest wykluczony w `tsconfig.json`).
Plugin to osobny pakiet z własnym `package.json` — budujesz go sam, a Strapi ładuje gotowy kod z `dist/`:

```
src/plugins/activity-log/
├── package.json        ← exports: ./strapi-server → dist/server, ./strapi-admin → dist/admin
├── server/src/         ← kod serwera (TS)
├── admin/src/          ← admin UI (React + TS)
└── dist/               ← wynik `npm run build` — to ładuje Strapi
```

## Struktura pluginu

```
src/plugins/activity-log/
├── server/src/
│   ├── index.ts                         ← punkt wejścia serwera
│   ├── register.ts                      ← Document Service middleware
│   ├── content-types/
│   │   ├── index.ts
│   │   └── activity-log/schema.json     ← definicja kolekcji logów
│   ├── services/activity-log.ts         ← log() i getRecent()
│   ├── controllers/activity-log.ts      ← getLogs()
│   └── routes/admin/index.ts            ← route admina GET /activity-log/logs
└── admin/src/
    ├── index.ts                         ← rejestracja w menu admina
    └── pages/HomePage.tsx               ← strona z tabelą logów
```

## Kroki

### Krok 1 — Wygeneruj plugin

```bash
cd starter
npx @strapi/sdk-plugin@latest init src/plugins/activity-log
```

Kreator zapyta m.in. o TypeScript (`tak`) oraz czy plugin ma część admin i server (`tak` dla obu).
Usuń przykładowy kontroler, serwis i route `content-api` — zastąpisz je własnymi.

> W `package.json` pluginu skrypty `test:ts:front` / `test:ts:back` uruchamiają `tsc` bez `--noEmit`
> i zostawiają pliki `.js` obok `.ts`, co psuje build. Dopisz `--noEmit` albo ich nie uruchamiaj.

### Krok 2 — Content Type: activity-log

Utwórz `server/src/content-types/activity-log/schema.json`:

```json
{
  "kind": "collectionType",
  "collectionName": "activity_logs",
  "info": {
    "singularName": "activity-log",
    "pluralName": "activity-logs",
    "displayName": "Activity Log"
  },
  "options": { "draftAndPublish": false },
  "pluginOptions": {
    "content-manager": { "visible": false },
    "content-type-builder": { "visible": false }
  },
  "attributes": {
    "action": {
      "type": "enumeration",
      "enum": ["create", "update", "delete", "publish"]
    },
    "contentType": { "type": "string" },
    "targetDocumentId": { "type": "string" },
    "user": { "type": "string" }
  }
}
```

> **Uwaga:** atrybutu nie nazywaj `documentId` — to nazwa zarezerwowana w Strapi 5
> i Strapi nie wystartuje.

Zarejestruj go w `server/src/content-types/index.ts`:

```ts
import schema from './activity-log/schema.json';

export default {
  'activity-log': { schema },
};
```

### Krok 3 — Serwis

Utwórz `server/src/services/activity-log.ts` z dwiema metodami:
- `log(action, contentType, documentId, user?)` — tworzy wpis w kolekcji (`targetDocumentId: documentId`)
- `getRecent(limit = 50)` — pobiera ostatnie logi: `sort: 'createdAt:desc'`, `limit`

Używaj `strapi.documents('plugin::activity-log.activity-log')` i zarejestruj serwis
w `server/src/services/index.ts` pod nazwą `activityLog`.

### Krok 4 — Kontroler i routing admina

`server/src/controllers/activity-log.ts`:

```ts
import type { Core } from '@strapi/strapi';

const activityLog = ({ strapi }: { strapi: Core.Strapi }) => ({
  async getLogs(ctx) {
    const logs = await strapi.plugin('activity-log').service('activityLog').getRecent(50);
    return ctx.send({ data: logs });
  },
});

export default activityLog;
```

`server/src/routes/admin/index.ts` — routing pluginu dostaje prefiks z nazwą pluginu,
więc `path: '/logs'` daje `GET /activity-log/logs`:

```ts
export default () => ({
  type: 'admin',
  routes: [
    {
      method: 'GET',
      path: '/logs',
      handler: 'activityLog.getLogs',
      config: { policies: ['admin::isAuthenticatedAdmin'] },
    },
  ],
});
```

### Krok 5 — Document Service middleware w `register.ts`

```ts
strapi.documents.use(async (context, next) => {
  const result = await next();
  const tracked = ['create', 'update', 'delete', 'publish'];
  if (context.uid === 'api::article.article' && tracked.includes(context.action)) {
    const documentId =
      (context.params as { documentId?: string })?.documentId ??
      (result as { documentId?: string })?.documentId ??
      '?';
    await strapi.plugin('activity-log').service('activityLog').log(context.action, 'article', documentId);
  }
  return result;
});
```

### Krok 6 — Admin UI

Generator utworzył już `admin/src/index.ts` z `app.addMenuLink(...)` — ustaw `defaultMessage: 'Activity Log'`.

W `admin/src/pages/HomePage.tsx` pobierz dane hookiem `useFetchClient` z `@strapi/strapi/admin`
i wyświetl je w tabeli (`Table`, `Thead`, `Tbody`, `Tr`, `Th`, `Td` z `@strapi/design-system`):

```tsx
const { get } = useFetchClient();

useEffect(() => {
  get<{ data: ActivityLog[] }>('/activity-log/logs').then(({ data }) => setLogs(data.data ?? []));
}, []);
```

> Pakiet `@strapi/helper-plugin` z v4 nie istnieje w Strapi 5.

### Krok 7 — Zbuduj plugin i zarejestruj go

```bash
cd src/plugins/activity-log
npm install
npm run build          # albo `npm run watch` podczas pracy
```

`config/plugins.ts` w katalogu `starter/`:

```ts
export default {
  'activity-log': {
    enabled: true,
    resolve: './src/plugins/activity-log',
  },
};
```

Potem w katalogu `starter/`: `npm run build` i `npm run develop`.

## Kryteria akceptacji

1. Strapi startuje bez błędów, w logach widać `Activity Log plugin aktywny`
2. Utwórz, zaktualizuj i opublikuj artykuł w panelu admina
3. W panelu admina pojawi się nowa pozycja menu **Activity Log**
4. Strona Activity Log wyświetla tabelę z operacjami `create`, `update`, `publish`
5. `GET /activity-log/logs` bez tokenu admina zwraca 401

## Wskazówki

- Plugin rejestruje swój Content Type jako `plugin::activity-log.activity-log` (nie `api::`)
- Middleware rejestruj w `register()` — tak wymaga dokumentacja Document Service middlewares
- Po każdej zmianie w kodzie pluginu: `npm run build` w pluginie (albo działające `npm run watch`)
- Jeśli zmiany w admin UI nie są widoczne — przebuduj panel: `npm run build` w `starter/`

## Dodatkowe zasoby

- [Tworzenie pluginu — oficjalny generator](https://docs.strapi.io/cms/plugins-development/create-a-plugin)
- [Plugin API — serwer](https://docs.strapi.io/cms/plugins-development/server-api)
- [Plugin API — admin](https://docs.strapi.io/cms/plugins-development/admin-panel-api)
- [useFetchClient](https://docs.strapi.io/cms/plugins-development/admin-panel-api#usefetchclient)
