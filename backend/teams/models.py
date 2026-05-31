from django.db import models
from django.contrib.auth.models import User

class Team(models.Model):
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='teams'
    )
    name = models.CharField(max_length=100)
    logo = models.CharField(max_length=500, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Coach(models.Model):
    team = models.OneToOneField(Team, on_delete=models.CASCADE, related_name='coach')
    name = models.CharField(max_length=100)
    experience_years = models.PositiveIntegerField(default=0)
    description = models.TextField(blank=True, null=True)
    photo = models.CharField(max_length=500, blank=True, null=True)

    def __str__(self):
        return f"{self.name} (Coach of {self.team.name})"

class Player(models.Model):
    POSITIONS = [
        ('GK', 'Goalkeeper'),
        ('DF', 'Defender'),
        ('MF', 'Midfielder'),
        ('FW', 'Forward'),
    ]
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='players')
    name = models.CharField(max_length=100)
    number = models.PositiveIntegerField()
    position = models.CharField(max_length=2, choices=POSITIONS)
    description = models.TextField(blank=True, null=True)
    photo = models.CharField(max_length=500, blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.number}) - {self.team.name}"
