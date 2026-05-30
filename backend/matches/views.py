from collections import defaultdict
from ctypes.wintypes import tagMSG

from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import Match
from .serializers import MatchSerializer


class MatchViewSet(viewsets.ModelViewSet):
    serializer_class = MatchSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Match.objects.filter(
            tournament__owner=self.request.user
        ).order_by('-played_at', '-created_at')

    @action(detail=False, methods=['get'], url_path='standings/(?P<tournament_id>[^/.]+)')
    def standings(self, request, tournament_id=None):
        matches = Match.objects.filter(
            tournament_id=tournament_id,
            tournament__owner=self.request.user,
            is_finished=True
        ).select_related('home_team', 'away_team')

        table = defaultdict(lambda: {
            'team_id': None,
            'team_name': '',
            'played': 0,
            'wins': 0,
            'draws': 0,
            'losses': 0,
            'goals_for': 0,
            'goals_against': 0,
            'goal_difference': 0,
            'points': 0,
        })

        for match in matches:
            home = table[match.home_team_id]
            away = table[match.away_team_id]

            home['team_id'] = match.home_team_id
            home['team_name'] = match.home_team.name
            away['team_id'] = match.away_team_id
            away['team_name'] = match.away_team.name

            home['played'] += 1
            away['played'] += 1

            home['goals_for'] += match.home_score
            home['goals_against'] += match.away_score
            away['goals_for'] += match.away_score
            away['goals_against'] += match.home_score

            if match.home_score > match.away_score:
                home['wins'] += 1
                home['points'] += 3
                away['losses'] += 1
            elif match.home_score < match.away_score:
                away['wins'] += 1
                away['points'] += 3
                home['losses'] += 1
            else:
                home['draws'] += 1
                home['points'] += 1
                away['draws'] += 1
                away['points'] += 1

        result = []
        for item in table.values():
            item['goal_difference'] = item['goals_for'] - item['goals_against']
            result.append(item)

        result.sort(
            key=lambda x: (-x['points'], -x['goal_difference'],-x['goals_for'], x['team_name'])
        )
        return Response(result)