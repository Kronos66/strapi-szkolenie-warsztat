# Ćwiczenie P4 — Role, uprawnienia i API Tokens

## Cel

Zrozum model uprawnień i skonfiguruj go poprawnie dla typowego bloga.

## Kroki

### Krok 1 — Dwie domyślne role

| Rola | Kto | Zastosowanie |
|---|---|---|
| **Public** | Żądania bez tokenu | Publiczny odczyt opublikowanych artykułów |
| **Authenticated** | Żądania z ważnym JWT użytkownika | Zalogowani użytkownicy tworzą i edytują własne treści |

Settings → Users & Permissions Plugin → Roles — obejrzyj obie role.

### Krok 2 — Uprawnienia roli Public

Public → **Article**:
- ✅ `find`, `findOne`
- ❌ `create`, `update`, `delete` — nigdy publicznie!

Public → **Author**:
- ✅ `find`, `findOne`

> **Zasada:** Public = tylko odczyt. Operacje zapisu nigdy nie są publiczne.

### Krok 3 — API Token dla aplikacji frontendowej

JWT (z logowania) uwierzytelnia *użytkownika*. API Token uwierzytelnia *aplikację*,
np. frontend w Next.js, który odpytuje Strapi.

Settings → API Tokens → **Create new API Token**:
- Name: `frontend-read`
- Token type: **Read-only**
- Token duration: Unlimited (albo z datą wygaśnięcia)

Skopiuj token i użyj go w zapytaniu:

```
GET /api/articles
Authorization: Bearer <twój-token>
```

Token trzymaj w zmiennej środowiskowej — nigdy na sztywno w kodzie:

```bash
# .env.local (Next.js)
STRAPI_API_TOKEN=twój-token
STRAPI_URL=http://localhost:1337
```

> Token wykonany po stronie serwera (np. w Server Component) nie trafia do przeglądarki.
> Nie używaj prefiksu `NEXT_PUBLIC_` dla tokenów.

## Kryteria akceptacji

1. Public ma tylko `find` i `findOne` na Article i Author
2. `POST /api/articles` bez tokenu zwraca 403
3. Zapytanie z API Tokenem zwraca dane
