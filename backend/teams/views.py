from rest_framework import viewsets, permissions, parsers
from rest_framework.exceptions import NotAuthenticated

from .models import Team, Coach, Player
from .serializers import TeamSerializer, CoachSerializer, PlayerSerializer
from utils.media_utils import save_media_or_url


class TeamViewSet(viewsets.ModelViewSet):
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_queryset(self):
        if self.request.method == 'GET' and 'pk' in self.kwargs:
            return Team.objects.all()
        return Team.objects.filter(owner=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        if not self.request.user.is_authenticated:
            raise NotAuthenticated()

        save_media_or_url(
            serializer,
            self.request,
            field_name='logo',
            folder='teams',
            extra_kwargs={'owner': self.request.user}
        )

    def perform_update(self, serializer):
        save_media_or_url(serializer, self.request, field_name='logo', folder='teams')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class CoachViewSet(viewsets.ModelViewSet):
    serializer_class = CoachSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_queryset(self):
        if self.request.method == 'GET' and 'pk' in self.kwargs:
            return Coach.objects.all()
        return Coach.objects.filter(team__owner=self.request.user)

    def perform_create(self, serializer):
        save_media_or_url(serializer, self.request, field_name='photo', folder='coaches')

    def perform_update(self, serializer):
        save_media_or_url(serializer, self.request, field_name='photo', folder='coaches')


class PlayerViewSet(viewsets.ModelViewSet):
    serializer_class = PlayerSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_queryset(self):
        if self.request.method == 'GET' and 'pk' in self.kwargs:
            return Player.objects.all()
        return Player.objects.filter(team__owner=self.request.user)

    def perform_create(self, serializer):
        save_media_or_url(serializer, self.request, field_name='photo', folder='players')

    def perform_update(self, serializer):
        save_media_or_url(serializer, self.request, field_name='photo', folder='players')