# Ćwiczenie 04 — Plugin: Activity Log

## Cel

Zbuduj lokalny plugin `activity-log` w TypeScripcie, który:
- Loguje operacje `create`, `update`, `delete`, `publish` na artykułach
- Przechowuje logi w dedykowanej kolekcji `activity-log`
- Wyświetla ostatnie logi na stronie w panelu administracyjnym

## Jak działa lokalny plugin w TypeScripcie

Plugin kompiluje się **razem z aplikacją** — `npm run build` / `npm run develop` w `starter/`
wystarczą, bez osobnego builda pluginu. Strapi szuka w katalogu pluginu dwóch plików wejściowych:

```
src/plugins/activity-log/
├── package.json        ← tylko nazwa i "strapi": { "kind": "plugin" }
├── strapi-server.js    ← require('…/dist/src/plugins/activity-log/server/src') — kod skompilowany przez tsc projektu
├── strapi-admin.js     ← export { default } from './admin/src' — Vite kompiluje TS panelu w locie
├── server/src/         ← kod serwera (TS)
└── admin/src/          ← admin UI (React + TS)
```

Domyślnie `tsconfig.json` projektu wyklucza `src/plugins/**`, więc trzeba to zmienić (krok 1).

> To skrót dla pluginów lokalnych. Plugin, który chcesz opublikować na npm, buduje się osobno
> przez [Plugin SDK](https://docs.strapi.io/cms/plugins-development/create-a-plugin) (`@strapi/sdk-plugin`).

## Struktura pluginu

```
src/plugins/activity-log/
├── package.json
├── strapi-server.js                     ← wejście serwera → dist/
├── strapi-admin.js                      ← wejście panelu admina → admin/src
├── server/src/
│   ├── index.ts                         ← punkt wejścia serwera
│   ├── register.ts                      ← Document Service middleware
│   ├── content-types/
│   │   ├── index.ts
│   │   └── activity-log/schema.json     ← definicja kolekcji logów
│   ├── services/activity-log.ts         ← log() i getRecent()
│   ├── controllers/activity-log.ts      ← getLogs()
│   └── routes/admin/index.ts            ← trasa admin GET /activity-log/logs
└── admin/src/
    ├── index.ts                         ← rejestracja w menu admina
    └── pages/
        ├── App.tsx                      ← routing strony pluginu
        └── HomePage.tsx                 ← strona z tabelą logów
```

## Kroki

### Krok 1 — Szkielet pluginu

W `starter/tsconfig.json` zamień w `exclude` wpis `"src/plugins/**"` na:

```jsonc
// Panel admina pluginów buduje Vite (strapi-admin.js), serwer pluginów kompiluje tsc projektu
"src/plugins/*/admin/**"
```

Utwórz katalog `starter/src/plugins/activity-log/` i trzy pliki:

`package.json`:

```json
{
  "name": "activity-log",
  "version": "0.0.0",
  "private": true,
  "strapi": {
    "kind": "plugin",
    "name": "activity-log",
    "displayName": "Activity Log"
  }
}
```

`strapi-server.js`:

```js
'use strict';

module.exports = require('../../../dist/src/plugins/activity-log/server/src').default;
```

`strapi-admin.js`:

```js
export { default } from './admin/src';
```

`server/src/index.ts` — punkt wejścia serwera, uzupełnisz go w kolejnych krokach:

```ts
import register from './register';
import contentTypes from './content-types';
import services from './services';
import controllers from './controllers';
import routes from './routes';

export default { register, contentTypes, services, controllers, routes };
```

> Ścieżka w `strapi-server.js` prowadzi do `dist/` — `strapi start` bez wcześniejszego `npm run build`
> nie znajdzie skompilowanego serwera pluginu.

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

> **Typy kolekcji pluginu:** `strapi.documents('plugin::activity-log.activity-log')` jest typowane na podstawie
> `types/generated/contentTypes.d.ts`. Ten plik generuje sam `npm run develop` przy każdym starcie —
> zacommituj go razem z kodem, bo `npm run build` typów nie generuje. Dzięki temu pole `action` ma typ `'create' | 'update' | 'delete' | 'publish'` z enumeracji w schemacie —
> parametr `log(action, …)` otypuj tak samo.

### Krok 4 — Kontroler i trasa admin

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

`server/src/controllers/index.ts` eksportuje go pod nazwą `activityLog` (tak jak serwis).

`server/src/routes/admin/index.ts` — trasy pluginu dostają prefiks z nazwą pluginu,
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

`server/src/routes/index.ts`: `export default { admin: adminRoutes };` (import z `./admin`).

### Krok 5 — Document Service middleware w `register.ts`

`server/src/register.ts` eksportuje funkcję `({ strapi }) => { … }`, a w niej:

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

`admin/src/index.ts` rejestruje plugin i dodaje pozycję w menu:

```ts
import type { StrapiApp } from '@strapi/strapi/admin';
import { PuzzlePiece } from '@strapi/icons';

const plugin: StrapiApp['appPlugins'][string] = {
  register(app) {
    app.addMenuLink({
      to: 'plugins/activity-log',
      icon: PuzzlePiece,
      intlLabel: { id: 'activity-log.plugin.name', defaultMessage: 'Activity Log' },
      Component: () => import('./pages/App'),
      permissions: [],
    });
    app.registerPlugin({ id: 'activity-log', name: 'activity-log' });
  },
};

export default plugin;
```

`admin/src/pages/App.tsx` renderuje `HomePage` w `<Routes>` z `react-router-dom`
(`<Route index element={<HomePage />} />`).

W `admin/src/pages/HomePage.tsx` pobierz dane hookiem `useFetchClient` z `@strapi/strapi/admin`
i wyświetl je w tabeli (`Table`, `Thead`, `Tbody`, `Tr`, `Th`, `Td` z `@strapi/design-system`):

```tsx
const { get } = useFetchClient();

useEffect(() => {
  get<{ data: ActivityLog[] }>('/activity-log/logs').then(({ data }) => setLogs(data.data ?? []));
}, []);
```

> Pakiet `@strapi/helper-plugin` z v4 nie istnieje w Strapi 5.

### Krok 7 — Zarejestruj plugin i uruchom

`config/plugins.ts` w katalogu `starter/`:

```ts
export default {
  'activity-log': {
    enabled: true,
    resolve: './src/plugins/activity-log',
  },
};
```

Potem w katalogu `starter/`: `npm run develop` — plugin skompiluje się razem z aplikacją,
a Strapi wygeneruje typy dla jego kolekcji.

## Kryteria akceptacji

1. Strapi startuje bez błędów, w logach widać `Activity Log plugin aktywny`
2. Utwórz, zaktualizuj i opublikuj artykuł w panelu admina
3. W panelu admina pojawi się nowa pozycja menu **Activity Log**
4. Strona Activity Log wyświetla tabelę z operacjami `create`, `update`, `publish`
5. `GET /activity-log/logs` bez tokenu admina zwraca 401

## Wskazówki

- Plugin rejestruje swój Content Type jako `plugin::activity-log.activity-log` (nie `api::`)
- Middleware rejestruj w `register()` — tak wymaga dokumentacja Document Service middlewares
- `npm run develop` sam kompiluje zmiany w `server/src` pluginu i restartuje Strapi
- Błąd TS `"plugin::activity-log.activity-log" is not assignable to parameter of type 'ContentType'` —
  typy nie są wygenerowane — uruchom raz `npm run develop` (dopiero potem `npm run build`)
- Błąd `Cannot find module '…/dist/src/plugins/activity-log/server/src'` — `tsconfig.json` nadal wyklucza
  `src/plugins/**` albo projekt nie był jeszcze skompilowany (`npm run develop`)
- Jeśli zmiany w admin UI nie są widoczne — przebuduj panel: `npm run build` w `starter/`

## Dodatkowe zasoby

- [Plugin SDK — budowanie pluginów do publikacji](https://docs.strapi.io/cms/plugins-development/create-a-plugin)
- [Plugin API — serwer](https://docs.strapi.io/cms/plugins-development/server-api)
- [Plugin API — admin](https://docs.strapi.io/cms/plugins-development/admin-panel-api)
- [useFetchClient](https://docs.strapi.io/cms/plugins-development/admin-panel-api#usefetchclient)
