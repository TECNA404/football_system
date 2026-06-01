from collections import defaultdict

from standings.models import Standing
from utils.serializers import LogoURLMixin


def update_standings(match):
    if not match.is_finished or match.home_score is None or match.away_score is None:
        return
    _recalculate_tournament(match.tournament)


def _recalculate_tournament(tournament):
    from matches.models import Match

    Standing.objects.filter(tournament=tournament).update(
        played=0, won=0, drawn=0, lost=0,
        goals_for=0, goals_against=0, points=0
    )

    matches = Match.objects.filter(
        tournament=tournament,
        home_score__isnull=False,
        away_score__isnull=False,
    )

    for match in matches:
        home_st, _ = Standing.objects.get_or_create(tournament=tournament, team=match.home_team)
        away_st, _ = Standing.objects.get_or_create(tournament=tournament, team=match.away_team)

        home_st.played += 1
        away_st.played += 1
        home_st.goals_for += match.home_score
        home_st.goals_against += match.away_score
        away_st.goals_for += match.away_score
        away_st.goals_against += match.home_score

        if match.home_score > match.away_score:
            home_st.won += 1
            home_st.points += 3
            away_st.lost += 1
        elif match.home_score < match.away_score:
            away_st.won += 1
            away_st.points += 3
            home_st.lost += 1
        else:
            home_st.drawn += 1
            away_st.drawn += 1
            home_st.points += 1
            away_st.points += 1

        home_st.save()
        away_st.save()


def aggregate_standing_stats(matches):
    stats = {}

    for match in matches:
        if match.home_score is None or match.away_score is None:
            continue

        home = stats.setdefault(match.home_team_id, {
            'team': match.home_team,
            'played': 0,
            'won': 0,
            'drawn': 0,
            'lost': 0,
            'goals_for': 0,
            'goals_against': 0,
            'points': 0,
        })
        away = stats.setdefault(match.away_team_id, {
            'team': match.away_team,
            'played': 0,
            'won': 0,
            'drawn': 0,
            'lost': 0,
            'goals_for': 0,
            'goals_against': 0,
            'points': 0,
        })

        home['played'] += 1
        away['played'] += 1
        home['goals_for'] += match.home_score
        home['goals_against'] += match.away_score
        away['goals_for'] += match.away_score
        away['goals_against'] += match.home_score

        if match.home_score > match.away_score:
            home['won'] += 1
            home['points'] += 3
            away['lost'] += 1
        elif match.home_score < match.away_score:
            away['won'] += 1
            away['points'] += 3
            home['lost'] += 1
        else:
            home['drawn'] += 1
            home['points'] += 1
            away['drawn'] += 1
            away['points'] += 1

    return stats


def build_standings_from_matches(matches, request=None, include_logo=False, use_head_to_head=False):
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
        if match.home_score is None or match.away_score is None:
            continue

        home = table[match.home_team_id]
        away = table[match.away_team_id]

        home['team_id'] = match.home_team_id
        home['team_name'] = match.home_team.name
        away['team_id'] = match.away_team_id
        away['team_name'] = match.away_team.name

        if include_logo:
            home['team_logo'] = LogoURLMixin.format_logo_url(match.home_team, request)
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

    result = list(table.values())
    for item in result:
        item['goal_difference'] = item['goals_for'] - item['goals_against']

    result.sort(key=_standings_sort_key)

    if use_head_to_head:
        return _apply_head_to_head(result, matches)

    return result


def _standings_sort_key(team):
    return (
        -team['points'],
        -team['goal_difference'],
        -team['goals_for'],
        team['team_name'].lower(),
    )


def _apply_head_to_head(standings, matches):
    def base_key(team):
        return (team['points'], team['goal_difference'], team['goals_for'])

    final = []
    i = 0
    while i < len(standings):
        j = i + 1
        while j < len(standings) and base_key(standings[j]) == base_key(standings[i]):
            j += 1

        group = standings[i:j]
        if len(group) > 1:
            group = _sort_by_h2h(group, matches)

        final.extend(group)
        i = j

    return final


def _sort_by_h2h(group, matches):
    ids = {team['team_id'] for team in group}
    h2h = defaultdict(lambda: {'points': 0, 'gd': 0, 'gf': 0})

    for match in matches:
        if match.home_team_id in ids and match.away_team_id in ids:
            if match.home_score is None or match.away_score is None:
                continue

            home = h2h[match.home_team_id]
            away = h2h[match.away_team_id]
            home['gf'] += match.home_score
            home['gd'] += match.home_score - match.away_score
            away['gf'] += match.away_score
            away['gd'] += match.away_score - match.home_score

            if match.home_score > match.away_score:
                home['points'] += 3
            elif match.home_score < match.away_score:
                away['points'] += 3
            else:
                home['points'] += 1
                away['points'] += 1

    group.sort(key=lambda team: (
        -h2h[team['team_id']]['points'],
        -h2h[team['team_id']]['gd'],
        -h2h[team['team_id']]['gf'],
        team['team_name'].lower(),
    ))

    return group
