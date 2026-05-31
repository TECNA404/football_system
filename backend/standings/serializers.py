from rest_framework import serializers
from .models import Standing
from utils.serializers import LogoURLMixin


class StandingSerializer(serializers.ModelSerializer, LogoURLMixin):
    team_name = serializers.CharField(source='team.name', read_only=True)
    team_logo = serializers.SerializerMethodField()
    tournament_name = serializers.CharField(source='tournament.name', read_only=True)
    goal_difference = serializers.SerializerMethodField()

    class Meta:
        model = Standing
        fields = [
            'id', 'tournament', 'tournament_name',
            'team', 'team_name', 'team_logo',
            'played', 'won', 'drawn', 'lost',
            'goals_for', 'goals_against', 'goal_difference',
            'points',
        ]

    def get_goal_difference(self, obj):
        return obj.goal_difference

    def get_team_logo(self, obj):
        return self.get_logo_url(obj.team)