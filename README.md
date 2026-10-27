# Warsztaty Strapi 5 — od podstaw do zaawansowanych

Warsztaty online, prowadzone równolegle z prezentacją
[strapi-szkolenie-prezentacja](https://github.com/Kronos66/strapi-szkolenie-prezentacja).
Część podstawowa jest dla frontendowców bez doświadczenia backendowego,
część zaawansowana — dla osób, które znają już podstawy Strapi.

## Wymagania

- **Node.js 22+** (wersja LTS: 22, 24 lub 26) → `node -v`
- **npm 6+** → `npm -v`
- Edytor (np. VS Code)
- **Postman** lub **Bruno** do testowania API
- Podstawy JavaScriptu (async/await, JSON); w części zaawansowanej także TypeScript
- Stabilne łącze, mikrofon i możliwość udostępniania ekranu — przy problemach pokażesz prowadzącemu swój terminal

## Struktura

```
strapi-szkolenie-warsztat/
├── exercises/
│   ├── podstawy/        ← P1–P6: praca na projekcie startowym
│   └── zaawansowane/    ← 01–04: dalsza praca na tym samym projekcie
├── solutions/           ← tylko w gałęzi `rozwiazania`
│   └── zaawansowane/    ← gotowe rozwiązania ćwiczeń 01–04
├── kolekcje-api/        ← kolekcje Postman i Bruno z zapytaniami z ćwiczenia P3
├── starter/             ← projekt startowy Strapi 5.57 (Article, Author, Category, Search Log…)
└── PROWADZACY.md        ← notatki dla prowadzącego (tylko w gałęzi `rozwiazania`)
```

## Gałęzie

- **`main`** — materiały dla uczestników: ćwiczenia, projekt startowy, kolekcje API
- **`rozwiazania`** — to samo plus gotowe rozwiązania (`solutions/`) i notatki prowadzącego

## Przygotowanie projektu

Obie części warsztatu robimy na jednym projekcie — `starter/`. Najlepiej przygotuj go przed warsztatem:

```bash
cd starter
npm install
npm run seed:example   # dane przykładowe: artykuły, autorzy, kategorie, obrazki
npm run develop
```

> Przy pierwszym uruchomieniu skrypt `scripts/setup-env.js` tworzy plik `.env` z `.env.example`
> i generuje losowe sekrety — bez `.env` Strapi nie wystartuje.

> `seed:example` uruchom **przed** `develop` (przy zatrzymanym serwerze). Działa tylko raz —
> żeby wgrać dane ponownie, usuń bazę `.tmp/data.db`.

Po uruchomieniu otwórz panel administratora pod adresem `http://localhost:1337/admin`
i utwórz konto administratora.

## Część podstawowa

| # | Ćwiczenie | Temat |
|---|-----------|-------|
| P1 | [Uruchomienie projektu i panel administratora](./exercises/podstawy/01-instalacja.md) | Projekt startowy · struktura projektu · panel administratora |
| P2 | [Content Types i relacje](./exercises/podstawy/02-content-types.md) | Content-Type Builder · pola · relacje 1:1 / 1:N / N:M |
| P3 | [REST API](./exercises/podstawy/03-rest-api.md) | Endpointy · populate · filters · sort · pagination |
| P4 | [Uprawnienia i API Tokens](./exercises/podstawy/04-uprawnienia-i-tokeny.md) | Role Public / Authenticated · API Tokens |
| P5 | [Biblioteka mediów](./exercises/podstawy/05-media.md) | Upload · formaty obrazków · URL w API |
| P6 | [Blog API od A do Z](./exercises/podstawy/06-blog-api.md) | Zadanie finałowe — wszystko razem |

## Część zaawansowana

Pracujemy dalej na projekcie startowym (patrz [Przygotowanie projektu](#przygotowanie-projektu)).

Szczegóły: [exercises/zaawansowane/README.md](./exercises/zaawansowane/README.md).

| # | Ćwiczenie | Temat |
|---|-----------|-------|
| 01 | [Search Endpoint](./exercises/zaawansowane/01-search-endpoint.md) | Kontroler · Serwis · Routing |
| 02 | [Policy: is-owner](./exercises/zaawansowane/02-policy-is-owner.md) | Polityki autoryzacji |
| 03 | [DS Middleware](./exercises/zaawansowane/03-ds-middleware.md) | Document Service middleware |
| 04 | [Activity Log Plugin](./exercises/zaawansowane/04-activity-log-plugin.md) | Plugin z admin UI |

## Co dalej

| Funkcja | Jak zacząć |
|---|---|
| **Uwierzytelnianie** | Wbudowane — `POST /api/auth/local/register` i `POST /api/auth/local` |
| **GraphQL** | `npm install @strapi/plugin-graphql` — endpoint `/graphql` |
| **i18n** | Już włączone dla Article (`pl`) — dodaj kolejny język w Settings → Internationalization i przetłumacz artykuł |
| **Webhooks** | Settings → Webhooks — powiadamianie zewnętrznych serwisów o zmianach treści |
| **Strapi Cloud** | Zarządzany hosting — `npm run deploy` |

## Zasoby

- Dokumentacja: [docs.strapi.io](https://docs.strapi.io)
- REST API: [docs.strapi.io/cms/api/rest](https://docs.strapi.io/cms/api/rest)
- Document Service API: [docs.strapi.io/cms/api/document-service](https://docs.strapi.io/cms/api/document-service)
- Discord: [discord.strapi.io](https://discord.strapi.io) · Forum: [forum.strapi.io](https://forum.strapi.io)
- GitHub: [github.com/strapi/strapi](https://github.com/strapi/strapi)
