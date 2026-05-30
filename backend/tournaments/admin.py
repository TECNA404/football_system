from django.contrib import admin
from .models import Tournament, TournamentTeam


@admin.register(Tournament)
class TournamentAdmin(admin.ModelAdmin):
    list_display = ('id','name', 'owner', 'is_public', 'created_at',)
    search_fields = ('name', 'owner__username',)

@admin.register(TournamentTeam)
class TournamentTeamAdmin(admin.ModelAdmin):
    list_display = ('id','tournament', 'team', 'added_at',)
    search_fields = ('tournament__name', 'team__name',)