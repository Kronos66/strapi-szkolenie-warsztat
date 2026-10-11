# Ćwiczenie P6 — Blog API od A do Z

## Cel

Samodzielnie zbuduj kompletne Blog API, z którego frontendowiec mógłby korzystać na produkcji.
Łączysz wszystko z ćwiczeń P1–P5 — tym razem bez instrukcji krok po kroku.

## Specyfikacja

Zacznij od czystego projektu (`npx create-strapi@latest blog-api --non-interactive --skip-cloud`)
albo kontynuuj w projekcie z poprzednich ćwiczeń.

**Content Types:**
- `Post` — `title` (text, required), `content` (rich text), `slug` (UID z `title`), `excerpt` (text), `cover` (media)
- `Category` — `name` (text, required), `description` (text)
- `Tag` — `name` (text, required)

**Relacje:**
- Post → Category: **wiele postów → jedna kategoria**
- Post ↔ Tag: **wiele do wielu**

**Uprawnienia:**
- Public czyta (`find`, `findOne`) Posts, Categories i Tags
- Wszystkie operacje zapisu zablokowane

**Dane przykładowe:**
- 2 kategorie (np. „Frontend”, „Backend”)
- 3 tagi (np. „JavaScript”, „API”, „Strapi”)
- 4 opublikowane posty — każdy z kategorią i co najmniej jednym tagiem
- 2 posty z obrazkiem `cover`

## Zapytania do przetestowania

| # | Zapytanie | Cel |
|---|---|---|
| 1 | `GET /api/posts` | Lista postów (bez relacji) |
| 2 | `GET /api/posts?populate=category` | Posty z kategorią |
| 3 | `GET /api/posts?populate[tags][fields][0]=name` | Tylko nazwy tagów |
| 4 | `GET /api/posts?populate=*` | Wszystkie relacje |
| 5 | `GET /api/posts?filters[category][name][$eq]=Frontend` | Posty z jednej kategorii |
| 6 | `GET /api/posts?sort=publishedAt:desc&pagination[pageSize]=2` | 2 najnowsze posty |
| 7 | `GET /api/posts/:documentId?populate=*` | Jeden post ze wszystkimi danymi |

## Najczęstsze problemy

- Pole dodane, ale nie zapisane w Content-Type Builder (brak **Save**)
- Brak uprawnień dla roli Public → 403
- Puste relacje → brak `populate`
- Pusta lista → wpisy są w stanie Draft, nie Published

## Kryteria akceptacji

Wszystkie 7 zapytań zwraca oczekiwane dane bez tokenu, a `POST /api/posts` zwraca 403.
