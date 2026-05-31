from rest_framework import serializers
from .models import Team
from utils.validators import validate_team_name


class TeamSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Team
        fields = ('id', 'name', 'logo','owner', 'created_at',)

    def validate_name(self, value):
        return validate_team_name(value)