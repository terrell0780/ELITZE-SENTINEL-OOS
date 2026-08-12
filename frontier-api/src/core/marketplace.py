# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
"""
Marketplace domain — plugins, templates, ratings, billing, subscriptions.
"""

import time
import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class ListingType(str, Enum):
    PLUGIN = "plugin"
    TEMPLATE = "template"
    WORKFLOW = "workflow"
    AGENT = "agent"
    MODEL = "model"


class ListingStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"
    REJECTED = "rejected"


class BillingPlan(str, Enum):
    FREE = "free"
    STARTER = "starter"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"


@dataclass
class MarketplaceListing:
    listing_id: str
    name: str
    description: str
    listing_type: ListingType
    version: str = "1.0.0"
    author_id: str = ""
    price: float = 0.0
    status: ListingStatus = ListingStatus.DRAFT
    tags: list[str] = field(default_factory=list)
    rating: float = 0.0
    download_count: int = 0
    created_at: float = 0.0
    updated_at: float = 0.0
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class Review:
    review_id: str
    listing_id: str
    user_id: str
    rating: int
    comment: str = ""
    created_at: float = 0.0


@dataclass
class Subscription:
    sub_id: str
    tenant_id: str
    plan: BillingPlan
    features: list[str] = field(default_factory=list)
    active: bool = True
    started_at: float = 0.0
    expires_at: float | None = None


