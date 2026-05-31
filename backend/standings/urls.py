from django.urls import path
from .views import StandingListView, RecalculateStandingsView

urlpatterns = [
    path("", StandingListView.as_view(), name="standings-list"),
    path("recalculate/", RecalculateStandingsView.as_view(), name="standings-recalculate"),
]