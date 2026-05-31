from rest_framework import serializers
from .models import Standing


class StandingSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(source='team.name', read_only=True)
    tournament_name = serializers.CharField(source='tournament.name', read_only=True)
    goal_difference = serializers.SerializerMethodField()

    class Meta:
        model = Standing
        fields = [
            'id', 'tournament', 'tournament_name',
            'team', 'team_name',
            'played', 'won', 'drawn', 'lost',
            'goals_for', 'goals_against', 'goal_difference',
            'points',
        ]

    def get_goal_difference(self, obj):
        return obj.goal_difference