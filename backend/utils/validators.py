from datetime import datetime

from rest_framework import serializers


def validate_team_name(value):
    """
    Перевіряє назву команди.
    """
    if not value or not value.strip():
        raise serializers.ValidationError("Назва команди не може бути порожньою.")
    if len(value.strip()) < 2:
        raise serializers.ValidationError("Назва команди повинна містити щонайменше 2 символи.")
    return value.strip()


def validate_tournament_year(value):
    """
    Перевіряє коректність року турніру.
    """
    current_year = datetime.now().year
    if value < 1900 or value > current_year + 1:
        raise serializers.ValidationError("Вказано некоректний рік турніру.")
    return value


def validate_match_teams(home_team, away_team):
    """
    Перевіряє, що команда не грає сама проти себе.
    """
    if home_team == away_team:
        raise serializers.ValidationError("Домашня та гостьова команди не можуть бути однаковими.")


def validate_match_score(home_score, away_score, is_finished=False):
    """
    Перевіряє коректність рахунку матчу.
    """
    if is_finished:
        if home_score is None or away_score is None:
            raise serializers.ValidationError("Для завершеного матчу потрібно вказати рахунок.")

    if home_score is not None and home_score < 0:
        raise serializers.ValidationError("Рахунок домашньої команди не може бути від'ємним.")

    if away_score is not None and away_score < 0:
        raise serializers.ValidationError("Рахунок гостьової команди не може бути від'ємним.")