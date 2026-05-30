from rest_framework import serializers
from .models import Match
from tournaments.models import TournamentTeam


class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = [
            'id',
            'home_team',
            'away_team',
            'home_score',
            'away_score',
            'tournament',
            'played_at',
            'is_finished',
            'created_at',
        ]
        read_only_fields = ['created_at']

    def validate(self, attrs):
        tournament = attrs.get('tournament')
        home_team = attrs.get('home_team')
        away_team = attrs.get('away_team')

        if home_team == away_team:
            raise serializers.ValidationError('Home and away team cannot be the same')


        home_exists = TournamentTeam.objects.filter(
            tournament=tournament,
            team=home_team
        ).exists()

        away_exists = TournamentTeam.objects.filter(
            tournament=tournament,
            team=away_team
        ).exists()

        if not home_exists or not away_exists:
            raise serializers.ValidationError('Both home and away teams must be in the tournament')

        return attrs