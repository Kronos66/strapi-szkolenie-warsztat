# Ćwiczenie P3 — REST API w Postmanie / Bruno

## Cel

Poznaj automatycznie wygenerowane REST API, przetestuj endpointy
i najważniejsze parametry zapytań.

> Wszystkie zapytania z tego ćwiczenia są gotowe w kolekcji Postman / Bruno:
> [`kolekcje-api/`](../../kolekcje-api/README.md).

## Kroki

### Krok 1 — Wygenerowane endpointy

Każdy Collection Type dostaje automatycznie:

| Akcja        | Metoda   | URL                         |
|--------------|----------|-----------------------------|
| Lista        | `GET`    | `/api/articles`             |
| Jeden wpis   | `GET`    | `/api/articles/:documentId` |
| Utworzenie   | `POST`   | `/api/articles`             |
| Aktualizacja | `PUT`    | `/api/articles/:documentId` |
| Usunięcie    | `DELETE` | `/api/articles/:documentId` |

Wyślij `GET http://localhost:1337/api/articles`.

> Oczekiwany wynik: **403 Forbidden**. Tak ma być — Strapi domyślnie blokuje wszystko.

### Krok 2 — Tymczasowo otwórz uprawnienia

Settings → Users & Permissions Plugin → Roles → **Public** → zaznacz `find` i `findOne`
dla **Article**, **Author** i **Category** → **Save**.

Powtórz zapytanie — teraz dostajesz JSON. (Uprawnienia omawiamy dokładnie w ćwiczeniu P4.)

> **Dlaczego także Author i Category?** Uprawnienia działają też na relacjach. Bez dostępu do Author
> `populate=author` po cichu pomija autora, a filtr `filters[author][...]` zwraca **400 Invalid key
author**.

### Krok 3 — Kształt odpowiedzi

```json
{
  "data": [
    {
      "id": 2,
      "documentId": "k3h8x2m9p1q7r4t6v0w5y8za",
      "title": "The internet's Own boy",
      "description": "Follow the story of Aaron Swartz, the boy who could change the world",
      "slug": "the-internet-s-own-boy",
      "body": null,
      "featured": false,
      "readTime": null,
      "createdAt": "2026-05-01T09:55:00.000Z",
      "updatedAt": "2026-05-01T09:55:00.000Z",
      "publishedAt": "2026-05-01T09:55:00.000Z",
      "locale": "pl"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 5
    }
  }
}
```

Zwróć uwagę:

- odpowiedź jest płaska — pola są bezpośrednio w obiekcie (w Strapi 4 były w `attributes`)
- do pojedynczego wpisu odwołujesz się przez `documentId`, nie przez `id`
- pól `author`, `category`, `cover` i `blocks` nie ma — relacje, media i dynamic zone nie są zwracane domyślnie
- `"locale": "pl"` — Article ma włączone i18n, a domyślna lokalizacja to `pl`. Bez parametru `locale`
  dostajesz `pl`. Inny język (`?locale=...`) trzeba najpierw dodać w Settings → Internationalization
  i przetłumaczyć artykuł — w starterze jest tylko `pl`

### Krok 4 — Cztery najważniejsze parametry

**`populate` — dołącz relacje**

```
GET /api/articles?populate=author
GET /api/articles?populate[author][populate]=avatar   ← zagnieżdżone
GET /api/articles?populate=*                          ← wszystkie relacje pierwszego poziomu
```

**`filters` — filtrowanie po wartości pola**

```
GET /api/articles?filters[title][$containsi]=internet   ← 2 artykuły
GET /api/articles?filters[publishedAt][$gte]=2026-01-01
```

Operatory: `$eq`, `$ne`, `$contains`, `$containsi`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, `$null`

**`sort` — sortowanie**

```
GET /api/articles?sort=publishedAt:desc
GET /api/articles?sort[0]=publishedAt:desc&sort[1]=title:asc
```

**`pagination` — stronicowanie**

```
GET /api/articles?pagination[page]=1&pagination[pageSize]=5
```

**Wszystko razem:**

```
GET /api/articles?populate=author&filters[title][$containsi]=internet&sort=publishedAt:desc&pagination[pageSize]=3
```

### Zadanie

Znajdź wszystkie artykuły autora **David Doe**.
Podpowiedź: `filters[author][name][$eq]=David Doe` (w przeglądarce spacja to `%20`)

## Kryteria akceptacji

1. Widziałeś 403, a po zmianie uprawnień — JSON
2. Odpowiedź z `populate=author` zawiera obiekt autora
3. Zapytanie z zadania zwraca 2 artykuły Davida Doe
