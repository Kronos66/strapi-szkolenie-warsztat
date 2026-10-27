# Kolekcje zapytań — ćwiczenie P3

Gotowe zapytania z [ćwiczenia P3 (REST API)](../exercises/podstawy/03-rest-api.md) w dwóch wersjach:

```
kolekcje-api/
├── postman/strapi-p3-rest-api.postman_collection.json
└── bruno/                ← kolekcja Bruno (otwórz cały katalog)
```

## Import

- **Postman:** Import → wybierz plik `postman/strapi-p3-rest-api.postman_collection.json`
- **Bruno:** Open Collection → wskaż katalog `bruno/` → w prawym górnym rogu wybierz środowisko `local`

## Zmienne

| Zmienna | Domyślnie | Opis |
|---|---|---|
| `baseUrl` | `http://localhost:1337` | Adres Strapi |
| `documentId` | — | Ustawiana automatycznie przez zapytanie „Lista artykułów” |
| `authorName` | `David Doe` | Autor z danych przykładowych — do zadania z filtrem po relacji |

W Postmanie zmienne są w zakładce **Variables** kolekcji, w Bruno w środowisku `local`.

## Zawartość

1. **Endpointy** — lista, jeden wpis, a także POST / PUT / DELETE, które dla roli Public zwracają 403
2. **populate** — `author`, zagnieżdżony `avatar`, `*`
3. **filters** — `$containsi`, `$gte`, filtr po relacji (zadanie)
4. **sort** — po jednym i po dwóch polach
5. **pagination**
6. **Wszystko razem**

Każde zapytanie ma test sprawdzający oczekiwany status, więc całą kolekcję można puścić jednym
kliknięciem (Postman: **Run collection**, Bruno: **Run**). Przed uruchomieniem potrzebujesz
uruchomionego startera z danymi przykładowymi (`npm run seed:example`) i kroku 2 z P3:
`find` / `findOne` dla Article, Author i Category w roli Public.

Z linii poleceń:

```bash
npx @usebruno/cli run --env local                                                # w katalogu bruno/
npx newman run postman/strapi-p3-rest-api.postman_collection.json                # w katalogu kolekcje-api/
```
