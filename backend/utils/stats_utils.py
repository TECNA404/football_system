from django.db.models import Sum, Q, Count, F
from django.db.models.functions import TruncMonth

from matches.models import Match
from tournaments.models import Tournament
from teams.models import Team


def build_goals_by_tournament(tournaments):
    aggregated = (
        Match.objects.filter(tournament__in=tournaments, is_finished=True)
        .values('tournament__name')
        .annotate(home_goals=Sum('home_score'), away_goals=Sum('away_score'))
    )
    return [
        {
            'name': item['tournament__name'],
            'goals': (item['home_goals'] or 0) + (item['away_goals'] or 0),
        }
        for item in aggregated
    ]


def build_activity_over_time(matches):
    activity = (
        matches
        .annotate(month=TruncMonth('played_at'))
        .values('month')
        .annotate(matches=Count('id'))
        .order_by('month')
    )
    return [
        {
            'month': item['month'].isoformat() if item['month'] else None,
            'matches': item['matches'],
        }
        for item in activity
    ]


def count_match_results(matches):
    totals = matches.aggregate(
        home_wins=Count('id', filter=Q(home_score__gt=F('away_score'))),
        away_wins=Count('id', filter=Q(home_score__lt=F('away_score'))),
        draws=Count('id', filter=Q(home_score=F('away_score'))),
    )
    return (
        totals['home_wins'] or 0,
        totals['away_wins'] or 0,
        totals['draws'] or 0,
    )


def get_most_active_tournament(tournaments):
    best = (
        Match.objects.filter(tournament__in=tournaments, is_finished=True)
        .values('tournament__name')
        .annotate(count=Count('id'))
        .order_by('-count')
        .first()
    )
    return best['tournament__name'] if best else 'N/A'


def build_personal_stats(user):
    user_tournaments = Tournament.objects.filter(owner=user)
    matches = Match.objects.filter(tournament__in=user_tournaments, is_finished=True)

    tournaments_count = user_tournaments.count()
    teams_count = Team.objects.filter(owner=user).count()
    matches_count = matches.count()

    totals = matches.aggregate(
        home_goals=Sum('home_score'),
        away_goals=Sum('away_score'),
    )
    total_goals = (totals['home_goals'] or 0) + (totals['away_goals'] or 0)

    home_wins, away_wins, draws = count_match_results(matches)
    win_rate = round((home_wins / matches_count * 100) if matches_count else 0, 1)

    return {
        'tournaments_count': tournaments_count,
        'teams_count': teams_count,
        'matches_count': matches_count,
        'total_goals': total_goals,
        'wins_count': home_wins,
        'draws_count': draws,
        'losses_count': away_wins,
        'win_rate': win_rate,
        'most_active_tournament': get_most_active_tournament(user_tournaments),
        'charts': {
            'goals_by_tournament': build_goals_by_tournament(user_tournaments),
            'activity_over_time': build_activity_over_time(matches),
            'results_distribution': [
                {'name': 'home_win', 'value': home_wins},
                {'name': 'away_win', 'value': away_wins},
                {'name': 'draw', 'value': draws},
            ],
        },
    }


def build_global_stats():
    public_tournaments = Tournament.objects.filter(is_public=True)
    tournaments_count = public_tournaments.count()

    teams_count = Team.objects.filter(
        Q(tournamentteam__tournament__is_public=True)
        | Q(home_matches__tournament__is_public=True)
        | Q(away_matches__tournament__is_public=True)
    ).distinct().count()

    matches = Match.objects.filter(tournament__is_public=True, is_finished=True)
    matches_count = matches.count()

    totals = matches.aggregate(home_goals=Sum('home_score'), away_goals=Sum('away_score'))
    total_goals = (totals['home_goals'] or 0) + (totals['away_goals'] or 0)

    return {
        'tournaments_count': tournaments_count,
        'teams_count': teams_count,
        'matches_count': matches_count,
        'total_goals': total_goals,
    }
