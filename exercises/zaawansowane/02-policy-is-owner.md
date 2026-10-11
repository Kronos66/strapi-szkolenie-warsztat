# Ćwiczenie 02 — Policy: weryfikacja właściciela

## Cel

Zabezpiecz endpoint `DELETE /api/articles/:id` polityką `is-owner`,
która pozwala usunąć artykuł tylko jego autorowi lub użytkownikowi z rolą `Editor`.

Nieautoryzowane próby powinny zwracać `403 Forbidden`.

## Pliki do edycji

```
src/api/article/
├── policies/is-owner.ts     ← utwórz nowy plik
└── routes/01-custom-article.ts ← dodaj trasę DELETE z polityką
```

## Kroki

### Krok 1 — Utwórz politykę `is-owner`

Utwórz plik `src/api/article/policies/is-owner.ts`.

Polityka to funkcja z sygnaturą:
```ts
(policyContext, config, { strapi }) => Promise<boolean>
```

Logika:
1. Pobierz `user` z `policyContext.state` i `id` z `policyContext.params`
2. Jeśli brak `user` — rzuć `errors.ForbiddenError`
3. Pobierz artykuł przez `strapi.documents('api::article.article').findOne({ documentId: id, populate: { author: { fields: ['id'] } } })`
   — w Strapi 5 `documentId` podajesz w obiekcie parametrów; `findOne(id, {...})` z v4 zwraca `null`
4. Jeśli brak artykułu — rzuć `errors.NotFoundError`
5. Sprawdź: `article.author?.id === user.id` (właściciel) lub `user.role?.name === 'Editor'` (editor — użytkownik users-permissions ma jedną rolę)
6. Jeśli żaden warunek — rzuć `errors.ForbiddenError`
7. W przeciwnym razie — `return true`

Importuj błędy z `@strapi/utils`:
```ts
import { errors } from '@strapi/utils';
```

### Krok 2 — Zarejestruj politykę w trasie

W pliku `src/api/article/routes/01-custom-article.ts` (z ćwiczenia 01 lub nowy plik)
dodaj trasę `DELETE`:

```ts
{
  method: 'DELETE',
  path: '/articles/:id',
  handler: 'article.delete',
  config: {
    policies: ['api::article.is-owner'],
  },
},
```

**Uwaga:** Jeśli jeszcze nie masz pliku `01-custom-article.ts`, utwórz go.
Jeśli już istnieje z ćwiczenia 01 — dodaj tylko nową trasę do tablicy `routes`.

## Kryteria akceptacji

1. Zaloguj się w panelu admina i utwórz artykuł jako użytkownik A
2. Zaloguj się jako użytkownik B (inny autor)
3. Spróbuj usunąć artykuł użytkownika A przez API z tokenem użytkownika B:
   ```bash
   DELETE http://localhost:1337/api/articles/<documentId>
   Authorization: Bearer <token-uzytkownika-B>
   # → 403 Forbidden
   ```
4. Ta sama operacja z tokenem użytkownika A (właściciela) powinna zwrócić `200`.

## Wskazówki

- Nazwa polityki w konfiguracji trasy to `api::article.is-owner`, gdzie:
  - `api::article` — namespace API
  - `is-owner` — nazwa pliku w `policies/`
- `policyContext.params.id` to `documentId` artykułu (nie numeryczne `id` z bazy)
- Możesz przetestować bez drugiego użytkownika — sprawdź czy brak tokenu zwraca `403`
- Do testowania w Postmanie potrzebujesz tokenu JWT z pluginu `users-permissions`
  (endpoint: `POST /api/auth/local`)

## Dodatkowe zasoby

- [Polityki — dokumentacja](https://docs.strapi.io/cms/backend-customization/policies)
- [Errors z @strapi/utils](https://docs.strapi.io/cms/backend-customization/errors)
