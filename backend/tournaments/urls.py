from rest_framework.routers import DefaultRouter
from .views import TournamentViewSet, TournamentTeamViewSet, PublicTournamentViewSet

router = DefaultRouter()
router.register(r'links', TournamentTeamViewSet, basename='tournament-links')
router.register(r'public', PublicTournamentViewSet, basename='public-tournaments')
router.register(r'', TournamentViewSet, basename='tournaments')

urlpatterns = router.urls