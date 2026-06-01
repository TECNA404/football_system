from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Standing
from .serializers import StandingSerializer
from matches.models import Match
from utils.standings_utils import aggregate_standing_stats


class StandingListView(generics.ListAPIView):
    serializer_class = StandingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = Standing.objects.select_related('team', 'tournament')
        tournament_id = self.request.query_params.get('tournament')
        if tournament_id:
            qs = qs.filter(tournament_id=tournament_id)
        return qs.order_by('-points', '-goals_for')

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

        stats = aggregate_standing_stats(matches)

        for data in stats.values():
            Standing.objects.create(
                tournament_id=tournament_id,
                team=data['team'],
                played=data['played'],
                won=data['won'],
                drawn=data['drawn'],
                lost=data['lost'],
                goals_for=data['goals_for'],
                goals_against=data['goals_against'],
                points=data['points'],
            )

        count = Standing.objects.filter(tournament_id=tournament_id).count()
        return Response(
            {"detail": f"Таблицю перераховано. Команд: {count}"},
            status=status.HTTP_200_OK
        )