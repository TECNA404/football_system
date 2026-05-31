from rest_framework import serializers
from .models import Match
from tournaments.models import Tournament
from teams.models import Team


class MatchSerializer(serializers.ModelSerializer):
    tournament = serializers.PrimaryKeyRelatedField(
        queryset=Tournament.objects.all()
    )
    home_team = serializers.PrimaryKeyRelatedField(
        queryset=Team.objects.all()
    )
    away_team = serializers.PrimaryKeyRelatedField(
        queryset=Team.objects.all()
    )

    tournament_name = serializers.ReadOnlyField(source="tournament.name")
    home_team_name = serializers.ReadOnlyField(source="home_team.name")
    away_team_name = serializers.ReadOnlyField(source="away_team.name")

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
        read_only_fields = [
            "id",
            "tournament_name",
            "home_team_name",
            "away_team_name",
            "created_at",
        ]

    def validate(self, attrs):
        request = self.context["request"]
        tournament = attrs["tournament"]
        home_team = attrs["home_team"]
        away_team = attrs["away_team"]

        if tournament.owner != request.user:
            raise serializers.ValidationError("You can only use your own tournaments.")

        if home_team.owner != request.user or away_team.owner != request.user:
            raise serializers.ValidationError("You can only use your own teams.")

        if home_team == away_team:
            raise serializers.ValidationError("Home team and away team must be different.")

        tournament_team_ids = set(tournament.teams.values_list("id", flat=True))
        if home_team.id not in tournament_team_ids or away_team.id not in tournament_team_ids:
            raise serializers.ValidationError("Both teams must belong to the selected tournament.")

        if attrs["home_score"] < 0 or attrs["away_score"] < 0:
            raise serializers.ValidationError("Scores cannot be negative.")

        return attrs