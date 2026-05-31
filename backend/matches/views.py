from collections import defaultdict
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Match
from .serializers import MatchSerializer


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

        table = defaultdict(lambda: {
            "team_id": None,
            "team_name": "",
            "played": 0,
            "wins": 0,
            "draws": 0,
            "losses": 0,
            "goals_for": 0,
            "goals_against": 0,
            "goal_difference": 0,
            "points": 0,
        })

        for match in matches:
            if match.home_score is None or match.away_score is None:
                continue

            h = table[match.home_team_id]
            a = table[match.away_team_id]

            h["team_id"] = match.home_team_id
            h["team_name"] = match.home_team.name
            a["team_id"] = match.away_team_id
            a["team_name"] = match.away_team.name

            h["played"] += 1
            a["played"] += 1
            h["goals_for"] += match.home_score
            h["goals_against"] += match.away_score
            a["goals_for"] += match.away_score
            a["goals_against"] += match.home_score

            if match.home_score > match.away_score:
                h["wins"] += 1; h["points"] += 3; a["losses"] += 1
            elif match.home_score < match.away_score:
                a["wins"] += 1; a["points"] += 3; h["losses"] += 1
            else:
                h["draws"] += 1; h["points"] += 1
                a["draws"] += 1; a["points"] += 1

        result = list(table.values())
        for item in result:
            item["goal_difference"] = item["goals_for"] - item["goals_against"]

        def sort_key(team):
            return (
                -team["points"],
                -team["goal_difference"],
                -team["goals_for"],
                team["team_name"].lower(),  # алфавіт як останній критерій
            )

        result.sort(key=sort_key)

        # --- Tiebreaker: особисті зустрічі між командами з однаковими очками ---
        result = _apply_head_to_head(result, matches)

        return Response(result)


def _apply_head_to_head(standings, matches):
    """
    Серед команд що мають однакові очки, різницю голів і голи —
    сортуємо по результатах особистих зустрічей між ними.
    """
    from itertools import groupby

    def base_key(t):
        return (t["points"], t["goal_difference"], t["goals_for"])

    final = []
    i = 0
    while i < len(standings):
        # Знаходимо групу з однаковими показниками
        j = i + 1
        while j < len(standings) and base_key(standings[j]) == base_key(standings[i]):
            j += 1

        group = standings[i:j]

        if len(group) > 1:
            group = _sort_by_h2h(group, matches)

        final.extend(group)
        i = j

    return final


def _sort_by_h2h(group, all_matches):
    """Сортує групу команд по очках в особистих зустрічах між собою."""
    ids = {t["team_id"] for t in group}

    h2h = defaultdict(lambda: {"points": 0, "gd": 0, "gf": 0})

    for match in all_matches:
        if match.home_team_id in ids and match.away_team_id in ids:
            if match.home_score is None or match.away_score is None:
                continue
            h = h2h[match.home_team_id]
            a = h2h[match.away_team_id]

            h["gf"] += match.home_score
            h["gd"] += match.home_score - match.away_score
            a["gf"] += match.away_score
            a["gd"] += match.away_score - match.home_score

            if match.home_score > match.away_score:
                h["points"] += 3
            elif match.home_score < match.away_score:
                a["points"] += 3
            else:
                h["points"] += 1
                a["points"] += 1

    group.sort(key=lambda t: (
        -h2h[t["team_id"]]["points"],
        -h2h[t["team_id"]]["gd"],
        -h2h[t["team_id"]]["gf"],
        t["team_name"].lower(),
    ))

    return group
