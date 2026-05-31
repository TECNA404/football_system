from collections import defaultdict

from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import Tournament, TournamentTeam
from .serializers import TournamentSerializer, TournamentTeamSerializer
from matches.models import Match


class TournamentViewSet(viewsets.ModelViewSet):
    serializer_class = TournamentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Tournament.objects.filter(owner=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['get'], url_path='personal-stats')
    def personal_stats(self, request):
        from teams.models import Team
        from django.db.models import Sum, Q, Count
        from django.db.models.functions import TruncMonth

        user = request.user
        
        # Турніри користувача
        tournaments_count = Tournament.objects.filter(owner=user).count()
        
        # Команди користувача
        teams_count = Team.objects.filter(owner=user).count()
        
        # Матчі в турнірах користувача
        user_tournaments = Tournament.objects.filter(owner=user)
        matches = Match.objects.filter(tournament__in=user_tournaments, is_finished=True)
        matches_count = matches.count()

        home_goals = matches.aggregate(Sum('home_score'))['home_score__sum'] or 0
        away_goals = matches.aggregate(Sum('away_score'))['away_score__sum'] or 0
        total_goals = home_goals + away_goals

        # Дані для графіків: Голи по турнірах
        goals_by_tournament = []
        for t in user_tournaments:
            t_matches = Match.objects.filter(tournament=t, is_finished=True)
            t_home = t_matches.aggregate(Sum('home_score'))['home_score__sum'] or 0
            t_away = t_matches.aggregate(Sum('away_score'))['away_score__sum'] or 0
            goals_by_tournament.append({
                'name': t.name,
                'goals': t_home + t_away
            })

        # Дані для графіків: Активність по місяцях (кількість матчів)
        activity_data = matches.annotate(month=TruncMonth('played_at')).values('month').annotate(count=Count('id')).order_by('month')
        formatted_activity = [
            {
                'month': item['month'].isoformat() if item['month'] else None,
                'matches': item['count']
            }
            for item in activity_data
        ]

        # Розподіл результатів (Перемоги/Нічиї/Поразки)
        h_wins = 0
        a_wins = 0
        draws = 0
        for m in matches:
            if m.home_score > m.away_score: h_wins += 1
            elif m.away_score > m.home_score: a_wins += 1
            else: draws += 1
        
        total_finished = matches_count
        win_rate = (h_wins / total_finished * 100) if total_finished > 0 else 0

        # Найактивніший турнір
        most_active_tournament = "N/A"
        max_m = 0
        for t in user_tournaments:
            cnt = Match.objects.filter(tournament=t, is_finished=True).count()
            if cnt > max_m:
                max_m = cnt
                most_active_tournament = t.name

        results_data = [
            {'name': 'home_win', 'value': h_wins},
            {'name': 'away_win', 'value': a_wins},
            {'name': 'draw', 'value': draws},
        ]

        return Response({
            'tournaments_count': tournaments_count,
            'teams_count': teams_count,
            'matches_count': matches_count,
            'total_goals': total_goals,
            'wins_count': h_wins,
            'draws_count': draws,
            'losses_count': a_wins, # В контексті "власника" турніру це просто статистика результатів
            'win_rate': round(win_rate, 1),
            'most_active_tournament': most_active_tournament,
            'charts': {
                'goals_by_tournament': goals_by_tournament,
                'activity_over_time': formatted_activity,
                'results_distribution': results_data
            }
        })


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
        ).select_related('home_team', 'away_team').order_by('-played_at')  # ← було -'played_at'

        from utils.serializers import LogoURLMixin
        data = [
            {
                'id': match.id,
                'home_team': match.home_team.name,
                'home_team_id': match.home_team.id,
                'home_team_logo': LogoURLMixin.format_logo_url(match.home_team, request),
                'away_team': match.away_team.name,
                'away_team_id': match.away_team.id,
                'away_team_logo': LogoURLMixin.format_logo_url(match.away_team, request),
                'home_score': match.home_score,
                'away_score': match.away_score,
                'played_at': match.played_at,
                'is_finished': match.is_finished,
            }
            for match in matches
        ]
        return Response(data)

    @action(detail=False, methods=['get'], url_path='all-matches')
    def all_matches(self, request):
        matches = Match.objects.filter(
            tournament__is_public=True
        ).select_related('home_team', 'away_team', 'tournament').order_by('-played_at')[:10]

        from utils.serializers import LogoURLMixin
        data = [
            {
                'id': match.id,
                'tournament_id': match.tournament.id,
                'tournament_name': match.tournament.name,
                'home_team': match.home_team.name,
                'home_team_logo': LogoURLMixin.format_logo_url(match.home_team, request),
                'away_team': match.away_team.name,
                'away_team_logo': LogoURLMixin.format_logo_url(match.away_team, request),
                'home_score': match.home_score,
                'away_score': match.away_score,
                'played_at': match.played_at,
                'is_finished': match.is_finished,
            }
            for match in matches
        ]
        return Response(data)

    @action(detail=False, methods=['get'], url_path='all-teams')
    def all_teams(self, request):
        # Отримуємо команди з публічних турнірів (через зв'язок)
        from teams.models import Team
        from django.db.models import Q
        
        # Команди, що додані до турніру АБО грали в матчах цього турніру
        teams = Team.objects.filter(
            Q(tournamentteam__tournament__is_public=True) |
            Q(home_matches__tournament__is_public=True) |
            Q(away_matches__tournament__is_public=True)
        ).distinct()[:12]

        from utils.serializers import LogoURLMixin
        data = [
            {
                'id': team.id,
                'name': team.name,
                'logo': LogoURLMixin.format_logo_url(team, request),
            }
            for team in teams
        ]
        return Response(data)

    @action(detail=False, methods=['get'], url_path='global-stats')
    def global_stats(self, request):
        from teams.models import Team
        from django.db.models import Sum, Q

        public_tournaments = Tournament.objects.filter(is_public=True)
        tournaments_count = public_tournaments.count()
        
        # Команди в публічних турнірах
        teams_count = Team.objects.filter(
            Q(tournamentteam__tournament__is_public=True) |
            Q(home_matches__tournament__is_public=True) |
            Q(away_matches__tournament__is_public=True)
        ).distinct().count()

        matches = Match.objects.filter(tournament__is_public=True, is_finished=True)
        matches_count = matches.count()

        home_goals = matches.aggregate(Sum('home_score'))['home_score__sum'] or 0
        away_goals = matches.aggregate(Sum('away_score'))['away_score__sum'] or 0
        total_goals = home_goals + away_goals

        return Response({
            'tournaments_count': tournaments_count,
            'teams_count': teams_count,
            'matches_count': matches_count,
            'total_goals': total_goals,
        })

    @action(detail=True, methods=['get'], url_path='standings')
    def standings(self, request, pk=None):
        matches = Match.objects.filter(
            tournament_id=pk,
            tournament__is_public=True,
            is_finished=True
        ).select_related('home_team', 'away_team')

        table = defaultdict(lambda: {
            'team_id': None,
            'team_name': '',
            'team_logo': None,
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
            if match.home_score is None or match.away_score is None:  # ← захист від None
                continue

            home = table[match.home_team_id]
            away = table[match.away_team_id]

            from utils.serializers import LogoURLMixin
            home['team_id'] = match.home_team_id
            home['team_name'] = match.home_team.name
            home['team_logo'] = LogoURLMixin.format_logo_url(match.home_team, request)
            
            away['team_id'] = match.away_team_id
            away['team_name'] = match.away_team.name
            away['team_logo'] = LogoURLMixin.format_logo_url(match.away_team, request)

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
            key=lambda x: (-x['points'], -x['goal_difference'], -x['goals_for'], x['team_name'])
        )

        return Response(result)