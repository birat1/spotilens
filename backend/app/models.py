from sqlalchemy import Column, DateTime, ForeignKey, Index, Integer, String
from sqlalchemy.orm import relationship

from app.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)  # Spotify user ID


class Track(Base):
    __tablename__ = "tracks"

    id = Column(String, primary_key=True)  # Spotify track ID
    name = Column(String, nullable=False)
    artist_name = Column(String, nullable=False)
    album_name = Column(String, nullable=False)
    album_art_url = Column(String, nullable=True)


class PlayedTrack(Base):
    __tablename__ = "played_tracks"

    id = Column(String, primary_key=True)  # f"{played_at}_{track_id}"
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    track_id = Column(String, ForeignKey("tracks.id", ondelete="CASCADE"), nullable=False)
    played_at = Column(DateTime(timezone=True), nullable=False)

    track = relationship("Track")

    __table_args__ = (Index("idx_user_played_at", "user_id", "played_at"),)


class RankSnapshot(Base):
    __tablename__ = "rank_snapshots"

    id = Column(String, primary_key=True)  # f"{user_id}_{item_type}_{time_range}_{item_id}_{date}"
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    item_type = Column(String, nullable=False)  # "track" or "artist"
    time_range = Column(String, nullable=False)  # "short_term", "medium_term", or "long_term"
    item_id = Column(String, nullable=False)  # Spotify track_id or artist_id
    rank = Column(Integer, nullable=False)
    snapshot_date = Column(DateTime(timezone=True), nullable=False)

    __table_args__ = (Index("idx_rank_lookup", "user_id", "item_type", "time_range", "snapshot_date"),)
