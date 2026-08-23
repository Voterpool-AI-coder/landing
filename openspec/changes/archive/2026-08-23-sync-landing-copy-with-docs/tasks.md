# Tasks: sync-landing-copy-with-docs

## 1. Секция «Math» — формулы консенсуса (`app/page.tsx`)

- [x] 1.1 Дополнить блок-легенду переменными `C` (число проголосовавших голов) и `H` (замороженное `eligible_voters_at_creation`) так, чтобы каждый символ формул карточек был определён; проверить по docs/02 §1.4 и визуально в браузере (light/dark)
- [x] 1.2 Переписать примечание MAJORITY: убрать «Abstention counts as a NO», заменить на «неявка = голос против, порог от полной силы T; варианты только YES/NO»; сверить с docs/02 §1.4.1 и §1.1.1
- [x] 1.3 Уточнить строку EXPIRED у QUORUM_PERCENTAGE — недобор кворума фиксируется при истечении времени; сверить с docs/02 §1.4.2
- [x] 1.4 Переписать карточку CONSENT: tagline «Full circle of consent», PASSED `N = 0 ∧ Y > 0 ∧ C ≥ H`, REJECTED `N > 0`, EXPIRED «незамкнутый круг к таймауту (включая нулевую явку и все-ABSTAIN)», пометка «EQUAL only»; сверить с docs/02 §1.4.3

## 2. Карточки Features (`app/page.tsx`, массив `features`)

- [x] 2.1 Обновить перечисление SSE-событий в карточке «Real-time SSE events»: включить `join_requested` (и/или упомянуть полный каталог из восьми событий docs/06), сохранив GET /mcp/events, all-orgs, FIFO, 15s heartbeat
- [x] 2.2 В карточке «Voting power & weights» добавить запрет связки CONSENT + SHARES (-32005) одной фразой; сверить с docs/02 §1.2.2
- [x] 2.3 В карточке «MCP-native interface» уточнить формулировку под stateless-ядро MCP 2026-07-28 (без handshake/сессий, анонимные tools/list и get_playbook), не меняя chip и иконку; сверить с docs/05 §1.0, §1.18

## 3. Гарантии («Reliability», массив `guarantees`)

- [x] 3.1 Переписать текст «Backup-ready»: консистентный point-in-time снапшот через RocksDB Checkpoints командой `voterpool checkpoint`; убрать обещание «no service downtime required», указав выполнение на остановленном движке или копии каталога данных; сверить с docs/13 §3–§5

## 4. Демо-терминал hero (`components/Terminal.tsx`, массив `SCENES`)

- [x] 4.1 Привести все три сцены к режиму A docs/05 §1.0: заголовки `MCP-Protocol-Version: 2026-07-28`, `Mcp-Method: tools/call`, `Mcp-Name`; тело `{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{...}}`; переносы длинных заголовков через `\`; убедиться, что строки помещаются в контейнер (`overflow-x-auto`, min-height) и темп печати остаётся читаемым
- [x] 4.2 В сцене `register_agent` не показывать Authorization; в сценах `create_organization` и `cast_vote` добавить `Authorization: Bearer voterpool_sec_…`; выровнять выводы с контрактами: `create_organization` → `role:"ADMIN"`, `voting_power:100.0`; `cast_vote` PASSED → `proposal_status:"PASSED"`, `current_yes_power:60.0`; сверить с docs/05 §1.1, §1.2, §1.7
- [x] 4.3 Прогнать анимацию терминала в dev-сервере: подсветка TOKEN_RE корректно размечает новые заголовки/JSON, ни одна сцена не выходит за границы окна (desktop и mobile ширины)

## 5. Сквозная проверка

- [x] 5.1 Прогнать `yarn lint`, `npx tsc --noEmit`, `yarn build` — без ошибок; статический экспорт `out/` собирается
- [x] 5.2 Построчно выверить изменённые места против чек-листа источников: docs/02 §1.4, docs/05 §1.0/§1.1/§1.2/§1.7/§1.18, docs/06 §1.3, docs/13 §3; пройтись по сценариям дельта-спеки specs/landing-copy/spec.md как по тест-листу и убедиться, что каждый THEN выполняется на отрендеренной странице
