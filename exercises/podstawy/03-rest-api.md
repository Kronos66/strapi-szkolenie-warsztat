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
dla **Article** i **Author** → **Save**.

Powtórz zapytanie — teraz dostajesz JSON. (Uprawnienia omawiamy dokładnie w ćwiczeniu P4.)

> **Dlaczego także Author?** Uprawnienia działają też na relacjach. Bez dostępu do Author
> `populate=author` po cichu pomija autora, a filtr `filters[author][...]` zwraca **400 Invalid key
author**.

### Krok 3 — Kształt odpowiedzi

```json
{
  "data": [
    {
      "id": 1,
      "documentId": "abc123xyz",
      "title": "Mój pierwszy artykuł",
      "slug": "moj-pierwszy-artykul",
      "publishedAt": "2026-05-01T10:00:00.000Z",
      "createdAt": "2026-05-01T09:55:00.000Z",
      "updatedAt": "2026-05-01T09:55:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 2
    }
  }
}
```

Zwróć uwagę:

- odpowiedź jest płaska — pola są bezpośrednio w obiekcie (w Strapi 4 były w `attributes`)
- do pojedynczego wpisu odwołujesz się przez `documentId`, nie przez `id`
- pola `author` nie ma — relacje nie są zwracane domyślnie

### Krok 4 — Cztery najważniejsze parametry

**`populate` — dołącz relacje**

```
GET /api/articles?populate=author
GET /api/articles?populate[author][populate]=avatar   ← zagnieżdżone
GET /api/articles?populate=*                          ← wszystkie relacje pierwszego poziomu
```

**`filters` — filtrowanie po wartości pola**

```
GET /api/articles?filters[title][$containsi]=strapi
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
GET /api/articles?populate=author&filters[title][$containsi]=blog&sort=publishedAt:desc&pagination[pageSize]=3
```

### Zadanie

Znajdź wszystkie artykuły konkretnego autora.
Podpowiedź: `filters[author][name][$eq]=ImięAutora`

## Kryteria akceptacji

1. Widziałeś 403, a po zmianie uprawnień — JSON
2. Odpowiedź z `populate=author` zawiera obiekt autora
3. Zapytanie z zadania zwraca tylko artykuły wybranego autora
