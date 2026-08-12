# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
from src.core import MarketplaceEngine
from src.router import Router

router = Router(prefix="/v1/marketplace")
eng = MarketplaceEngine()


@router.add_route("POST", "/listings")
def create_listing(query, body):
    result = eng.create_listing(
        name=body["name"], description=body["description"],
        listing_type=body["type"], author_id=body["author_id"],
        price=body.get("price", 0.0), tags=body.get("tags"),
    )
    return 201, result


@router.add_route("GET", "/listings")
def list_listings(query, body):
    return eng.list_listings(
        listing_type=query.get("type"),
        status=query.get("status"),
        tag=query.get("tag"),
    )


@router.add_route("GET", "/listings/{listing_id}")
def get_listing(query, body, listing_id):
    l = eng.get_listing(listing_id)
    if not l:
        return 404, {"error": "Listing not found"}
    return l


@router.add_route("POST", "/listings/{listing_id}/publish")
def publish_listing(query, body, listing_id):
    return eng.publish_listing(listing_id)


@router.add_route("POST", "/listings/{listing_id}/archive")
def archive_listing(query, body, listing_id):
    return eng.archive_listing(listing_id)


@router.add_route("POST", "/listings/{listing_id}/download")
def record_download(query, body, listing_id):
    return eng.record_download(listing_id)


@router.add_route("POST", "/listings/{listing_id}/reviews")
def add_review(query, body, listing_id):
    return eng.add_review(
        listing_id=listing_id, user_id=body["user_id"],
        rating=body["rating"], comment=body.get("comment", ""),
    )


@router.add_route("POST", "/subscriptions")
def create_subscription(query, body):
    result = eng.create_subscription(
        tenant_id=body["tenant_id"], plan=body["plan"],
    )
    return 201, result


@router.add_route("GET", "/subscriptions/{tenant_id}")
def get_subscription(query, body, tenant_id):
    sub = eng.get_subscription(tenant_id)
    if not sub:
        return 404, {"error": "Subscription not found"}
    return sub


@router.add_route("POST", "/subscriptions/{tenant_id}/cancel")
def cancel_subscription(query, body, tenant_id):
    return eng.cancel_subscription(tenant_id)
