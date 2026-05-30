from rest_framework import serializers
from .models import Tournament, TournamentTeam
from teams.models import Team

class TournamentSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Tournament
        fields = ['id', 'name', 'description', 'owner', 'is_public', 'created_at',]

class TournamentTeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = TournamentTeam
        fields = ['id', 'tournament', 'team', 'added_at',]