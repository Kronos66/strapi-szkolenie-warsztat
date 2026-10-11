# Ćwiczenie 01 — Własny endpoint wyszukiwania

## Cel

Zbuduj endpoint `GET /api/articles/search?q=<fraza>`, który:

- Przeszukuje artykuły po polach `title` i `body` (case-insensitive)
- Zwraca tylko opublikowane artykuły z polami `title`, `slug`, `publishedAt`
- Obsługuje parametr `locale` (domyślnie `pl`)
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

1. Jeśli `query` ma mniej niż 2 znaki — zwróć pustą tablicę
2. Wywołaj `strapi.documents('api::article.article').findMany()` z:
    - `status: 'published'`
    - `locale` przekazanym jako parametr
    - `filters: { $or: [{ title: { $containsi: query } }, { body: { $containsi: query } }] }`
    - `fields: ['title', 'slug', 'publishedAt']`
    - `sort: 'publishedAt:desc'`
3. Zapisz wpis do `search-log` przez `strapi.documents('api::search-log.search-log').create()`
4. Zwróć wyniki

### Krok 2 — Kontroler: akcja `search()`

Edytuj `src/api/article/controllers/article.ts`. Rozszerz kontroler bazowy
o akcję `search`.

Logika:

1. Pobierz `q` i `locale` z `ctx.query`
2. Jeśli brak `q` — zwróć `ctx.badRequest('Parametr "q" jest wymagany')`
3. Wywołaj `strapi.service('api::article.article').search(q, locale)`
4. Zwróć `ctx.send({ data: results, meta: { total: results.length, query: q } })`

### Krok 3 — Routing

Utwórz plik `src/api/article/routes/01-custom-article.ts`:

> **Dlaczego prefiks `01-`?** Strapi ładuje pliki z routingiem alfabetycznie. Bez prefiksu plik załadowałby
> się
> po `article.ts`, a `GET /articles/search` trafiłby w route `GET /articles/:id` (findOne) z id =
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
GET http://localhost:1337/api/articles/search?q=strapi
# → { data: [...], meta: { total: N, query: "strapi" } }

# Brak parametru q
GET http://localhost:1337/api/articles/search
# → 400 Bad Request

# Zbyt krótkie zapytanie
GET http://localhost:1337/api/articles/search?q=a
# → { data: [] }
```

Sprawdź też w panelu admina, że kolekcja **Search Log** rejestruje wyszukiwania (Settings →
Content-Manager lub przez API `/api/search-logs` z tokenem admina).

## Wskazówki

- `$containsi` to operator case-insensitive. Bez `i` (`$contains`) wyszukiwanie jest wrażliwe na
  wielkość liter.
- `fields` ogranicza pola w odpowiedzi — bez tego Strapi zwróci wszystkie pola dokumentu.
- Metoda `search()` w serwisie nie powinna nic wiedzieć o HTTP (`ctx`). Logika walidacji `q` jest w
  kontrolerze.
- Jeśli `search-log` nie rejestruje wpisów — sprawdź czy `draftAndPublish: false` w jego schemacie.

## Dodatkowe zasoby

- [Document Service API — findMany](https://docs.strapi.io/cms/api/document-service/find-many)
- [Filtry — operatory](https://docs.strapi.io/cms/api/document-service/filters)
- [Tworzenie kontrolerów](https://docs.strapi.io/cms/backend-customization/controllers)
