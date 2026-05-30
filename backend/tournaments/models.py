from django.db import models
from django.contrib.auth.models import User
from teams.models import Team

class Tournament(models.Model):
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='tournaments'
    )
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    teams = models.ManyToManyField(
        Team,
        through='TournamentTeam',
        related_name='tournaments'
        )

    def __str__(self):
        return self.name

class TournamentTeam(models.Model):
    tournament = models.ForeignKey(
        Tournament,
        on_delete=models.CASCADE,
    )
    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
    )
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('tournament', 'team')

    def __str__(self):
        return f"{self.tournament.name} - {self.team.name}"