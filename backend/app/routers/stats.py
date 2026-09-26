from datetime import datetime
from typing import Annotated, Literal

import spotipy
from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db import get_db
from app.dependencies import get_spotify_client
from app.models import PlayedTrack, Track
from app.services.stats import get_and_save_rankings

router = APIRouter()


@router.get("/me/profile")
def get_profile(sp: Annotated[spotipy.Spotify, Depends(get_spotify_client)]) -> JSONResponse:
    """Fetch the current user's Spotify profile."""
    user_data = sp.current_user()
    if not user_data:
        return JSONResponse({"error": "Could not fetch user profile"})

    return JSONResponse(user_data)


@router.get("/me/top/tracks")
async def get_top_tracks(
    sp: Annotated[spotipy.Spotify, Depends(get_spotify_client)],
    db: Annotated[AsyncSession, Depends(get_db)],
    limit: int = 50,
    time_range: Literal["short_term", "medium_term", "long_term"] = "short_term",
) -> JSONResponse:
    """Fetch top tracks, calculate rank changes, and save to the database."""
    user_data = sp.current_user()
    if not user_data or "id" not in user_data:
        return JSONResponse({"error": "Could not fetch user profile"}, status_code=401)
    user_id = user_data["id"]

    top_tracks = sp.current_user_top_tracks(limit=limit, time_range=time_range)
    if not top_tracks or "items" not in top_tracks:
        return JSONResponse({"error": "Could not fetch top tracks"}, status_code=401)

    updated_items = await get_and_save_rankings(
        db=db,
        user_id=user_id,
        items=top_tracks["items"],
        item_type="track",
        time_range=time_range,
    )
    top_tracks["items"] = updated_items

    return JSONResponse(top_tracks)


@router.get("/me/top/artists")
async def get_top_artists(
    sp: Annotated[spotipy.Spotify, Depends(get_spotify_client)],
    db: Annotated[AsyncSession, Depends(get_db)],
    limit: int = 50,
    time_range: Literal["short_term", "medium_term", "long_term"] = "short_term",
) -> JSONResponse:
    """Fetch top artists, calculate rank changes, and save to the database."""
    user_data = sp.current_user()
    if not user_data or "id" not in user_data:
        return JSONResponse({"error": "Could not fetch user profile"}, status_code=401)
    user_id = user_data["id"]

    top_artists = sp.current_user_top_artists(limit=limit, time_range=time_range)
    if not top_artists or "items" not in top_artists:
        return JSONResponse({"error": "Could not fetch top artists"}, status_code=400)

    updated_items = await get_and_save_rankings(
        db=db,
        user_id=user_id,
        items=top_artists["items"],
        item_type="artist",
        time_range=time_range,
    )
    top_artists["items"] = updated_items

    return JSONResponse(top_artists)


@router.get("/me/recently-played")
async def get_recently_played(
    sp: Annotated[spotipy.Spotify, Depends(get_spotify_client)],
    db: Annotated[AsyncSession, Depends(get_db)],
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> JSONResponse:
    """Sync recently played tracks to DB and return paginated listening history."""
    user_data = sp.current_user()
    if not user_data or "id" not in user_data:
        return JSONResponse({"error": "Could not fetch user profile"}, status_code=401)
    user_id = user_data["id"]

    # Fetch last 50 recently played tracks from Spotify to sync with the database
    recently_played = sp.current_user_recently_played(limit=50)
    if recently_played and "items" in recently_played:
        for item in recently_played["items"]:
            track_data = item.get("track")
            played_at_str = item.get("played_at")
            if not track_data or not played_at_str:
                continue

            played_at_dt = datetime.fromisoformat(played_at_str.replace("Z", "+00:00"))
            album_art = track_data["album"]["images"][0]["url"] if track_data.get("album", {}).get("images") else None
            artists_names = ", ".join(artist["name"] for artist in track_data.get("artists", []))

            track_record = Track(
                id=track_data["id"],
                name=track_data["name"],
                artist_name=artists_names,
                album_name=track_data["album"]["name"],
                album_art_url=album_art,
            )
            await db.merge(track_record)

            played_track_id = f"{played_at_str}_{track_data['id']}"
            played_record = PlayedTrack(
                id=played_track_id,
                user_id=user_id,
                track_id=track_data["id"],
                played_at=played_at_dt,
            )
            await db.merge(played_record)
        await db.commit()

    # Query paginated recently played tracks from database
    stmt = (
        select(PlayedTrack)
        .where(PlayedTrack.user_id == user_id)
        .order_by(PlayedTrack.played_at.desc())
        .offset(offset)
        .limit(limit)
        .options(selectinload(PlayedTrack.track))
    )

    result = await db.execute(stmt)
    played_tracks = result.scalars().all()

    response_data = [
        {
            "id": pt.id,
            "played_at": pt.played_at.isoformat(),
            "track": {
                "id": pt.track.id,
                "name": pt.track.name,
                "artist_name": pt.track.artist_name,
                "album_name": pt.track.album_name,
                "album_art_url": pt.track.album_art_url,
            },
        }
        for pt in played_tracks
        if pt.track
    ]

    return JSONResponse({"items": response_data, "limit": limit, "offset": offset})


@router.get("/me/player")
def get_current_playback(sp: Annotated[spotipy.Spotify, Depends(get_spotify_client)]) -> JSONResponse:
    """Fetch the current playback information."""
    current_playback = sp.current_playback()
    if not current_playback:
        return JSONResponse({"error": "Could not fetch current playback"})

    return JSONResponse(current_playback)


@router.get("/me/player/currently-playing")
def get_current_track(sp: Annotated[spotipy.Spotify, Depends(get_spotify_client)]) -> JSONResponse:
    """Fetch the current user's currently playing track."""
    currently_playing = sp.currently_playing()
    if not currently_playing:
        return JSONResponse({"error": "Could not fetch currently playing track"})

    return JSONResponse(currently_playing)
