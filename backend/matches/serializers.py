from rest_framework import serializers

from matches.models import Match
from utils.validators import validate_match_teams, validate_match_score


class MatchSerializer(serializers.ModelSerializer):
    tournament_name = serializers.CharField(source="tournament.name", read_only=True)
    home_team_name = serializers.CharField(source="home_team.name", read_only=True)
    away_team_name = serializers.CharField(source="away_team.name", read_only=True)

    class Meta:
        model = Match
        fields = [
            "id",
            "tournament",
            "tournament_name",
            "home_team",
            "home_team_name",
            "away_team",
            "away_team_name",
            "home_score",
            "away_score",
            "played_at",
            "is_finished",
            "created_at",
        ]

    def validate(self, attrs):
        home_team = attrs.get("home_team", getattr(self.instance, "home_team", None))
        away_team = attrs.get("away_team", getattr(self.instance, "away_team", None))
        home_score = attrs.get("home_score", getattr(self.instance, "home_score", None))
        away_score = attrs.get("away_score", getattr(self.instance, "away_score", None))
        is_finished = attrs.get("is_finished", getattr(self.instance, "is_finished", False))

        validate_match_teams(home_team, away_team)
        validate_match_score(home_score, away_score, is_finished)

        return attrs