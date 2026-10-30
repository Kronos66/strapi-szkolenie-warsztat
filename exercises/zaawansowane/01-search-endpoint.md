# Ćwiczenie 01 — Własny endpoint wyszukiwania

## Cel

Zbuduj endpoint `GET /api/articles/search?q=<fraza>`, który:

- Przeszukuje artykuły po polach `title` i `body` (case-insensitive)
- Zwraca tylko opublikowane artykuły z polami `title`, `slug`, `publishedAt`
- Obsługuje parametr `locale` — Article ma włączone i18n, a bez `locale` Strapi szuka w domyślnej
  lokalizacji (`pl`)
- Zapisuje każde wyszukiwanie do kolekcji `search-log`
- Zwraca `400 Bad Request` gdy brak parametru `q` lub ma mniej niż 2 znaki

## Pliki do edycji

```
src/api/article/
├── services/article.ts      ← dodaj metodę search()
├── controllers/article.ts   ← dodaj akcję search()
└── routes/01-custom-article.ts ← utwórz nowy plik z routingiem
```

## Kroki

### Krok 1 — Serwis: metoda `search()`

Edytuj `src/api/article/services/article.ts`. Rozszerz serwis bazowy
o metodę `search`, która przyjmuje `query: string` i opcjonalny `locale`.

Logika:

1. Wywołaj `strapi.documents('api::article.article').findMany()` z:
    - `status: 'published'`
    - `locale` przekazanym jako parametr
    - `filters: { $or: [{ title: { $containsi: query } }, { body: { $containsi: query } }] }`
    - `fields: ['title', 'slug', 'publishedAt']`
    - `sort: 'publishedAt:desc'`
2. Zapisz wpis do `search-log` przez `strapi.documents('api::search-log.search-log').create()`
   z `data: { query, resultsCount: results.length, searchLocale: locale ?? 'pl' }`
3. Zwróć wyniki

Walidacją `query` zajmuje się kontroler — serwis dostaje już poprawną frazę.

### Krok 2 — Kontroler: akcja `search()`

Edytuj `src/api/article/controllers/article.ts`. Rozszerz kontroler bazowy
o akcję `search`.

Logika:

1. Pobierz `q` i `locale` z `ctx.query`
2. Jeśli `q` nie jest napisem (`typeof q !== 'string'`) albo po `q.trim()` ma mniej niż 2 znaki — zwróć
   `ctx.badRequest('Parametr "q" jest wymagany i musi mieć co najmniej 2 znaki')`.
   Samo `q.length` nie wystarczy: `?q=%20%20` (dwie spacje) ma długość 2, a `?q=a&q=b` daje tablicę
   o długości 2.
3. Przytnij frazę: `const phrase = q.trim()` i wywołaj
   `strapi.service('api::article.article').search(phrase, locale)` — inaczej `?q=%20internet%20`
   przejdzie walidację, a serwis będzie szukał fragmentu ze spacjami
4. Przepuść wyniki przez `this.sanitizeOutput(results, ctx)` — tak jak robią to domyślne akcje.
   Usuwa pola prywatne i relacje, do których rola nie ma uprawnień.
5. Zwróć `this.transformResponse(sanitized, { total: results.length, query: phrase })` —
   odpowiedź ma ten sam kształt `{ data, meta }` co reszta API

### Krok 3 — Routing

Utwórz plik `src/api/article/routes/01-custom-article.ts`:

> **Dlaczego prefiks `01-`?** Strapi ładuje pliki z routingiem alfabetycznie. Bez prefiksu plik
> załadowałby się po `article.ts`, a `GET /articles/search` trafiłby w route `GET /articles/:id` (findOne) z id =
> `search`.

```ts
export default {
  routes: [
    {
      method: 'GET',
      path: '/articles/search',
      handler: 'article.search',
      config: {
        auth: false,
      },
    },
  ],
};
```

## Kryteria akceptacji

Po implementacji następujące żądania powinny działać:

```bash
# Wyszukiwanie z wynikami
GET http://localhost:1337/api/articles/search?q=internet
# → { data: [...], meta: { total: 2, query: "internet" } }

# Brak parametru q
GET http://localhost:1337/api/articles/search
# → 400 Bad Request

# Zbyt krótkie zapytanie
GET http://localhost:1337/api/articles/search?q=a
# → 400 Bad Request

# Same spacje
GET http://localhost:1337/api/articles/search?q=%20%20
# → 400 Bad Request
```

Sprawdź też, że kolekcja **Search Log** rejestruje wyszukiwania. Nie zobaczysz jej w Content Managerze —
schemat ma `"content-manager": { "visible": false }`, bo to dane techniczne, nie treść do edycji.
Odczytaj ją przez REST API:

1. W panelu administratora utwórz API token: **Settings → API Tokens → Create new API Token** —
   nadaj nazwę, ustaw **Token duration** (pole wymagane, np. *Unlimited*) i **Token type: Read-only**,
   kliknij **Save** i od razu skopiuj token (później zobaczysz go przyciskiem *View token*)
2. Wyślij zapytanie z tym tokenem:
   ```bash
   GET http://localhost:1337/api/search-logs?sort=createdAt:desc
   Authorization: Bearer <api-token>
   # → { data: [{ id: 1, documentId: "...", query: "internet", resultsCount: 2, searchLocale: "pl", ... }], meta: {...} }
   ```

> **Dlaczego `searchLocale`, a nie `locale`?** W Strapi 5 nazwa `locale` jest zarezerwowana dla i18n.
> W nielokalizowanym typie (Search Log) atrybut `locale` zapisałby się w bazie, ale REST API by go
> nie zwracało (`?fields[0]=locale` → `400 Invalid key locale`).

Token admina (JWT z logowania do panelu) tu nie zadziała — REST API przyjmuje API tokeny
albo JWT użytkowników z `users-permissions`.

## Wskazówki

- `$containsi` to operator case-insensitive. Bez `i` (`$contains`) wyszukiwanie jest wrażliwe na
  wielkość liter.
- `fields` ogranicza pola w odpowiedzi — bez tego Strapi zwróci wszystkie pola dokumentu.
- Metoda `search()` w serwisie nie powinna nic wiedzieć o HTTP (`ctx`). Logika walidacji `q` jest w
  kontrolerze.
- Jeśli `search-log` nie rejestruje wpisów — sprawdź czy `draftAndPublish: false` w jego schemacie.

> **Po warsztacie:** rozwinięcie tego ćwiczenia znajdziesz w [zadaniach domowych](./05-zadania-domowe.md):
> Z1 (limit zapytań) i Z2 (sprzątanie logów przez cron).

## Dodatkowe zasoby

- [Document Service API — findMany](https://docs.strapi.io/cms/api/document-service/find-many)
- [Filtry — operatory](https://docs.strapi.io/cms/api/document-service/filters)
- [Tworzenie kontrolerów](https://docs.strapi.io/cms/backend-customization/controllers)
