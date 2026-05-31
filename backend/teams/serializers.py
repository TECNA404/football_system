from rest_framework import serializers
from .models import Team
from utils.validators import validate_team_name


class TeamSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = Team
        fields = ['id', 'name', 'owner', 'logo', 'logo_url', 'created_at']
        extra_kwargs = {'logo': {'required': False, 'write_only': True}}

    def validate_name(self, value):
        return validate_team_name(value)

    def get_logo_url(self, obj):
        if obj.logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.logo.url)
            return obj.logo.url
        return None