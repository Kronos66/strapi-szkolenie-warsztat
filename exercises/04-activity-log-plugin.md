# Ćwiczenie 04 — Plugin: Activity Log

## Cel

Zbuduj lokalny plugin `activity-log`, który:
- Loguje operacje `create`, `update`, `delete`, `publish` na artykułach
- Przechowuje logi w dedykowanej kolekcji `activity-log`
- Wyświetla ostatnie logi na stronie w panelu administracyjnym

## Struktura pluginu

```
src/plugins/activity-log/
├── strapi-server.ts                       ← punkt wejścia (serwer)
├── server/
│   ├── content-types/activity-log/
│   │   └── schema.json                    ← definicja kolekcji logów
│   ├── services/
│   │   └── index.ts                       ← log() i getRecent()
│   ├── controllers/
│   │   └── index.ts                       ← endpoint /activity-log/logs
│   └── routes/
│       └── index.ts                       ← trasa admin
└── admin/
    └── src/
        ├── index.ts                       ← rejestracja w menu admina
        └── pages/App/
            └── index.tsx                  ← strona React z tabelą logów
```

Oraz rejestracja w `config/plugins.ts`.

## Kroki

### Krok 1 — Utwórz strukturę pluginu

Możesz użyć oficjalnego generatora SDK (zalecane):

```bash
cd workshop/starter
npx @strapi/sdk-plugin init src/plugins/activity-log
```

Kreator zapyta o: nazwę (`activity-log`), wyświetlaną nazwę (`Activity Log`), TypeScript (`tak`).
Następnie wyczyść wygenerowane pliki przykładowe i zastąp je poniższą implementacją.

Alternatywnie utwórz strukturę katalogów ręcznie (jak powyżej).

### Krok 2 — Content Type: activity-log

Utwórz `server/content-types/activity-log/schema.json`:

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
    "content-manager": { "visible": false }
  },
  "attributes": {
    "action": {
      "type": "enumeration",
      "enum": ["create", "update", "delete", "publish"]
    },
    "contentType": { "type": "string" },
    "documentId": { "type": "string" },
    "user": { "type": "string" }
  }
}
```

### Krok 3 — Serwis

Utwórz `server/services/index.ts` z dwiema metodami:
- `log(action, contentType, documentId, user?)` — tworzy wpis w kolekcji `activity-log`
- `getRecent(limit?)` — pobiera ostatnie N logów posortowane `createdAt:desc`

Używaj `strapi.documents('plugin::activity-log.activity-log')`.

### Krok 4 — Kontroler i trasa admin

Utwórz `server/controllers/index.ts` z metodą `getLogs`:
```ts
async getLogs(ctx) {
  const logs = await strapi.plugin('activity-log').service('activityLog').getRecent(50);
  return ctx.send({ data: logs });
}
```

Utwórz `server/routes/index.ts` z trasą `GET /activity-log/logs` typu `admin`.

### Krok 5 — Lifecycle hook w `strapi-server.ts`

W funkcji `bootstrap()` zarejestruj Document Service middleware:

```ts
strapi.documents.use(async (context, next) => {
  const result = await next();
  const tracked = ['create', 'update', 'delete', 'publish'];
  if (context.uid === 'api::article.article' && tracked.includes(context.action)) {
    const svc = strapi.plugin('activity-log').service('activityLog');
    const documentId = context.params?.documentId ?? result?.documentId ?? '?';
    await svc.log(context.action, 'article', documentId);
  }
  return result;
});
```

### Krok 6 — Admin UI

Utwórz `admin/src/index.ts` rejestrujący link w menu panelu admina:

```ts
export default {
  register(app: any) {
    app.addMenuLink({
      to: '/plugins/activity-log',
      icon: () => '📋',
      intlLabel: { id: 'activity-log.plugin.name', defaultMessage: 'Activity Log' },
      Component: async () => {
        const { App } = await import('./pages/App');
        return App;
      },
    });
  },
};
```

Utwórz `admin/src/pages/App/index.tsx` — prosta strona React wyświetlająca tabelę logów.
Pobierz dane z `/activity-log/logs` używając hooka `useFetchClient` z `@strapi/helper-plugin`.

### Krok 7 — Rejestracja pluginu

Utwórz `config/plugins.ts` w katalogu `starter/`:

```ts
export default {
  'activity-log': {
    enabled: true,
    resolve: './src/plugins/activity-log',
  },
};
```

## Kryteria akceptacji

1. Strapi startuje bez błędów po dodaniu pluginu
2. Utwórz, zaktualizuj i opublikuj artykuł w panelu admina
3. W panelu admina pojawi się nowa pozycja menu **Activity Log**
4. Strona Activity Log wyświetla tabelę z operacjami `create`, `update`, `publish`

## Wskazówki

- Plugin rejestruje swój Content Type jako `plugin::activity-log.activity-log` (nie `api::`)
- `pluginOptions: { "content-manager": { "visible": false } }` ukrywa kolekcję przed edytorami
- Trasa admin musi mieć `type: 'admin'` — inaczej będzie pod `/api/` zamiast `/admin/`
- Middleware rejestruj w `bootstrap()`, nie `register()` — w `register()` inne pluginy mogą nie być jeszcze załadowane
- Po zmianach w admin UI trzeba zbudować frontend: `npm run build` (lub pracuj w trybie `develop` z hot reload)

## Dodatkowe zasoby

- [Tworzenie pluginu — oficjalny generator](https://docs.strapi.io/cms/plugins-development/create-a-plugin)
- [Plugin API — serwer](https://docs.strapi.io/cms/plugins-development/server-api)
- [Plugin API — admin](https://docs.strapi.io/cms/plugins-development/admin-panel-api)
- [useFetchClient](https://docs.strapi.io/cms/plugins-development/admin-panel-api#usefetchclient)
