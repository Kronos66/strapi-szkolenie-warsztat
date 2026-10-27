# Ćwiczenie P4 — Role, uprawnienia i API Tokens

## Cel

Zrozum model uprawnień i skonfiguruj go poprawnie dla typowego bloga.

## Kroki

### Krok 1 — Dwie domyślne role

| Rola              | Kto                              | Zastosowanie                                          |
|-------------------|----------------------------------|-------------------------------------------------------|
| **Public**        | Żądania bez tokenu               | Publiczny odczyt opublikowanych artykułów             |
| **Authenticated** | Żądania z ważnym JWT użytkownika | Zalogowani użytkownicy tworzą i edytują własne treści |

Settings → sekcja **USERS & PERMISSIONS PLUGIN** → **Roles** — obejrzyj obie role.

> **Uwaga — dwie pozycje „Roles”.** W Settings jest też **Roles** w sekcji *ADMINISTRATION PANEL* —
> to role administratorów panelu, nie role API. Podobnie **Admin Tokens** to nie to samo co
> **API Tokens**.

### Krok 2 — Uprawnienia roli Public

Public → **Article**:

- ✅ `find`, `findOne`
- ❌ `create`, `update`, `delete` — nigdy publicznie!

Public → **Author**, **Category** i **Tag** (Tag utworzyłeś w P2):

- ✅ `find`, `findOne`

> **Zasada:** Public = tylko odczyt. Operacje zapisu nigdy nie są publiczne.

> **Uwaga — `find` obejmuje też szkice.** Domyślnie API zwraca opublikowane wpisy, ale
> `GET /api/articles?status=draft` bez tokenu zwróci wersje robocze (sprawdzone na Strapi 5.57).
> Uprawnienie `find` nie odróżnia draftów od opublikowanych wpisów — nie trzymaj w draftach
> niczego, czego nie wolno zobaczyć publicznie.

### Krok 3 — API Token dla aplikacji frontendowej

JWT (z logowania) uwierzytelnia *użytkownika*. API Token uwierzytelnia *aplikację*,
np. frontend w Next.js, który odpytuje Strapi.

Settings → API Tokens → **Create new API Token**:

| Pole                  | Wartość                                   |
|-----------------------|-------------------------------------------|
| **Name** (wymagane)   | `frontend-read`                           |
| Description           | opcjonalnie                               |
| **Token duration** (wymagane) | **Unlimited** (albo 7 / 30 / 90 dni) |
| **Token type** (wymagane) | **Read-only** (inne: Full access, Custom) |

→ **Save**. Na górze strony pojawi się blok **Token** z przyciskiem **Copy**.

> **Token nie jest jednorazowy.** W `.env` startera jest ustawiony `ENCRYPTION_KEY`, więc token da się
> wyświetlić ponownie (**View token**), także po przeładowaniu strony. Bez tego klucza Strapi pokazuje
> token tylko raz. **Regenerate** tworzy nowy token i unieważnia stary.

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

> Zapytanie z tokenem wykonane po stronie serwera (np. w Server Component) nie ujawnia go przeglądarce.
> Nie używaj prefiksu `NEXT_PUBLIC_` dla tokenów.

## Kryteria akceptacji

1. Public ma tylko `find` i `findOne` na Article, Author, Category i Tag
2. `POST /api/articles` bez tokenu zwraca 403
3. Zapytanie z API Tokenem zwraca dane
4. (opcjonalnie) `POST /api/articles` z tokenem `frontend-read` też zwraca 403 (token tylko do odczytu),
   a z nieprawidłowym tokenem — 401 „Missing or invalid credentials”

> **401 vs 403:** 401 = Strapi nie wie, kim jesteś (brak lub zły token/JWT). 403 = wie, ale ta rola
> lub ten token nie ma uprawnienia do akcji.
