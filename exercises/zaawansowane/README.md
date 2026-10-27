# Warsztaty Strapi 5 — część zaawansowana

## Konfiguracja środowiska

Pracujesz na tym samym projekcie co w części podstawowej. Jeśli zaczynasz od tej części:

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

> **`GET /api/articles` zwraca 403?** Seed nie otwiera API — tak jak świeży projekt Strapi.
> Jeśli pominąłeś część podstawową, włącz odczyt jak w [P3, krok 2](../podstawy/03-rest-api.md):
> Settings → Users & Permissions Plugin → Roles → **Public** → `find` i `findOne` dla **Article**,
> **Author** i **Category** → **Save**. Same ćwiczenia 01–04 tego nie wymagają.

## Struktura ćwiczeń

| # | Ćwiczenie | Temat |
|---|-----------|-------|
| 01 | [Search Endpoint](./01-search-endpoint.md) | Kontroler · Serwis · Routing |
| 02 | [Policy: is-owner](./02-policy-is-owner.md) | Polityki autoryzacji |
| 03 | [DS Middleware](./03-ds-middleware.md) | Document Service Middleware |
| 04 | [Activity Log Plugin](./04-activity-log-plugin.md) | Tworzenie pluginu z admin UI |

## Pliki startowe

Starter zawiera gotowy projekt z content types:
- **Article** — artykuły bloga (`title`, `body`, `slug`, `featured`, `readTime`, `blocks`, relacje),
  z włączonym i18n; domyślna lokalizacja to `pl` (ustawia ją `STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE` w `.env`)
- **Author** — autorzy artykułów
- **Category** — kategorie
- **Global** / **About** — strony jednorazowe
- **Search Log** — potrzebny w ćwiczeniu 01 (ukryty w Content Managerze, odczyt przez REST API)

Jeśli robiłeś część podstawową, masz też **Tag** (P2) i **Comment** (P6) — ćwiczenia 01–04 ich nie
wymagają i z nimi nie kolidują.

## Bonus — serwer MCP

Strapi 5 ma wbudowany serwer [MCP](https://modelcontextprotocol.io) — agenci AI (Claude Code, Cursor,
Claude Desktop) mogą przez niego czytać i edytować treści. W starterze jest już włączony
(`mcp.enabled` w `config/server.ts`, wyłączysz go przez `MCP_ENABLED=false` w `.env`).
Po starcie w logach zobaczysz `[MCP] Server available at /mcp`.

**Token.** MCP przyjmuje tylko **Admin Token** (nie API Token): Settings → *ADMINISTRATION PANEL* →
**Admin Tokens** → **Create new Admin Token** → Name, Token duration, uprawnienia → **Save**.

**Uprawnienia tokena = narzędzia agenta.** Bez uprawnień MCP pokazuje tylko narzędzie `log`.
Z uprawnieniami dostajesz m.in.:

| Uprawnienie | Narzędzia |
|---|---|
| READ na Article | `list_article`, `get_article` |
| CREATE / UPDATE / DELETE | `create_article`, `update_article`, `delete_article` |
| PUBLISH | `publish_article`, `unpublish_article`, `discard_article_draft` |
| Single types (About, Global) | `get_about`, `write_about`, `delete_about` |
| Media Library | `media_list_assets`, `media_create_folder`, `media_move_assets`… |

Te same narzędzia powstają dla każdego content type'u — także dla `Tag` i `Comment` z części
podstawowej. Token nie dostanie więcej uprawnień niż jego właściciel.

**Podłączenie do Claude Code:**

```bash
claude mcp add --transport http strapi http://localhost:1337/mcp \
  --header "Authorization: Bearer <admin-token>"
```

**Opcje** w `config/server.ts` → `mcp`: `enabled` (domyślnie `false` w czystym Strapi),
`connectTimeoutMs` (domyślnie 5 s), `requestTimeoutMs` (domyślnie 60 s).

> Do pracy z agentem daj tokenowi tylko **READ** — z pełnymi uprawnieniami agent może też usuwać treści.

## Rozwiązania

Gotowe implementacje każdego ćwiczenia (wariant z pluginem kompilowanym przez tsc projektu) są w gałęzi
`rozwiazania-plugin-tsc`, w katalogu `solutions/zaawansowane/`
(`git checkout rozwiazania-plugin-tsc`). Zajrzyj tam dopiero po własnej próbie:

```
solutions/zaawansowane/
├── 01-search-endpoint/src/api/article/
├── 02-policy-is-owner/src/api/article/
├── 03-ds-middleware/src/
└── 04-activity-log-plugin/
```

Skopiuj odpowiednie pliki do `starter/src/` żeby porównać z własną implementacją.
