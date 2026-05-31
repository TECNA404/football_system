from rest_framework.routers import DefaultRouter
from .views import TeamViewSet, CoachViewSet, PlayerViewSet

router = DefaultRouter()
router.register(r'coaches', CoachViewSet, basename='coaches')
router.register(r'players', PlayerViewSet, basename='players')
router.register(r'', TeamViewSet, basename='teams')

urlpatterns = router.urls