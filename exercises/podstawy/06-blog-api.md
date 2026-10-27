# Ćwiczenie P6 — Blog API od A do Z

## Cel

Rozbuduj blog ze startera tak, żeby frontendowiec mógł z niego korzystać na produkcji: artykuły
z kategoriami, tagami i komentarzami. Łączysz wszystko z ćwiczeń P1–P5 — tym razem bez instrukcji
krok po kroku.

## Specyfikacja

Pracujesz dalej na projekcie `starter/`. `Article`, `Author` i `Category` już są (seed), `Tag`
utworzyłeś w P2.

**Nowy Content Type `Comment`:**

| Pole         | Typ          | Opcje    |
|--------------|--------------|----------|
| `authorName` | Text (Short) | Required |
| `content`    | Text (Long)  | Required |

- Relacja `Comment` → `Article`: **wiele komentarzy → jeden artykuł**. W typie Comment dodaj pole
  **Relation**, po prawej zostaw **Article** i wybierz czwartą ikonę — pod ikonami ma się pojawić
  zdanie **„Article has many Comments”**. Pola nazwą się same: po stronie Comment `article`,
  po stronie Article `comments` (sprawdź przed **Finish**)
- **Wyłącz Draft & Publish** dla Comment: w oknie **Create a collection type**, zanim klikniesz
  **Continue**, przejdź na zakładkę **Advanced settings** i odznacz **Draft & publish** (domyślnie
  jest zaznaczone). Komentarz jest wtedy widoczny od razu — w Content Managerze zamiast Publish
  zobaczysz tylko **Save**

**Wykorzystaj istniejące typy:**

- `Category` — każdy artykuł ma już kategorię z seeda
- `Tag` z P2 — relacja `Article` ↔ `Tag` wiele do wielu (pole `tags`)

**Uprawnienia:**

- Public czyta (`find`, `findOne`) **Article**, **Author**, **Category**, **Tag** i **Comment**
- Wszystkie operacje zapisu zablokowane

**Dane:**

- Każdy z 5 opublikowanych artykułów ma kategorię (z seeda) i **co najmniej 1 tag**
- **4 komentarze** przypisane do 2 różnych artykułów (Content Manager → **Comment** →
  **Create new entry**, w polu `article` wybierz artykuł, **Save**)

> **Po dodaniu tagów kliknij Publish.** Zmiana relacji w artykule trafia najpierw do wersji Draft —
> publiczne API zobaczy tagi dopiero po ponownej publikacji. Komentarzy to nie dotyczy: relację
> ustawiasz po stronie Comment (bez Draft & Publish), więc nowy komentarz od razu widać
> w `populate=comments` opublikowanego artykułu — artykułu nie publikujesz ponownie.

## Zapytania do przetestowania

| # | Zapytanie                                                                             | Cel                                                                 |
|---|---------------------------------------------------------------------------------------|---------------------------------------------------------------------|
| 1 | `GET /api/articles?populate=category`                                                 | Artykuły z kategorią                                                |
| 2 | `GET /api/articles?populate[tags][fields][0]=name`                                    | Tagi tylko z polem `name` (`id` i `documentId` Strapi dołącza zawsze) |
| 3 | `GET /api/articles?populate=*`                                                        | Wszystkie relacje (jeden poziom)                                    |
| 4 | `GET /api/articles?filters[category][name][$eq]=nature`                               | Artykuły z jednej kategorii (2 wyniki)                              |
| 5 | `GET /api/articles?sort=publishedAt:desc&pagination[pageSize]=2`                      | 2 ostatnio opublikowane artykuły (patrz uwaga niżej)                |
| 6 | `GET /api/articles/<documentId>?populate=*`                                           | Jeden artykuł ze wszystkimi danymi                                  |
| 7 | `GET /api/comments?filters[article][documentId][$eq]=<documentId>&sort=createdAt:asc` | Komentarze jednego artykułu (wybierz artykuł z komentarzami), od najstarszego |
| 8 | `GET /api/comments?populate[article][fields][0]=title`                                | Komentarze z tytułem artykułu                                       |

`documentId` artykułu znajdziesz w odpowiedzi z zapytania 1 (albo w URL-u edycji w Content Manager).

> **`publishedAt` to data ostatniej publikacji, nie utworzenia.** Ponowne Publish po dodaniu tagów
> zmienia kolejność w zapytaniu 5, więc u każdego może wyjść inaczej. Po dacie utworzenia sortuj
> `sort=createdAt:desc`.

> **curl:** dodaj flagę `-g` i podaj adres w pojedynczych cudzysłowach, np.
> `curl -g 'http://localhost:1337/api/comments?filters[article][documentId][$eq]=<documentId>'`.
> Bez `-g` curl odrzuci nawiasy `[]`, a w podwójnych cudzysłowach powłoka „zje” `$eq` i filtr
> zwróci wszystkie komentarze. Wygodniej: Postman albo Bruno.

> `populate=*` dołącza relacje tylko jeden poziom w głąb — avatara autora tam nie będzie
> (patrz P5: `populate[author][populate]=avatar`).

## Najczęstsze problemy

- Pole dodane, ale nie zapisane w Content-Type Builder (brak **Save**)
- Brak uprawnień dla roli Public → 403
- Nowy typ (`Comment`) bez uprawnień → `/api/comments` zwraca 403, a `populate=comments` po cichu
  pomija komentarze
- Puste relacje → brak `populate`
- Relacja zmieniona (np. dodane tagi), ale artykuł nie opublikowany ponownie → API zwraca stare dane
- Pusta lista → wpisy są w stanie Draft, nie Published

## Kryteria akceptacji

Wszystkie 8 zapytań zwraca oczekiwane dane bez tokenu, a `POST /api/comments` zwraca 403.
