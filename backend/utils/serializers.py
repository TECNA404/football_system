class LogoURLMixin:
    @staticmethod
    def format_logo_url(team, request=None):
        if team and team.logo:
            logo = team.logo.strip()

            if logo.startswith("http://") or logo.startswith("https://"):
                return logo

            if logo.startswith("/media/"):
                return request.build_absolute_uri(logo) if request else logo

            if logo.startswith("media/"):
                logo = f"/{logo}"
                return request.build_absolute_uri(logo) if request else logo

            logo = f"/media/{logo.lstrip('/')}"
            return request.build_absolute_uri(logo) if request else logo

        return "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=200&h=200&auto=format&fit=crop"
    @staticmethod
    def format_coach_photo_url(coach, request=None):
        if coach and coach.photo:
            if coach.photo.startswith('http'):
                return coach.photo
            if request:
                return request.build_absolute_uri(f"/media/{coach.photo}")
            return f"/media/{coach.photo}"
        return "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=200&h=200&auto=format&fit=crop"

    @staticmethod
    def format_player_photo_url(player, request=None):
        if player and player.photo:
            if player.photo.startswith('http'):
                return player.photo
            if request:
                return request.build_absolute_uri(f"/media/{player.photo}")
            return f"/media/{player.photo}"
        
        placeholders = {
            'GK': "https://images.unsplash.com/photo-1526232310673-59c9c8155837?q=80&w=200&h=200&auto=format&fit=crop",
            'DF': "https://images.unsplash.com/photo-1544606111-883015b40462?q=80&w=200&h=200&auto=format&fit=crop",
            'MF': "https://images.unsplash.com/photo-1511886929837-354d827aae26?q=80&w=200&h=200&auto=format&fit=crop",
            'FW': "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=200&h=200&auto=format&fit=crop",
        }
        return placeholders.get(player.position if player else '', "https://images.unsplash.com/photo-1511886929837-354d827aae26?q=80&w=200&h=200&auto=format&fit=crop")

    def get_logo_url(self, team):
        return self.format_logo_url(team, self.context.get('request'))

    def get_coach_photo_url(self, coach):
        return self.format_coach_photo_url(coach, self.context.get('request'))

    def get_player_photo_url(self, player):
        return self.format_player_photo_url(player, self.context.get('request'))
