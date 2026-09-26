import datetime

from app.models import RankSnapshot
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession


async def get_and_save_rankings(
    db: AsyncSession,
    user_id: str,
    items: list[dict],
    item_type: str,
    time_range: str,
) -> list[dict]:
    """Fetch the current user's top tracks or artists and save their rankings to the database."""
    today = datetime.datetime.now(datetime.timezone.utc).date()

    # Get the previous snapshot before today
    subquery = (
        select(func.max(func.date(RankSnapshot.snapshot_date)))
        .where(
            RankSnapshot.user_id == user_id,
            RankSnapshot.item_type == item_type,
            RankSnapshot.time_range == time_range,
            func.date(RankSnapshot.snapshot_date) < today,
        )
        .scalar_subquery()
    )

    stmt = select(RankSnapshot).where(
        RankSnapshot.user_id == user_id,
        RankSnapshot.item_type == item_type,
        RankSnapshot.time_range == time_range,
        func.date(RankSnapshot.snapshot_date) == subquery,
    )

    result = await db.execute(stmt)
    prev_ranks = {snapshot.item_id: snapshot.rank for snapshot in result.scalars().all()}

    # Check if a snapshot for today already exists
    snapshot_today = (
        select(RankSnapshot.id)
        .where(
            RankSnapshot.user_id == user_id,
            RankSnapshot.item_type == item_type,
            RankSnapshot.time_range == time_range,
            func.date(RankSnapshot.snapshot_date) == today,
        )
        .limit(1)
    )

    result_today = await db.execute(snapshot_today)
    snapshot_exists = result_today.scalar_one_or_none() is not None

    # Update the current items with rank change information and save the new snapshot
    updated_items = []
    for idx, item in enumerate(items, start=1):
        prev_rank = prev_ranks.get(item["id"])

        # Determine the rank change type and delta
        if prev_rank is None:
            change_type, delta = "NEW", 0
        else:
            rank_delta = prev_rank - idx
            if rank_delta > 0:
                change_type, delta = "UP", rank_delta
            elif rank_delta < 0:
                change_type, delta = "DOWN", abs(rank_delta)
            else:
                change_type, delta = "SAME", 0

        item_data = dict(item)
        item_data["rank_change"] = {
            "type": change_type,
            "delta": delta,
            "previous_rank": prev_rank,
        }
        updated_items.append(item_data)

    # Only save a new snapshot if one doesn't already exist for today
    if not snapshot_exists:
        snapshot_time = datetime.datetime.now(datetime.timezone.utc)

        for idx, item in enumerate(items, start=1):
            snapshot_id = f"{user_id}_{item_type}_{time_range}_{item['id']}_{today}"

            await db.merge(
                RankSnapshot(
                    id=snapshot_id,
                    user_id=user_id,
                    item_type=item_type,
                    time_range=time_range,
                    item_id=item["id"],
                    rank=idx,
                    snapshot_date=snapshot_time,
                ),
            )

        await db.commit()

    return updated_items
