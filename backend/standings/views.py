from rest_framework import generics, permissions
from .models import Standing
from .serializers import StandingSerializer


class StandingListView(generics.ListAPIView):
    serializer_class = StandingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = Standing.objects.select_related('team', 'tournament')
        tournament_id = self.request.query_params.get('tournament')
        if tournament_id:
            qs = qs.filter(tournament_id=tournament_id)
        return qs