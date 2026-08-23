# Proposal: sync-landing-copy-with-docs

## Why

Документация исходного проекта в `docs/` обновлена до новой редакции (протокол MCP 2026-07-28 stateless с обязательными заголовками и mode A `tools/call`; CONSENT переопределён как «полный круг согласия»; появились `get_playbook`, `list_pending_members`, `get_proposal`, `updated_since`, канал `_meta`-авторизации; каталог SSE-событий расширен до восьми событий; MVP-чекпоинт выполняется на остановленном движке). Публичные тексты лендинга писались под прежнюю редакцию и теперь содержат утверждения, прямо противоречащие документации, а демонстрационный терминал показывает несуществующий формат запроса.

## What Changes

- **Карточка CONSENT** (`app/page.tsx`, `CONSENSUS_MODELS`): заменить «отсутствие возражений» на «полный круг согласия» — PASSED при `N = 0 ∧ Y > 0 ∧ C ≥ H`, EXPIRED при незамкнутом круге по таймауту; указать допустимость только `EQUAL`.
- **Примечание MAJORITY**: убрать «Abstention counts as a NO» — у модели нет варианта ABSTAIN (YES/NO); неявка трактуется как ПРОТИВ при пороге от полной силы T.
- **Формула EXPIRED у QUORUM_PERCENTAGE**: уточнить, что недобор кворума закрывается по таймеру.
- **Легенда переменных консенсуса**: добавить `C` (число проголосовавших) и `H` (замороженное число участников при создании), без которых формулы CONSENT нечитаемы.
- **Список SSE-событий** в карточке «Real-time SSE events»: актуальный каталог из восьми событий (`join_requested`, `member_left`, `admin_transferred`, `organization_dissolved`).
- **Гарантия «Backup-ready»**: убрать «no service downtime required» — по docs/13 §3 в MVP команда `voterpool checkpoint` выполняется на остановленном движке (конфликт лока); онлайн-снапшоты — Enterprise.
- **Демо-терминал** (`components/Terminal.tsx`): привести curl-сцены к контракту docs/05 §1.0 — заголовки `MCP-Protocol-Version: 2026-07-28`, `Mcp-Method: tools/call`, `Mcp-Name`, `Authorization: Bearer` (кроме анонимного `register_agent`), тело JSON-RPC 2.0 mode A; формат токена `voterpool_sec_…`.
- **Точечные уточнения формулировок**: запрет связки CONSENT + SHARES в карточке про веса голосов; упоминание stateless-ядра (без handshake/сессий) и анонимных `get_playbook`/`tools/list` в карточке MCP-native — там, где это не меняет структуру страницы.

Не меняются: структура секций, дизайн, стековые слои (9 CF подтверждены), статистика hero (50k cast_vote/s, 3 модели, 18 инструментов — сходится с docs/05), шаги HowItWorks, гарантии кроме Backup-ready, метаданные layout.tsx.

## Capabilities

### New Capabilities

- `landing-copy`: требования к достоверности публичных текстов одностраничного лендинга — каждое фактическое утверждение (формулы, протокол, события, гарантии, код в демо) должно соответствовать текущей редакции `docs/`.

### Modified Capabilities

## Impact

- `app/page.tsx` — массивы `CONSENSUS_MODELS`, `guarantees`, `features`, блок легенды, тексты секций.
- `components/Terminal.tsx` — сцены `SCENES` (curl-запросы/ответы).
- Сборка/экспорт не затронуты: изменения статичны, проверяются `yarn lint`, `npx tsc --noEmit`, `yarn build`.
