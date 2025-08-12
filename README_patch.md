# IronBrain — Variant A Patch (no-breaking)

Дата: 2025-08-12

## Что входит
- GitHub Actions для деплоя Supabase (миграции + Edge‑функции)
- Edge‑функция `lang-detect` (определение языка через OpenAI)
- Миграция: колонка `language` в `public.task_comments`
- UI‑компонент `MessageText` с авто‑переводом (через существующую функцию `translate`)
- Хелперы `src/lib/translation.ts`
- Обновление `src/config/app-config.ts` — чтение `VITE_*` с безопасным fallback
- `.env.example` для фронта
- Инструкция по минимальному патчу `TaskChat.tsx` (см. PATCH_INSTRUCTIONS_TaskChat.txt)

## Порядок применения
1) Скопируйте файлы из архива в корень репозитория (сохраняя структуру).
2) Создайте ветку `feature/task-chat-i18n` и закоммитьте изменения.
3) В GitHub → Settings → Secrets and variables → Actions → **New repository secret**:
   - `SUPABASE_PROJECT_REF` — ID проекта Supabase (например: `zqnjgwrvvrqaenzmlvfx`)
   - `SUPABASE_ACCESS_TOKEN` — Personal Access Token Supabase (минимум доступ к проекту)
   - `OPENAI_API_KEY` — ключ OpenAI для Edge‑функций
4) Откройте вкладку **Actions** и запустите вручную workflow **“Supabase - Deploy (staging)”**:
   - проставит секрет `OPENAI_API_KEY` в Supabase,
   - задеплоит функции `translate`, `task-ai-assistant`, `lang-detect`,
   - применит миграцию (добавит `task_comments.language`).
5) Внесите правки в `src/components/TaskChat.tsx` согласно `PATCH_INSTRUCTIONS_TaskChat.txt` (или примените мой PR).
6) Локально создайте `.env` из `.env.example` и подставьте `VITE_SUPABASE_*`.
7) Запустите `npm run dev` и протестируйте чат с пользователями, у которых разные языки интерфейса.
