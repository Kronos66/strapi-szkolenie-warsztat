# Zadania domowe i ciekawostki

Rozszerzenia ćwiczeń 01–04 dla chętnych, do zrobienia po warsztacie, we własnym tempie. Każde
zadanie zaczyna się
od ciekawostki: co w rozwiązaniu z warsztatu jest uproszczeniem i dlaczego na produkcji zrobiłbyś
to inaczej. Rozwiązań w repozytorium nie ma. W podpowiedziach są nazwy API i linki do dokumentacji.

Zadania Z1–Z6 wymagają tylko projektu `starter/`. Część „Dalsza droga” na końcu to tematy na osobny
dzień: produkcja, testy, inna baza danych.

| #  | Zadanie                                                                                                   | Bazuje na | Czas   |
|----|-----------------------------------------------------------------------------------------------------------|-----------|--------|
| Z1 | [Limit zapytań i walidacja `locale`](#z1-limit-zapytań-i-walidacja-locale)                                | 01        | 30 min |
| Z2 | [Sprzątanie Search Log przez cron](#z2-sprzątanie-search-log-przez-cron)                                  | 01        | 20 min |
| Z3 | [Właściciel jako relacja z kontem](#z3-właściciel-jako-relacja-z-kontem)                                  | 02        | 45 min |
| Z4 | [Unikalny slug tylko przy `create`](#z4-unikalny-slug-tylko-przy-create)                                  | 03        | 30 min |
| Z5 | [Activity Log: kto, uprawnienia, odporność na błędy](#z5-activity-log-kto-uprawnienia-odporność-na-błędy) | 04        | 45 min |
| Z6 | [Panel boczny w Content Managerze](#z6-panel-boczny-w-content-managerze)                                  | 04        | 45 min |

---

## Z1: Limit zapytań i walidacja `locale`

> **Ciekawostka.** Endpoint z ćwiczenia 01 ma `auth: false`, a każde wywołanie zapisuje wiersz
> w `search-log`. Anonimowy `GET` ze skutkiem ubocznym w bazie to zaproszenie do zaśmiecenia jej
> skryptem w pętli. Do tego `?locale=pl&locale=en` daje w `ctx.query.locale` tablicę, a nie napis.

**Zadanie:**

1. Napisz middleware route'a `src/api/article/middlewares/rate-limit.ts`, który pozwala na
   najwyżej 10 wyszukiwań na minutę z jednego adresu IP (`ctx.request.ip`). Liczniki trzymaj w `Map`
   w pamięci. Po przekroczeniu limitu rzuć `errors.RateLimitError` z `@strapi/utils`, a klient
   dostanie `429 Too Many Requests`.
2. Podepnij middleware tylko do wyszukiwarki: w `01-custom-article.ts` dodaj do route'a
   `config: { middlewares: ['api::article.rate-limit'] }`.
3. W kontrolerze odrzuć `locale`, które nie jest napisem (`400`).
4. W serwisie zamiast wpisanego na sztywno `'pl'` pobierz domyślną lokalizację:
   `await strapi.plugin('i18n').service('locales').getDefaultLocale()`.

**Sprawdź:** 11. zapytanie w ciągu minuty zwraca `429`, a `?q=internet&locale=pl&locale=en` zwraca
`400`.

> `Map` w pamięci działa dla jednej instancji Strapi. Przy kilku instancjach za load balancerem
> liczniki trzyma się we wspólnym magazynie, np. w Redisie.

**Dokumentacja:** [Route middlewares](https://docs.strapi.io/cms/backend-customization/middlewares),
[Errors](https://docs.strapi.io/cms/backend-customization/errors)

---

## Z2: Sprzątanie Search Log przez cron

> **Ciekawostka.** Logi rosną bez końca. Strapi ma wbudowany harmonogram zadań (cron), więc nie
> potrzebujesz osobnego procesu ani zewnętrznej usługi.

**Zadanie:** codziennie o 3:00 usuwaj wpisy Search Log starsze niż 30 dni.

1. Utwórz `config/cron-tasks.ts` z zadaniem
   `{ task: async ({ strapi }) => {...}, options: { rule: '0 3 * * *' } }`
2. Włącz cron w `config/server.ts`: `cron: { enabled: true, tasks: cronTasks }`
3. Document Service nie ma `deleteMany`. Do masowego usuwania użyj Query Engine (niższa warstwa,
   bez middleware'ów i Draft & Publish):
   ```ts
   await strapi.db.query('api::search-log.search-log').deleteMany({
     where: { createdAt: { $lt: granica } },
   });
   ```

**Sprawdź:** na czas testu ustaw regułę `'*/1 * * * *'` (co minutę) i granicę „starsze niż 1
minuta”.

**Dokumentacja:** [Cron jobs](https://docs.strapi.io/cms/configurations/cron),
[Query Engine](https://docs.strapi.io/cms/api/query-engine)

---

## Z3: Właściciel jako relacja z kontem

> **Ciekawostka.** W ćwiczeniu 02 właściciela rozpoznajemy po e-mailu. Rejestracja w users-permissions
> jest otwarta, a potwierdzanie adresu e-mail jest domyślnie wyłączone. Kto zna e-mail autora i założy
> konto pierwszy, może usuwać jego artykuły. Polityka chroni też tylko `DELETE`, a `PUT` może wywołać
> każdy zalogowany użytkownik z uprawnieniem `update`.

**Zadanie:**

1. W Content-Type Builderze dodaj do Article relację `owner` → **User (from: users-permissions)**,
   wiele artykułów → jeden użytkownik.
2. Nadpisz akcję `create` w kontrolerze Article tak, żeby `owner` zawsze był zalogowanym
   użytkownikiem (`ctx.state.user`). Klient nie może sam ustawić ani zmienić właściciela.
   Pamiętaj, że `sanitizeInput` usuwa relacje, do których rola nie ma uprawnień, więc właściciela
   ustaw po sanitizacji, po stronie serwera.
3. Zmień `isOwner()`, żeby porównywał `owner.id` z `user.id` zamiast e-maili.
4. Dodaj w `01-custom-article.ts` route `PUT /articles/:id` z tą samą polityką. Zmień komunikat
   polityki na neutralny („Nie masz uprawnień do tego artykułu”).
5. Opcjonalnie: włącz potwierdzanie e-maila: Settings → Users & Permissions Plugin →
   **Advanced settings** → **Enable email confirmation**.

> **API tokeny.** Zapytanie z API tokenem nie ma użytkownika (`ctx.state.user` jest pusty). Bez
> dodatkowego warunku polityka zwróci `403` na każdy `PUT` z tokenem, także w testach z ćwiczenia 03,
> a `create` utworzy artykuł bez właściciela. API token to zaufany klient serwerowy, więc przepuść go
> na początku polityki:
>
> ```ts
> const { user, auth } = policyContext.state;
>
> if (auth?.strategy?.name === 'content-api-token') {
>   return true;
> }
> ```
>
> W Strapi 5.57 strategia nazywa się `content-api-token`. We wcześniejszych wersjach 5.x nazywała się
> `api-token`. Jeśli warunek nie działa, wypisz `auth.strategy.name` w logu.

**Sprawdź:** użytkownik B dostaje `403` na `PUT` i `DELETE` artykułu użytkownika A. `POST`
z `"owner": <id-B>` w body użytkownika A tworzy artykuł z właścicielem A. `PUT` z API tokenem
zwraca `200`.

**Dokumentacja:** [Controllers: sanitization](https://docs.strapi.io/cms/backend-customization/controllers#sanitization-and-validation-in-controllers),
[Policies](https://docs.strapi.io/cms/backend-customization/policies)

---

## Z4: Unikalny slug tylko przy `create`

> **Ciekawostka.** Middleware z ćwiczenia 03 przy `update` z samym `title` generuje nowy slug.
> Zmienia się adres opublikowanego artykułu, a stare linki przestają działać. Dwa artykuły o tym
> samym
> tytule kończą się błędem `400 This attribute must be unique`.

> **Uwaga przy testach.** Pole `slug` ma `targetField: "title"`, więc panel administratora sam
> generuje slug podczas wpisywania tytułu i wysyła go w `data`. Test przez panel nie sprawdza
> Twojego
> middleware'u, więc testuj przez REST API.

**Zadanie:**

1. Generuj slug tylko dla `context.action === 'create'`.
2. Przed zapisem sprawdź, czy slug jest wolny:
   `strapi.documents('api::article.article').findFirst({ filters: { slug }, locale })`.
   Jeśli jest zajęty, dopisuj `-2`, `-3`… aż znajdziesz wolny.
3. Gdy `update` przyśle pusty `body` (`""`), ustaw `readTime` na `0` zamiast zostawiać starą
   wartość.

**Sprawdź:** dwa razy `POST` z tym samym tytułem → slugi `moj-artykul` i `moj-artykul-2`. `PUT` z
nowym
tytułem nie zmienia sluga.

> **Ciekawostka: lifecycle hooks.** Strapi 5 ma nadal hooki `beforeCreate` / `afterUpdate` w
> `content-types/*/lifecycles.ts`, ale działają na poziomie bazy: jedna operacja na dokumencie
> z Draft & Publish i i18n może wywołać je kilka razy (szkic, wersja opublikowana, każdy język).
> Dlatego do logiki na poziomie dokumentu dokumentacja poleca Document Service middleware.

**Dokumentacja:** [Document Service middlewares](https://docs.strapi.io/cms/backend-customization/document-service-middlewares),
[Lifecycle hooks](https://docs.strapi.io/cms/backend-customization/models#lifecycle-hooks)

---

## Z5: Activity Log: kto, uprawnienia, odporność na błędy

> **Ciekawostka.** W ćwiczeniu 04 log zapisuje się po `next()` bez `try/catch`. Jeśli zapis logu się
> nie uda, artykuł jest już w bazie, a klient dostaje `500` i myśli, że operacja się nie powiodła.
> Do tego każdy zalogowany administrator widzi logi, a w kolumnie `user` zawsze jest `system`.

**Zadanie:**

1. Owiń zapis logu w `try/catch` i błąd tylko zaloguj (`strapi.log.error`). Operacja na artykule
   ma się udać nawet przy błędzie logu.
2. Zapisuj prawdziwego użytkownika. Kontekst bieżącego żądania HTTP jest dostępny w middleware:
   ```ts
   const user = strapi.requestContext.get()?.state?.user;
   ```
   Dla administratora masz `firstname`, `lastname`, `email`. Gdy nie ma żądania (np. seed, cron),
   zostaw `system`.
3. Dodaj uprawnienie RBAC (kontrola dostępu oparta na rolach). W `bootstrap.ts` pluginu:
   ```ts
   await strapi.admin.services.permission.actionProvider.registerMany([
     { section: 'plugins', displayName: 'Read', uid: 'read', pluginName: 'activity-log' },
   ]);
   ```
   W routingu zamień `admin::isAuthenticatedAdmin` na
   `{ name: 'admin::hasPermissions', config: { actions: ['plugin::activity-log.read'] } }`,
   a w `admin/src/index.ts` dodaj do `addMenuLink` pole
   `permissions: [{ action: 'plugin::activity-log.read', subject: null }]`.
4. Pozwól wybrać śledzone typy w `config/plugins.ts` startera
   (`config: { contentTypes: ['api::article.article', 'api::author.author'] }`) i odczytuj je przez
   `strapi.plugin('activity-log').config('contentTypes')`. Domyślną wartość ustaw w
   `server/src/config/index.ts` pluginu.

**Sprawdź:** utwórz rolę administratora **Editor** bez uprawnienia *Activity Log → Read*. Pozycja
menu znika, a `GET /activity-log/logs` zwraca `403`. W kolumnie `user` widać e-mail administratora.

**Dokumentacja:** [Admin permissions for plugins](https://docs.strapi.io/cms/plugins-development/guides/admin-permissions-for-plugins),
[Plugin configuration](https://docs.strapi.io/cms/plugins-development/server-api#configuration)

---

## Z6: Panel boczny w Content Managerze

> **Ciekawostka.** Plugin może dokładać własne elementy do istniejących ekranów panelu, nie tylko
> nowe strony w menu. Tak działają np. panele Releases i Review Workflows w widoku edycji.

**Zadanie:** w widoku edycji artykułu pokaż panel „Historia zmian” z 5 ostatnimi wpisami
Activity Log dla tego dokumentu.

1. Dodaj route admina `GET /activity-log/logs/:documentId` i metodę serwisu, która filtruje po
   `targetDocumentId`.
2. W `bootstrap(app)` w `admin/src/index.ts` zarejestruj panel:
   ```tsx
   app.getPlugin('content-manager').apis.addEditViewSidePanel([HistoryPanel]);
   ```
   Komponent dostaje `{ model, documentId, ... }` i zwraca `{ title, content }` albo `null`, gdy
   panel ma się nie pokazać (np. `model !== 'api::article.article'` albo nowy dokument bez
   `documentId`).
3. Pobierz dane przez `useFetchClient`, jak na stronie z ćwiczenia 04.

**Sprawdź:** po zapisaniu artykułu i odświeżeniu widoku nowa operacja pojawia się w panelu.

**Dokumentacja:** [Content Manager APIs](https://docs.strapi.io/cms/plugins-development/content-manager-apis)

---

## Dalsza droga

Tematy na osobny dzień. Każdy wymaga więcej niż zmiany w jednym pliku, dlatego są tu tylko jako
kierunek.

| Temat                          | Od czego zacząć                                                                                                                                                                                                      |
|--------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Testy integracyjne**         | Jest + supertest na prawdziwej instancji Strapi (`createStrapi().load()`) z osobną bazą SQLite. Przetestuj `GET /api/articles/search` i politykę `is-owner`. [Testing](https://docs.strapi.io/cms/testing)           |
| **Postgres**                   | `config/database.ts` startera obsługuje już Postgresa: ustaw `DATABASE_CLIENT=postgres` i zmienne `DATABASE_*` w `.env`, bazę uruchom w Dockerze (`docker run -e POSTGRES_PASSWORD=strapi -p 5432:5432 postgres:17`) |
| **Migracje danych**            | Pliki w `database/migrations/` z funkcją `up(knex)` uruchamiają się raz przy starcie, np. uzupełnij `readTime` w istniejących artykułach. [Migrations](https://docs.strapi.io/cms/database-migrations)               |
| **Wyszukiwanie pełnotekstowe** | `$containsi` to `LIKE '%...%'`, więc nie używa indeksu i nie zna odmiany słów. Na Postgresie: kolumna `tsvector` i zapytanie przez `strapi.db.connection` (Knex). Alternatywa: Meilisearch i plugin z Marketplace    |
| **Podgląd treści (Preview)**   | Podgląd szkicu artykułu na frontendzie (np. Next.js) prosto z Content Managera. [Preview](https://docs.strapi.io/cms/features/preview)                                                                               |
| **Webhooki i cache frontendu** | Settings → Webhooks → po `entry.publish` wywołaj endpoint frontendu, który odświeża stronę (revalidation w Next.js)                                                                                                  |
| **Upload do chmury**           | Provider S3 (`@strapi/provider-upload-aws-s3`) zamiast plików w `public/uploads`. [Providers](https://docs.strapi.io/cms/providers)                                                                                  |
| **Publikacja pluginu**         | `npx @strapi/sdk-plugin verify`, potem `npm publish`: plugin z ćwiczenia 04 jako paczka npm                                                                                                                          |
| **Aktualizacje Strapi**        | `npm run upgrade:dry` pokazuje, co zmienią codemody `@strapi/upgrade` przy przejściu na nowszą wersję                                                                                                                |
