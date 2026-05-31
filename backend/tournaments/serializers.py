from rest_framework import serializers
from .models import Tournament, TournamentTeam
from utils.validators import validate_tournament_year


class TournamentSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    teams = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Tournament
        fields = ['id', 'name', 'description', 'year', 'owner', 'is_public', 'created_at', 'teams']

    def validate_year(self, value):
        if value is not None:
            return validate_tournament_year(value)
        return value


class TournamentTeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = TournamentTeam
        fields = ['id', 'tournament', 'team', 'added_at']