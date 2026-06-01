from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import Tournament, TournamentTeam
from .serializers import TournamentSerializer, TournamentTeamSerializer
from matches.models import Match
from utils.public_tournament_utils import (
    build_public_match_list,
    build_public_team_list,
)
from utils.standings_utils import build_standings_from_matches
from utils.stats_utils import build_personal_stats, build_global_stats


class TournamentViewSet(viewsets.ModelViewSet):
    serializer_class = TournamentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Tournament.objects.filter(owner=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['get'], url_path='personal-stats')
    def personal_stats(self, request):
        return Response(build_personal_stats(request.user))


class TournamentTeamViewSet(viewsets.ModelViewSet):
    serializer_class = TournamentTeamSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TournamentTeam.objects.filter(
            tournament__owner=self.request.user
        ).order_by('-added_at')


class PublicTournamentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TournamentSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Tournament.objects.filter(is_public=True).order_by('-created_at')

    @action(detail=True, methods=['get'], url_path='matches')
    def matches(self, request, pk=None):
        matches = Match.objects.filter(
            tournament_id=pk,
            tournament__is_public=True,
        ).select_related('home_team', 'away_team').order_by('-played_at')

        return Response(build_public_match_list(matches, request))

    @action(detail=False, methods=['get'], url_path='all-matches')
    def all_matches(self, request):
        matches = Match.objects.filter(
            tournament__is_public=True
        ).select_related('home_team', 'away_team', 'tournament').order_by('-played_at')[:10]

        return Response(build_public_match_list(matches, request, include_tournament=True))

    @action(detail=False, methods=['get'], url_path='all-teams')
    def all_teams(self, request):
        return Response(build_public_team_list(request, limit=12))

    @action(detail=False, methods=['get'], url_path='global-stats')
    def global_stats(self, request):
        return Response(build_global_stats())

    @action(detail=True, methods=['get'], url_path='standings')
    def standings(self, request, pk=None):
        matches = Match.objects.filter(
            tournament_id=pk,
            tournament__is_public=True,
            is_finished=True
        ).select_related('home_team', 'away_team')

        result = build_standings_from_matches(
            matches,
            request=request,
            include_logo=True,
            use_head_to_head=False,
        )

        return Response(result)