# Warsztaty Strapi 5 — część zaawansowana

## Konfiguracja środowiska

```bash
cd starter
npm install
npm run develop
```

> Przy pierwszym uruchomieniu skrypt `scripts/setup-env.js` tworzy plik `.env` z `.env.example`
> i generuje losowe sekrety — bez `.env` Strapi nie wystartuje.

Po uruchomieniu otwórz panel admina pod adresem `http://localhost:1337/admin`
i utwórz konto administratora.

## Struktura ćwiczeń

| # | Ćwiczenie | Temat |
|---|-----------|-------|
| 01 | [Search Endpoint](./01-search-endpoint.md) | Kontroler · Serwis · Routing |
| 02 | [Policy: is-owner](./02-policy-is-owner.md) | Polityki autoryzacji |
| 03 | [DS Middleware](./03-ds-middleware.md) | Document Service Middleware |
| 04 | [Activity Log Plugin](./04-activity-log-plugin.md) | Tworzenie pluginu z admin UI |

## Pliki startowe

Starter zawiera gotowy projekt z content types:
- **Article** — artykuły bloga (`title`, `body`, `slug`, `featured`, `readTime`, `blocks`, relacje)
- **Author** — autorzy artykułów
- **Category** — kategorie
- **Global** / **About** — strony jednorazowe
- **Search Log** — potrzebny w ćwiczeniu 01 (automatycznie dostępny)

## Rozwiązania

Gotowe implementacje każdego ćwiczenia są w gałęzi `rozwiazania`, w katalogu `solutions/zaawansowane/`
(`git checkout rozwiazania`). Zajrzyj tam dopiero po własnej próbie:

```
solutions/zaawansowane/
├── 01-search-endpoint/src/api/article/
├── 02-policy-is-owner/src/api/article/
├── 03-ds-middleware/src/
└── 04-activity-log-plugin/
```

Skopiuj odpowiednie pliki do `starter/src/` żeby porównać z własną implementacją.
