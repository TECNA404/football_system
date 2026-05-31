from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Standing
from .serializers import StandingSerializer
from matches.models import Match
from teams.models import Team
from django.db.models import F


class StandingListView(generics.ListAPIView):
    serializer_class = StandingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = Standing.objects.select_related('team', 'tournament')
        tournament_id = self.request.query_params.get('tournament')
        if tournament_id:
            qs = qs.filter(tournament_id=tournament_id)
        return qs.annotate(
            goal_diff=F('goals_for') - F('goals_against')
        ).order_by('-points', '-goal_diff', '-goals_for')

class RecalculateStandingsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        tournament_id = request.data.get('tournament')
        if not tournament_id:
            return Response(
                {"detail": "tournament is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Видаляємо старі записи цього турніру
        Standing.objects.filter(tournament_id=tournament_id).delete()

        # Беремо тільки завершені матчі
        matches = Match.objects.filter(
            tournament_id=tournament_id,
            is_finished=True,
            home_score__isnull=False,
            away_score__isnull=False,
        )

        # Збираємо статистику по кожній команді
        stats = {}

        def get_or_create(team):
            if team.id not in stats:
                stats[team.id] = {
                    "team": team,
                    "games_played": 0,
                    "wins": 0,
                    "draws": 0,
                    "losses": 0,
                    "goals_for": 0,
                    "goals_against": 0,
                    "points": 0,
                }
            return stats[team.id]

        for m in matches:
            home = get_or_create(m.home_team)
            away = get_or_create(m.away_team)

            home["games_played"] += 1
            away["games_played"] += 1
            home["goals_for"]     += m.home_score
            home["goals_against"] += m.away_score
            away["goals_for"]     += m.away_score
            away["goals_against"] += m.home_score

            if m.home_score > m.away_score:
                home["wins"]   += 1; home["points"] += 3
                away["losses"] += 1
            elif m.home_score < m.away_score:
                away["wins"]   += 1; away["points"] += 3
                home["losses"] += 1
            else:
                home["draws"] += 1; home["points"] += 1
                away["draws"] += 1; away["points"] += 1

        # Зберігаємо нові standings
        for team_id, s in stats.items():
            Standing.objects.create(
                tournament_id=tournament_id,
                team=s["team"],
                games_played=s["games_played"],
                wins=s["wins"],
                draws=s["draws"],
                losses=s["losses"],
                goals_for=s["goals_for"],
                goals_against=s["goals_against"],
                goal_difference=s["goals_for"] - s["goals_against"],
                points=s["points"],
            )

        count = Standing.objects.filter(tournament_id=tournament_id).count()
        return Response(
            {"detail": f"Таблицю перераховано. Команд: {count}"},
            status=status.HTTP_200_OK
        )