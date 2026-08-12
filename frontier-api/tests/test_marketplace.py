# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
import pytest
from src.core import MarketplaceEngine


@pytest.fixture
def eng():
    return MarketplaceEngine()


class TestListings:
    def test_seed_listings(self, eng):
        listings = eng.list_listings()
        assert len(listings) >= 3

    def test_create_listing(self, eng):
        result = eng.create_listing("My Plugin", "A cool plugin", "plugin", "user-1")
        assert "listing_id" in result
        assert result["status"] == "draft"

    def test_publish_listing(self, eng):
        r = eng.create_listing("P", "Desc", "plugin", "user-1")
        result = eng.publish_listing(r["listing_id"])
        assert result["status"] == "published"

    def test_archive_listing(self, eng):
        r = eng.create_listing("A", "Desc", "plugin", "user-1")
        result = eng.archive_listing(r["listing_id"])
        assert result["status"] == "archived"

    def test_get_listing(self, eng):
        l = eng.get_listing("listing-sentinel-core")
        assert l is not None
        assert l["name"] == "Elitze Sentinel Core"

    def test_get_listing_not_found(self, eng):
        assert eng.get_listing("ghost") is None

    def test_filter_by_type(self, eng):
        plugins = eng.list_listings(listing_type="plugin")
        assert all(l["type"] == "plugin" for l in plugins)


class TestReviews:
    def test_add_review(self, eng):
        result = eng.add_review("listing-sentinel-core", "user-1", 5, "Great!")
        assert "review_id" in result
        assert result["rating"] == 5

    def test_add_review_updates_rating(self, eng):
        eng.add_review("listing-sentinel-core", "u1", 4)
        l = eng.get_listing("listing-sentinel-core")
        assert l["rating"] == pytest.approx((4.8 + 4) / 2, 0.1)

    def test_add_review_not_found(self, eng):
        result = eng.add_review("ghost", "user", 3)
        assert result["status"] == "error"


class TestDownloads:
    def test_record_download(self, eng):
        before = eng.get_listing("listing-sentinel-core")
        eng.record_download("listing-sentinel-core")
        after = eng.get_listing("listing-sentinel-core")
        assert after["download_count"] == before["download_count"] + 1

    def test_record_download_not_found(self, eng):
        result = eng.record_download("ghost")
        assert result["status"] == "error"


class TestSubscriptions:
    def test_create_subscription(self, eng):
        result = eng.create_subscription("tenant-1", "professional")
        assert result["plan"] == "professional"
        assert result["active"] is True

    def test_get_subscription(self, eng):
        eng.create_subscription("tenant-2", "starter")
        sub = eng.get_subscription("tenant-2")
        assert sub is not None
        assert sub["plan"] == "starter"

    def test_get_subscription_not_found(self, eng):
        assert eng.get_subscription("ghost") is None

    def test_cancel_subscription(self, eng):
        eng.create_subscription("tenant-3", "free")
        result = eng.cancel_subscription("tenant-3")
        assert result["status"] == "cancelled"

    def test_cancel_subscription_not_found(self, eng):
        result = eng.cancel_subscription("ghost")
        assert result["status"] == "error"
