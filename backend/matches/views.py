from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Match
from .serializers import MatchSerializer
from utils.standings_utils import build_standings_from_matches


class MatchViewSet(viewsets.ModelViewSet):
    serializer_class = MatchSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = (
            Match.objects.filter(tournament__owner=self.request.user)
            .select_related("tournament", "home_team", "away_team")
            .order_by("-played_at", "-created_at")
        )
        tournament_id = self.request.query_params.get("tournament")
        if tournament_id:
            qs = qs.filter(tournament_id=tournament_id)
        return qs

    @action(detail=False, methods=["get"], url_path=r"standings/(?P<tournament_id>[^/.]+)")
    def standings(self, request, tournament_id=None):
        matches = Match.objects.filter(
            tournament_id=tournament_id,
            tournament__owner=request.user,
            is_finished=True
        ).select_related("home_team", "away_team")

        result = build_standings_from_matches(
            matches,
            request=request,
            include_logo=False,
            use_head_to_head=True,
        )

        return Response(result)
