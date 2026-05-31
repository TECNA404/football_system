import os
import django
import random
import requests
from io import BytesIO
from django.core.files import File
from datetime import datetime, timedelta
from django.utils import timezone

# Настройка окружения Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from teams.models import Team, Coach, Player
from tournaments.models import Tournament, TournamentTeam
from matches.models import Match
from standings.models import Standing

def download_image(url):
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            return BytesIO(response.content)
    except Exception as e:
        print(f"Помилка завантаження зображення {url}: {e}")
    return None

def seed_data():
    print("Генерація тестових даних...")
    
    # 1. Створення користувача, якщо його немає
    username = 'TECNA'
    email = 'tecna@example.com'
    password = 'Xthyjdf2004'
    
    user, created = User.objects.get_or_create(username=username, defaults={'email': email})
    if created:
        user.set_password(password)
        user.save()
        print(f"Створено користувача: {username}")
    else:
        print(f"Користувач {username} вже існує")

    # 2. Створення команд
    team_names = [
        "йода", "Манчестер", "Спартак", "Barsa", 
        "Chornomorets Odesa", "Dynamo Kyiv", "FC Minaj", "FC Oleksandriya",
        "Kolos Kovalivka", "Kryvbas Kryvyi Rih", "LNZ Cherkasy", "Metalist 1925",
        "Obolon Kyiv", "Polissya Zhytomyr", "Rukh Lviv", "SC Dnipro-1",
        "Shakhtar Donetsk", "SlavBread", "Veres Rivne", "Vorskla Poltava", "Zorya Luhansk"
    ]
    teams = []
    
    # Списки URL-ів для більшої різноманітності (Unsplash)
    football_logos = [
        "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=200&h=200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=200&h=200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=200&h=200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=200&h=200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?q=80&w=200&h=200&auto=format&fit=crop"
    ]
    
    coach_photos = [
        "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=200&h=200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&h=200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&h=200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&h=200&auto=format&fit=crop"
    ]

    player_placeholders = {
        'GK': "https://images.unsplash.com/photo-1526232310673-59c9c8155837?q=80&w=200&h=200&auto=format&fit=crop",
        'DF': "https://images.unsplash.com/photo-1544606111-883015b40462?q=80&w=200&h=200&auto=format&fit=crop",
        'MF': "https://images.unsplash.com/photo-1511886929837-354d827aae26?q=80&w=200&h=200&auto=format&fit=crop",
        'FW': "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=200&h=200&auto=format&fit=crop",
    }

    for name in team_names:
        team, created = Team.objects.get_or_create(name=name, owner=user)
        teams.append(team)
        
        # Завжди оновлюємо на прямі URL для тестів
        team.logo = random.choice(football_logos)
        team.save()

        # 3. Створення/Оновлення тренера
        coach_names = ["Микола Павлов", "Юрій Вернидуб", "Віктор Скрипник", "Сергій Ребров", "Олександр Шовковський", "Карло Анчелотті", "Хосеп Гвардіола"]
        coach, created = Coach.objects.get_or_create(
            team=team,
            defaults={
                'name': random.choice(coach_names),
                'experience_years': random.randint(5, 25),
                'photo': random.choice(coach_photos)
            }
        )
        if not created:
            coach.photo = random.choice(coach_photos)
            coach.save()

        # 4. Створення/Оновлення гравців
        if not Player.objects.filter(team=team).exists():
            first_names = ["Андрій", "Микола", "Сергій", "Олександр", "Іван", "Володимир", "Дмитро", "Артем", "Віталій", "Юрій", "Тарас", "Михайло", "Віктор"]
            last_names = ["Шевченко", "Ярмоленко", "Степаненко", "Матвієнко", "Зінченко", "Мудрик", "Циганков", "Забарний", "Миколенко", "Лунін", "Довбик", "Бражко", "Судаков"]
            positions_list = ['GK', 'DF', 'DF', 'DF', 'DF', 'MF', 'MF', 'MF', 'FW', 'FW', 'FW']
            
            for i in range(11):
                pos = positions_list[i]
                Player.objects.create(
                    team=team,
                    name=f"{random.choice(first_names)} {random.choice(last_names)}",
                    number=random.randint(1, 99),
                    position=pos,
                    photo=player_placeholders.get(pos)
                )
            print(f"Додано 11 гравців до команди {name}")
        else:
            # Оновлюємо фото існуючим
            for player in Player.objects.filter(team=team):
                player.photo = player_placeholders.get(player.position)
                player.save()

    # 5. Створення турнірів
    tournament_data = [
        {"name": "Прем'єр Ліга України", "year": 2024, "desc": "Головний футбольний турнір України"},
        {"name": "Кубок України", "year": 2024, "desc": "Національний кубковий турнір"},
        {"name": "Зимовий Кубок", "year": 2025, "desc": "Товариський зимовий турнір"}
    ]

    for t_info in tournament_data:
        tournament, created = Tournament.objects.get_or_create(
            name=t_info["name"],
            owner=user,
            defaults={
                "description": t_info["desc"],
                "year": t_info["year"],
                "is_public": True
            }
        )
        if created:
            print(f"Створено турнір: {tournament.name}")
            
            # Додаємо команди до турніру
            selected_teams = random.sample(teams, min(len(teams), 6))
            for team in selected_teams:
                TournamentTeam.objects.get_or_create(tournament=tournament, team=team)
                Standing.objects.get_or_create(tournament=tournament, team=team)
            
            # 6. Створення матчів (деякі зіграні, деякі майбутні)
            now = timezone.now()
            for i in range(len(selected_teams)):
                for j in range(i + 1, len(selected_teams)):
                    home = selected_teams[i]
                    away = selected_teams[j]
                    
                    is_past = random.choice([True, False])
                    if is_past:
                        played_at = now - timedelta(days=random.randint(1, 30), hours=random.randint(1, 23))
                        home_score = random.randint(0, 4)
                        away_score = random.randint(0, 4)
                        is_finished = True
                    else:
                        played_at = now + timedelta(days=random.randint(1, 30), hours=random.randint(1, 23))
                        home_score = None
                        away_score = None
                        is_finished = False
                        
                    Match.objects.create(
                        tournament=tournament,
                        home_team=home,
                        away_team=away,
                        home_score=home_score,
                        away_score=away_score,
                        played_at=played_at,
                        is_finished=is_finished
                    )
            print(f"Створено матчі для турніру {tournament.name}")

    print("Тестові дані успішно завантажені!")

if __name__ == "__main__":
    seed_data()
