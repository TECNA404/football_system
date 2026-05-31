import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "navbar": {
        "home": "Home",
        "tournaments": "Tournaments",
        "teams": "Teams",
        "matches": "Matches",
        "standings": "Standings",
        "login": "Login",
        "register": "Register",
        "logout": "Logout",
        "public": "Public Tournaments",
        "statistics": "Statistics"
      },
      "home": {
        "hero_title": "Football System",
        "hero_subtitle": "Manage football tournaments like a pro. Automation, statistics and results in one place.",
        "welcome": "Welcome, {{name}}!",
        "my_tournaments": "My Tournaments",
        "schedule": "Schedule",
        "view_tournaments": "View Tournaments",
        "recent_matches": "Recent Matches",
        "latest_tournaments": "Latest Tournaments",
        "participating_teams": "Participating Teams",
        "view_all": "View All",
        "join_best_competitions": "Join the best competitions",
        "no_description": "No description",
        "active_tournaments": "Public tournaments currently running",
        "played_matches": "Total matches in public tournaments",
        "registered_teams": "Teams participating in public leagues",
        "why_choose_us": "Why choose us?",
        "reliability": "Reliability",
        "reliability_text": "Your data is safe. We ensure stable system operation 24/7.",
        "speed": "Speed",
        "speed_text": "Instant updates of tables and match results after each game.",
        "total_goals": "Total Goals",
        "goals_scored": "Goals scored in matches"
      },
      "stats": {
        "title": "My Statistics",
        "subtitle": "Track your activity and achievements as a tournament manager.",
        "my_tournaments_desc": "Total tournaments created by you",
        "my_teams_desc": "Teams managed in your account",
        "my_matches_desc": "Finished matches in your leagues",
        "my_goals_desc": "Total goals scored in your matches",
        "activity_overview": "Activity Overview",
        "charts_coming_soon": "Detailed visual analytics coming soon",
        "goals_by_tournament": "Goals by Tournament",
        "match_activity": "Match Activity",
        "results_distribution": "Results Distribution",
        "home_win": "Home Win",
        "away_win": "Away Win",
        "draw": "Draw",
        "summary": "Summary Metrics",
        "avg_goals_per_match": "Average goals per match",
        "avg_teams_per_tournament": "Average teams per tournament",
        "win_rate": "Home Win Rate",
        "most_active_tournament": "Most Active Tournament",
        "wins": "Wins",
        "draws": "Draws",
        "losses": "Losses",
        "achievements": "Achievements",
        "ach_organizer": "Tournament Organizer",
        "ach_club_owner": "Club Owner",
        "ach_goal_machine": "Goal Machine",
        "ach_veteran": "Match Veteran",
        "unlocked": "Unlocked",
        "locked": "Locked"
      },
      "common": {
        "search": "Search...",
        "filter": "Filter",
        "sort": "Sort",
        "add": "Add",
        "edit": "Edit",
        "delete": "Delete",
        "save": "Save",
        "cancel": "Cancel",
        "loading": "Loading...",
        "actions": "Actions",
        "all": "All",
        "error": "Error occurred",
        "success": "Success",
        "created": "Created"
      },
      "matches": {
        "add_match": "Add Match",
        "tournament": "Tournament",
        "home_team": "Home Team",
        "away_team": "Away Team",
        "date": "Date and Time",
        "status": "Status",
        "scheduled": "Scheduled",
        "finished": "Finished",
        "score": "Score",
        "no_matches": "No matches found.",
        "enter_score": "Enter Score"
      },
      "teams": {
        "title": "Teams",
        "subtitle": "Manage and organize your football clubs",
        "add_team": "Add Team",
        "team_name": "Team Name",
        "logo": "Logo",
        "players": "Players",
        "coach": "Coach",
        "no_teams": "No teams found."
      },
      "tournaments": {
        "title": "Tournaments",
        "add_tournament": "Add Tournament",
        "name": "Name",
        "year": "Year",
        "description": "Description",
        "is_public": "Public",
        "public": "Public Status",
        "no_tournaments": "No tournaments found."
      },
      "auth": {
        "login_title": "Login",
        "register_title": "Registration",
        "email": "Email address",
        "username": "Username",
        "password": "Password",
        "login_btn": "Login",
        "register_btn": "Register",
        "no_account": "Don't have an account?",
        "has_account": "Already have an account?",
        "error": "Authentication error"
      }
    }
  },
  uk: {
    translation: {
      "navbar": {
        "home": "Головна",
        "tournaments": "Турніри",
        "teams": "Команди",
        "matches": "Матчі",
        "standings": "Таблиці",
        "login": "Увійти",
        "register": "Реєстрація",
        "logout": "Вийти",
        "public": "Публічні турніри",
        "statistics": "Статистика"
      },
      "home": {
        "hero_title": "Football System",
        "hero_subtitle": "Керуйте футбольними турнірами як професіонал. Автоматизація, статистика та результати в одному місці.",
        "welcome": "Привіт, {{name}}!",
        "my_tournaments": "Мої турніри",
        "schedule": "Розклад",
        "view_tournaments": "Переглянути турніри",
        "recent_matches": "Останні матчі",
        "latest_tournaments": "Останні турніри",
        "participating_teams": "Команди-учасники",
        "view_all": "Дивитись всі",
        "join_best_competitions": "Приєднуйтесь до найкращих змагань",
        "no_description": "Без опису",
        "active_tournaments": "Публічні турніри, що зараз тривають",
        "played_matches": "Всього матчів у публічних турнірах",
        "registered_teams": "Команд беруть участь у публічних лігах",
        "why_choose_us": "Чому обирають нас?",
        "reliability": "Надійність",
        "reliability_text": "Ваші дані в безпеці. Ми забезпечуємо стабільну роботу системи 24/7.",
        "speed": "Швидкість",
        "speed_text": "Миттєве оновлення таблиць та результатів матчів після кожної гри.",
        "total_goals": "Всього голів",
        "goals_scored": "Голів забито у матчах"
      },
      "stats": {
        "title": "Моя статистика",
        "subtitle": "Відстежуйте свою активність та досягнення як організатор турнірів.",
        "my_tournaments_desc": "Всього створених вами турнірів",
        "my_teams_desc": "Команд під вашим керуванням",
        "my_matches_desc": "Завершених матчів у ваших лігах",
        "my_goals_desc": "Всього голів у ваших матчах",
        "activity_overview": "Огляд активності",
        "charts_coming_soon": "Детальна візуальна аналітика незабаром",
        "goals_by_tournament": "Голи по турнірах",
        "match_activity": "Активність матчів",
        "results_distribution": "Розподіл результатів",
        "home_win": "Домашня перемога",
        "away_win": "Перемога гостей",
        "draw": "Нічия",
        "summary": "Підсумкові показники",
        "avg_goals_per_match": "Середня кількість голів за матч",
        "avg_teams_per_tournament": "Середня кількість команд на турнір",
        "win_rate": "Відсоток домашніх перемог",
        "most_active_tournament": "Найактивніший турнір",
        "wins": "Перемоги",
        "draws": "Нічиї",
        "losses": "Поразки",
        "achievements": "Досягнення",
        "ach_organizer": "Організатор турнірів",
        "ach_club_owner": "Власник клубів",
        "ach_goal_machine": "Машина голів",
        "ach_veteran": "Ветеран матчів",
        "unlocked": "Розблоковано",
        "locked": "Заблоковано"
      },
      "common": {
        "search": "Пошук...",
        "filter": "Фільтр",
        "sort": "Сортування",
        "add": "Додати",
        "edit": "Редагувати",
        "delete": "Видалити",
        "save": "Зберегти",
        "cancel": "Скасувати",
        "loading": "Завантаження...",
        "actions": "Дії",
        "all": "Всі",
        "error": "Виникла помилка",
        "success": "Успішно",
        "created": "Створено"
      },
      "matches": {
        "add_match": "Додати матч",
        "tournament": "Турнір",
        "home_team": "Домашня команда",
        "away_team": "Гостьова команда",
        "date": "Дата та час",
        "status": "Статус",
        "scheduled": "Заплановані",
        "finished": "Завершені",
        "score": "Рахунок",
        "no_matches": "Матчів не знайдено.",
        "enter_score": "Ввести рахунок"
      },
      "teams": {
        "title": "Команди",
        "subtitle": "Керуйте та організовуйте свої футбольні клуби",
        "add_team": "Додати команду",
        "team_name": "Назва команди",
        "logo": "Логотип",
        "players": "Гравців",
        "coach": "Тренер",
        "no_teams": "Команд не знайдено."
      },
      "tournaments": {
        "title": "Турніри",
        "add_tournament": "Додати турнір",
        "name": "Назва",
        "year": "Рік",
        "description": "Опис",
        "is_public": "Публічний",
        "public": "Публічний статус",
        "no_tournaments": "Турнірів не знайдено."
      },
      "auth": {
        "login_title": "Вхід",
        "register_title": "Реєстрація",
        "email": "Email адреса",
        "username": "Ім'я користувача",
        "password": "Пароль",
        "login_btn": "Увійти",
        "register_btn": "Зареєструватися",
        "no_account": "Ще не маєте акаунту?",
        "has_account": "Вже є акаунт?",
        "error": "Помилка автентифікації"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'uk',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
