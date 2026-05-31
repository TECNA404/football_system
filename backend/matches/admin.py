from django.contrib import admin
from .models import Match


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "tournament",
        "home_team",
        "away_team",
        "home_score",
        "away_score",
        "is_finished",
        "played_at",
    )
    search_fields = (
        "tournament__name",
        "home_team__name",
        "away_team__name",
    )
    list_filter = ("is_finished", "tournament")