class MarketplaceEngine:
    def __init__(self):
        self._listings: dict[str, MarketplaceListing] = {}
        self._reviews: dict[str, Review] = {}
        self._subscriptions: dict[str, Subscription] = {}
        self._seed()

    def _now(self) -> float:
        return time.time()

    def _seed(self):
        listings = [
            MarketplaceListing("listing-sentinel-core", "Elitze Sentinel Core", "Sovereign AI OS core runtime",
                               ListingType.PLUGIN, "2.0.0", "system", 0.0, ListingStatus.PUBLISHED,
                               ["ai", "os", "runtime"], 4.8, 15230, self._now(), self._now()),
            MarketplaceListing("listing-Frontier-gateway", "Frontier Gateway", "Multi-model AI gateway",
                               ListingType.PLUGIN, "1.0.0", "system", 0.0, ListingStatus.PUBLISHED,
                               ["gateway", "models", "api"], 4.5, 8900, self._now(), self._now()),
            MarketplaceListing("listing-npc-behaviors", "NPC Behavior Templates", "GOAP planner templates for RPG NPCs",
                               ListingType.TEMPLATE, "1.0.0", "community", 0.0, ListingStatus.PUBLISHED,
                               ["npc", "rpg", "behavior", "goap"], 4.2, 3400, self._now(), self._now()),
        ]
        for l in listings:
            self._listings[l.listing_id] = l

    def create_listing(self, name: str, description: str, listing_type: str,
                        author_id: str, price: float = 0.0,
                        tags: list[str] | None = None) -> dict:
        lid = "listing-" + uuid.uuid4().hex[:8]
        listing = MarketplaceListing(lid, name, description, ListingType(listing_type),
                                     "1.0.0", author_id, price, ListingStatus.DRAFT,
                                     tags or [], 0.0, 0, self._now(), self._now())
        self._listings[lid] = listing
        return {"listing_id": lid, "name": name, "status": "draft"}

    def publish_listing(self, listing_id: str) -> dict:
        listing = self._listings.get(listing_id)
        if not listing:
            return {"status": "error", "reason": "Listing not found"}
        listing.status = ListingStatus.PUBLISHED
        listing.updated_at = self._now()
        return {"status": "published", "listing_id": listing_id}

    def archive_listing(self, listing_id: str) -> dict:
        listing = self._listings.get(listing_id)
        if not listing:
            return {"status": "error", "reason": "Listing not found"}
        listing.status = ListingStatus.ARCHIVED
        listing.updated_at = self._now()
        return {"status": "archived", "listing_id": listing_id}

    def list_listings(self, listing_type: str | None = None,
                       status: str | None = None,
                       tag: str | None = None) -> list[dict]:
        result = []
        for l in self._listings.values():
            if listing_type and l.listing_type.value != listing_type:
                continue
            if status and l.status.value != status:
                continue
            if tag and tag not in l.tags:
                continue
            result.append({
                "listing_id": l.listing_id, "name": l.name,
                "description": l.description[:100] + ("..." if len(l.description) > 100 else ""),
                "type": l.listing_type.value, "version": l.version,
                "author_id": l.author_id, "price": l.price,
                "status": l.status.value, "rating": l.rating,
                "download_count": l.download_count, "tags": l.tags,
            })
        return result

    def get_listing(self, listing_id: str) -> dict | None:
        l = self._listings.get(listing_id)
        if not l:
            return None
        reviews = [r for r in self._reviews.values() if r.listing_id == listing_id]
        return {
            "listing_id": l.listing_id, "name": l.name, "description": l.description,
            "type": l.listing_type.value, "version": l.version,
            "author_id": l.author_id, "price": l.price,
            "status": l.status.value, "tags": l.tags,
            "rating": l.rating, "download_count": l.download_count,
            "review_count": len(reviews),
            "created_at": l.created_at, "updated_at": l.updated_at,
        }

    def add_review(self, listing_id: str, user_id: str,
                    rating: int, comment: str = "") -> dict:
        listing = self._listings.get(listing_id)
        if not listing:
            return {"status": "error", "reason": "Listing not found"}
        rid = "rev-" + uuid.uuid4().hex[:8]
        review = Review(rid, listing_id, user_id, rating, comment, self._now())
        self._reviews[rid] = review
        # Recalculate average rating
        listing_reviews = [r for r in self._reviews.values() if r.listing_id == listing_id]
        listing.rating = round(sum(r.rating for r in listing_reviews) / len(listing_reviews), 1)
        listing.updated_at = self._now()
        return {"review_id": rid, "listing_id": listing_id, "rating": rating,
                "new_average": listing.rating}

    def record_download(self, listing_id: str) -> dict:
        listing = self._listings.get(listing_id)
        if not listing:
            return {"status": "error", "reason": "Listing not found"}
        listing.download_count += 1
        return {"listing_id": listing_id, "download_count": listing.download_count}

    def create_subscription(self, tenant_id: str, plan: str) -> dict:
        sid = "sub-" + uuid.uuid4().hex[:8]
        feature_map = {
            BillingPlan.FREE: ["basic_gateway", "community_support"],
            BillingPlan.STARTER: ["basic_gateway", "community_support", "email_support", "5_projects"],
            BillingPlan.PROFESSIONAL: ["full_gateway", "priority_support", "unlimited_projects",
                                       "analytics", "custom_models"],
            BillingPlan.ENTERPRISE: ["full_gateway", "dedicated_support", "unlimited_projects",
                                      "advanced_analytics", "custom_models", "sso", "audit_logs",
                                      "sla_guarantee"],
        }
        sub = Subscription(sid, tenant_id, BillingPlan(plan),
                           feature_map.get(BillingPlan(plan), []),
                           True, self._now())
        self._subscriptions[sid] = sub
        return {"sub_id": sid, "tenant_id": tenant_id, "plan": plan,
                "features": sub.features, "active": True}

    def get_subscription(self, tenant_id: str) -> dict | None:
        for s in self._subscriptions.values():
            if s.tenant_id == tenant_id:
                return {"sub_id": s.sub_id, "tenant_id": s.tenant_id,
                        "plan": s.plan.value, "features": s.features,
                        "active": s.active, "started_at": s.started_at,
                        "expires_at": s.expires_at}
        return None

    def cancel_subscription(self, tenant_id: str) -> dict:
        for s in self._subscriptions.values():
            if s.tenant_id == tenant_id:
                s.active = False
                return {"status": "cancelled", "tenant_id": tenant_id}
        return {"status": "error", "reason": "No subscription found"}
