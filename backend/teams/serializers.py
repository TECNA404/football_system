from rest_framework import serializers
from .models import Team, Coach, Player
from utils.validators import validate_team_name
from utils.serializers import LogoURLMixin

class CoachSerializer(serializers.ModelSerializer, LogoURLMixin):
    photo_url = serializers.SerializerMethodField()
    team_name = serializers.ReadOnlyField(source='team.name')
    team_logo_url = serializers.SerializerMethodField()
    photo = serializers.CharField(required=False, allow_null=True)

    class Meta:
        model = Coach
        fields = ['id', 'team', 'team_name', 'team_logo_url', 'name', 'experience_years', 'description', 'photo', 'photo_url']

    def get_photo_url(self, obj):
        return self.get_coach_photo_url(obj)

    def get_team_logo_url(self, obj):
        return self.format_logo_url(obj.team, self.context.get('request'))

class PlayerSerializer(serializers.ModelSerializer, LogoURLMixin):
    photo_url = serializers.SerializerMethodField()
    team_name = serializers.ReadOnlyField(source='team.name')
    team_logo_url = serializers.SerializerMethodField()
    photo = serializers.CharField(required=False, allow_null=True)

    class Meta:
        model = Player
        fields = ['id', 'team', 'team_name', 'team_logo_url', 'name', 'number', 'position', 'description', 'photo', 'photo_url']

    def get_photo_url(self, obj):
        return self.get_player_photo_url(obj)

    def get_team_logo_url(self, obj):
        return self.format_logo_url(obj.team, self.context.get('request'))

class TeamSerializer(serializers.ModelSerializer, LogoURLMixin):
    owner = serializers.ReadOnlyField(source='owner.username')
    logo_url = serializers.SerializerMethodField()
    logo = serializers.CharField(required=False, allow_null=True)
    coach = CoachSerializer(read_only=True)
    players = PlayerSerializer(many=True, read_only=True)

    class Meta:
        model = Team
        fields = ['id', 'name', 'owner', 'logo', 'logo_url', 'description', 'created_at', 'coach', 'players']

    def validate_name(self, value):
        return validate_team_name(value)

    def get_logo_url(self, obj):
        # We need to call the method from Mixin explicitly if names match or just let DRF find it.
        # Since LogoURLMixin.get_logo_url(self, team) exists, it should work.
        # But LogoURLMixin.get_logo_url is not named get_logo_url (it is, but it expects 'team' arg).
        # Actually, DRF's SerializerMethodField calls get_<field_name>(self, obj).
        # Our Mixin method is get_logo_url(self, team).
        # So it matches the pattern for logo_url field!
        return super().get_logo_url(obj)