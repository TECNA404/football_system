from rest_framework import viewsets, permissions, parsers
from .models import Team, Coach, Player
from .serializers import TeamSerializer, CoachSerializer, PlayerSerializer


class TeamViewSet(viewsets.ModelViewSet):
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_queryset(self):
        if self.request.method == 'GET' and 'pk' in self.kwargs:
            return Team.objects.all()
        return Team.objects.filter(owner=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        # Перевірка наявності власника
        if not self.request.user.is_authenticated:
             from rest_framework.exceptions import NotAuthenticated
             raise NotAuthenticated()
        
        logo_file = self.request.FILES.get('logo')
        if logo_file:
            from django.core.files.storage import default_storage
            import os
            filename = f'teams/{logo_file.name}'
            if default_storage.exists(filename):
                 import time
                 base, ext = os.path.splitext(logo_file.name)
                 filename = f'teams/{base}_{int(time.time())}{ext}'
            path = default_storage.save(filename, logo_file)
            serializer.save(owner=self.request.user, logo=path)
        else:
            # Check for logo URL in data
            logo_url = self.request.data.get('logo')
            if isinstance(logo_url, str) and (logo_url.startswith('http') or '/' in logo_url):
                serializer.save(owner=self.request.user, logo=logo_url)
            else:
                serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        try:
            logo_file = self.request.FILES.get('logo')
            if logo_file:
                from django.core.files.storage import default_storage
                import os
                # Avoid filename collisions
                filename = f'teams/{logo_file.name}'
                if default_storage.exists(filename):
                     import time
                     base, ext = os.path.splitext(logo_file.name)
                     filename = f'teams/{base}_{int(time.time())}{ext}'
                
                path = default_storage.save(filename, logo_file)
                serializer.save(logo=path)
            else:
                # Check for logo URL or other fields
                logo_url = self.request.data.get('logo')
                if isinstance(logo_url, str) and (logo_url.startswith('http') or '/' in logo_url):
                    serializer.save(logo=logo_url)
                else:
                    serializer.save()
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error updating team: {str(e)}")
            raise

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
        photo_file = self.request.FILES.get('photo')
        if photo_file:
            from django.core.files.storage import default_storage
            import os
            filename = f'coaches/{photo_file.name}'
            if default_storage.exists(filename):
                 import time
                 base, ext = os.path.splitext(photo_file.name)
                 filename = f'coaches/{base}_{int(time.time())}{ext}'
            path = default_storage.save(filename, photo_file)
            serializer.save(photo=path)
        else:
            photo_url = self.request.data.get('photo')
            if isinstance(photo_url, str) and (photo_url.startswith('http') or '/' in photo_url):
                serializer.save(photo=photo_url)
            else:
                serializer.save()

    def perform_update(self, serializer):
        photo_file = self.request.FILES.get('photo')
        if photo_file:
            from django.core.files.storage import default_storage
            import os
            filename = f'coaches/{photo_file.name}'
            if default_storage.exists(filename):
                 import time
                 base, ext = os.path.splitext(photo_file.name)
                 filename = f'coaches/{base}_{int(time.time())}{ext}'
            path = default_storage.save(filename, photo_file)
            serializer.save(photo=path)
        else:
            photo_url = self.request.data.get('photo')
            if isinstance(photo_url, str) and (photo_url.startswith('http') or '/' in photo_url):
                serializer.save(photo=photo_url)
            else:
                serializer.save()

class PlayerViewSet(viewsets.ModelViewSet):
    serializer_class = PlayerSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_queryset(self):
        if self.request.method == 'GET' and 'pk' in self.kwargs:
            return Player.objects.all()
        return Player.objects.filter(team__owner=self.request.user)

    def perform_create(self, serializer):
        photo_file = self.request.FILES.get('photo')
        if photo_file:
            from django.core.files.storage import default_storage
            import os
            filename = f'players/{photo_file.name}'
            if default_storage.exists(filename):
                 import time
                 base, ext = os.path.splitext(photo_file.name)
                 filename = f'players/{base}_{int(time.time())}{ext}'
            path = default_storage.save(filename, photo_file)
            serializer.save(photo=path)
        else:
            photo_url = self.request.data.get('photo')
            if isinstance(photo_url, str) and (photo_url.startswith('http') or '/' in photo_url):
                serializer.save(photo=photo_url)
            else:
                serializer.save()

    def perform_update(self, serializer):
        photo_file = self.request.FILES.get('photo')
        if photo_file:
            from django.core.files.storage import default_storage
            import os
            filename = f'players/{photo_file.name}'
            if default_storage.exists(filename):
                 import time
                 base, ext = os.path.splitext(photo_file.name)
                 filename = f'players/{base}_{int(time.time())}{ext}'
            path = default_storage.save(filename, photo_file)
            serializer.save(photo=path)
        else:
            photo_url = self.request.data.get('photo')
            if isinstance(photo_url, str) and (photo_url.startswith('http') or '/' in photo_url):
                serializer.save(photo=photo_url)
            else:
                serializer.save()