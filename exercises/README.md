# Warsztaty Strapi v5 — Ćwiczenia

## Konfiguracja środowiska

```bash
cd workshop/starter
npm install
npm run develop
```

Po uruchomieniu otwórz panel admina pod adresem `http://localhost:1337/admin`
i utwórz konto administratora.

## Struktura ćwiczeń

| # | Ćwiczenie | Temat |
|---|-----------|-------|
| 01 | [Search Endpoint](./01-search-endpoint.md) | Kontroler · Serwis · Trasy |
| 02 | [Policy: is-owner](./02-policy-is-owner.md) | Polityki autoryzacji |
| 03 | [DS Middleware](./03-ds-middleware.md) | Document Service Middleware |
| 04 | [Activity Log Plugin](./04-activity-log-plugin.md) | Tworzenie pluginu z admin UI |

## Pliki startowe

Starter zawiera gotowy projekt z content types:
- **Article** — artykuły bloga (`title`, `body`, `slug`, `featured`, `readTime`, `blocks`, relacje)
- **Author** — autorzy artykułów
- **Category** — kategorie
- **Global** / **About** — strony jednorazowe
- **Search Log** — prerekvizyt do ćwiczenia 01 (automatycznie dostępny)

## Rozwiązania

Gotowe implementacje każdego ćwiczenia znajdziesz w `workshop/solutions/`:

```
solutions/
├── 01-search-endpoint/src/api/article/
├── 02-policy-is-owner/src/api/article/
├── 03-ds-middleware/src/
└── 04-activity-log-plugin/
```

Skopiuj odpowiednie pliki do `starter/src/` żeby porównać z własną implementacją.
