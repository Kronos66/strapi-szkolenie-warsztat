# Ćwiczenie 02 — Policy: weryfikacja właściciela

## Cel

Zabezpiecz endpoint `DELETE /api/articles/:id` polityką `is-owner`,
która pozwala usunąć artykuł tylko jego autorowi.

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
2. Jeśli brak `user` — rzuć `errors.PolicyError('Musisz być zalogowany')`
3. Wywołaj `strapi.service('api::article.article').isOwner(id, user.email)`
4. Jeśli nie jest właścicielem — rzuć `errors.PolicyError('Nie masz uprawnień do usunięcia tego artykułu')`
5. W przeciwnym razie — `return true`

Importuj błędy z `@strapi/utils`:
```ts
import { errors } from '@strapi/utils';
```

> **Dlaczego `PolicyError`, a nie `ForbiddenError`?** Oba dają `403`, ale `ForbiddenError` rzucony
> w polityce Strapi zamienia na ogólny komunikat `Forbidden`. `PolicyError` przekazuje klientowi Twój tekst.

`@strapi/utils` jest w `package.json` startera z wersją `*` — npm bierze tę samą wersję,
której używa `@strapi/strapi`, więc w projekcie jest tylko jedna kopia pakietu.

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

1. Utwórz dwóch użytkowników API (users-permissions), A i B, z różnymi adresami e-mail.
   Rola **Public** ma domyślnie dostęp do rejestracji:
   ```bash
   POST http://localhost:1337/api/auth/local/register
   Content-Type: application/json

   { "username": "userA", "email": "usera@example.com", "password": "Haslo1234!" }
   # → { jwt: "...", user: {...} }
   ```
   To samo dla B (`userB`, `userb@example.com`). Odpowiedź zawiera już `jwt`; później token pobierzesz
   przez `POST /api/auth/local` z `{ "identifier": "usera@example.com", "password": "Haslo1234!" }`.
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
- Rola **Authenticated** musi mieć zaznaczone `delete` dla Article (Settings → Users & Permissions Plugin → Roles).
  Bez tego Strapi zwróci `403`, zanim polityka w ogóle się uruchomi.
- Bez tokenu też dostaniesz `403 Forbidden`, ale zwraca go już users-permissions (Public nie ma `delete`),
  zanim polityka się uruchomi. Sprawdzenie `if (!user)` w polityce to zabezpieczenie na wypadek,
  gdyby route był publiczny
- Do testowania w Postmanie potrzebujesz tokenu JWT z pluginu `users-permissions`
  (`POST /api/auth/local/register` albo `POST /api/auth/local` — pole `identifier` to e-mail lub nazwa
  użytkownika)
- Ponowny `DELETE` tego samego artykułu zwraca `404` — to `NotFoundError` z metody `isOwner()`

> **Po warsztacie:** rozwinięcie tego ćwiczenia znajdziesz w [zadaniach domowych](./05-zadania-domowe.md):
> Z3 (właściciel jako relacja z kontem i luka w rozpoznawaniu po e-mailu).

## Dodatkowe zasoby

- [Polityki — dokumentacja](https://docs.strapi.io/cms/backend-customization/policies)
- [Errors z @strapi/utils](https://docs.strapi.io/cms/backend-customization/errors)
