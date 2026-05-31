from django.contrib import admin
from .models import Standing

@admin.register(Standing)
class StandingAdmin(admin.ModelAdmin):
    list_display = ['tournament', 'team', 'played', 'won', 'drawn', 'lost', 'goals_for', 'goals_against', 'points']
    list_filter = ['tournament']