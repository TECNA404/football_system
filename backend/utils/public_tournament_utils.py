from django.db.models import Q

from teams.models import Team
from utils.serializers import LogoURLMixin


def serialize_public_match(match, request, include_tournament=False):
    data = {
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
    if include_tournament:
        data.update({
            'tournament_id': match.tournament.id,
            'tournament_name': match.tournament.name,
        })
    return data


def build_public_match_list(matches, request, include_tournament=False):
    return [
        serialize_public_match(match, request, include_tournament=include_tournament)
        for match in matches
    ]


def build_public_team_list(request, limit=None):
    teams = Team.objects.filter(
        Q(tournamentteam__tournament__is_public=True)
        | Q(home_matches__tournament__is_public=True)
        | Q(away_matches__tournament__is_public=True)
    ).distinct()

    if limit is not None:
        teams = teams[:limit]

    return [
        {
            'id': team.id,
            'name': team.name,
            'logo': LogoURLMixin.format_logo_url(team, request),
        }
        for team in teams
    ]
