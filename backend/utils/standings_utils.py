from standings.models import Standing


def update_standings(match):
    """Пересчитывает standings для обеих команд после сохранения матча."""
    if match.home_score is None or match.away_score is None:
        return

    tournament = match.tournament
    home_team = match.home_team
    away_team = match.away_team

    home_st, _ = Standing.objects.get_or_create(tournament=tournament, team=home_team)
    away_st, _ = Standing.objects.get_or_create(tournament=tournament, team=away_team)

    # сбрасываем старые данные этого матча через пересчёт всех матчей турнира
    _recalculate_tournament(tournament)


def _recalculate_tournament(tournament):
    from matches.models import Match

    # Обнуляем всех участников
    Standing.objects.filter(tournament=tournament).update(
        played=0, won=0, drawn=0, lost=0,
        goals_for=0, goals_against=0, points=0
    )

    matches = Match.objects.filter(
        tournament=tournament,
        home_score__isnull=False,
        away_score__isnull=False
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