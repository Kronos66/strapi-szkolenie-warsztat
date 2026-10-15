# Ćwiczenie 02 — Policy: weryfikacja właściciela

## Cel

Zabezpiecz endpoint `DELETE /api/articles/:id` polityką `is-owner`,
która pozwala usunąć artykuł tylko jego autorowi lub użytkownikowi z rolą `Editor`.

Nieautoryzowane próby powinny zwracać `403 Forbidden`.

## Pliki do edycji

```
src/api/article/
├── services/article.ts      ← dodaj metodę isOwner()
├── policies/is-owner.ts     ← utwórz nowy plik
└── routes/01-custom-article.ts ← dodaj route DELETE z polityką
```

## Kroki

### Krok 1 — Serwis: metoda `isOwner()`

Dostęp do danych trzymamy w serwisie — polityka tylko o niego pyta.
W `src/api/article/services/article.ts` dodaj metodę `isOwner(documentId, email)`:

1. Pobierz artykuł przez `strapi.documents('api::article.article').findOne({ documentId, populate: { author: { fields: ['email'] } } })`
   — `documentId` podajesz w obiekcie parametrów
2. Jeśli brak artykułu — rzuć `errors.NotFoundError` (klient dostanie `404`)
3. Zwróć `article.author?.email === email`

Dlaczego e-mail, a nie `id`? W projekcie startowym autor (`api::author.author`) to osobny content type,
niepowiązany z kontem użytkownika w `users-permissions`. Ich `id` pochodzą z dwóch różnych tabel,
więc łączy je tylko adres e-mail.

### Krok 2 — Utwórz politykę `is-owner`

Utwórz plik `src/api/article/policies/is-owner.ts`.

Polityka to funkcja z sygnaturą:
```ts
(policyContext, config, { strapi }) => Promise<boolean>
```

Logika:
1. Pobierz `user` z `policyContext.state` i `id` z `policyContext.params`
2. Jeśli brak `user` — rzuć `errors.ForbiddenError`
3. Jeśli `user.role?.name === 'Editor'` — `return true` (użytkownik users-permissions ma jedną rolę)
4. Wywołaj `strapi.service('api::article.article').isOwner(id, user.email)`
5. Jeśli nie jest właścicielem — rzuć `errors.ForbiddenError`
6. W przeciwnym razie — `return true`

Importuj błędy z `@strapi/utils`:
```ts
import { errors } from '@strapi/utils';
```

### Krok 3 — Zarejestruj politykę w routingu

W pliku `src/api/article/routes/01-custom-article.ts` (z ćwiczenia 01 lub nowy plik)
dodaj route `DELETE`:

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
Jeśli już istnieje z ćwiczenia 01 — dodaj tylko nowy route do tablicy `routes`.

## Kryteria akceptacji

1. Utwórz dwóch użytkowników API (users-permissions), A i B, z różnymi adresami e-mail
2. W panelu administratora utwórz autora z e-mailem użytkownika A i przypisz go do artykułu
3. Spróbuj usunąć ten artykuł przez API z tokenem użytkownika B:
   ```bash
   DELETE http://localhost:1337/api/articles/<documentId>
   Authorization: Bearer <token-uzytkownika-B>
   # → 403 Forbidden
   ```
4. Ta sama operacja z tokenem użytkownika A (właściciela) powinna zwrócić `204 No Content`.

## Wskazówki

- Nazwa polityki w konfiguracji route'a to `api::article.is-owner`, gdzie:
  - `api::article` — namespace API
  - `is-owner` — nazwa pliku w `policies/`
- `policyContext.params.id` to `documentId` artykułu (nie numeryczne `id` z bazy)
- Możesz przetestować bez drugiego użytkownika — sprawdź czy brak tokenu zwraca `403`
- Do testowania w Postmanie potrzebujesz tokenu JWT z pluginu `users-permissions`
  (endpoint: `POST /api/auth/local`)

## Dodatkowe zasoby

- [Polityki — dokumentacja](https://docs.strapi.io/cms/backend-customization/policies)
- [Errors z @strapi/utils](https://docs.strapi.io/cms/backend-customization/errors)
