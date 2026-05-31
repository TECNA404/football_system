from django.urls import path
from .views import StandingListView

urlpatterns = [
    path('', StandingListView.as_view(), name='standing-list'),
]