from rest_framework import serializers
from .models import Team


class TeamSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Team
        fields = ('id', 'name', 'logo','owner', 'created_at',)