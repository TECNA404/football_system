from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

from tournaments.models import Tournament
from teams.models import Team


class Match(models.Model):
    tournament = models.ForeignKey(
        Tournament,
        on_delete=models.CASCADE,
        related_name="matches"
    )
    home_team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name="home_matches"
    )
    away_team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name="away_matches"
    )
    home_score = models.IntegerField(null=True, blank=True)
    away_score = models.IntegerField(null=True, blank=True)
    played_at = models.DateTimeField()
    is_finished = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-played_at"]

    def __str__(self):
        home = self.home_score if self.home_score is not None else "?"
        away = self.away_score if self.away_score is not None else "?"
        return f"{self.home_team} {home}:{away} {self.away_team}"


@receiver(post_save, sender=Match)
def on_match_save(sender, instance, **kwargs):
    from utils.standings_utils import update_standings
    update_standings(instance)