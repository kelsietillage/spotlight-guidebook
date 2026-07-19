"""Backend tests for the Spelman Blueprint Spotlight Award Guidebook - iteration 3 (SEED v4).

Focus on v4 changes:
 - Photos have 'Award show' captions for both 2025 and 2026
 - Tracking board has NO 'Jane Doe' rows
 - Contacts: Summer Phenix role='Founding Media Chair', Kelsie note contains cute message
 - Themes 2025 description contains 'award system' but NOT 'should be preserved by future co-chairs'
 - POST /api/photos/upload multipart works, rejects non-image, requires admin
"""
import io
import os
import struct
import uuid
import zlib
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "cochair@theblueprint.com"
ADMIN_PASSWORD = "Blueprint2026!"


# --------------------------- Fixtures ------------------------------------
@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    data = r.json()
    return data["access_token"]


@pytest.fixture()
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


def _tiny_png_bytes() -> bytes:
    """Return a valid 1x1 red PNG."""
    def chunk(tag: bytes, data: bytes) -> bytes:
        return (struct.pack(">I", len(data)) + tag + data +
                struct.pack(">I", zlib.crc32(tag + data) & 0xffffffff))
    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = chunk(b"IHDR", struct.pack(">IIBBBBB", 1, 1, 8, 2, 0, 0, 0))
    # 1 pixel red: filter byte 0 + RGB(255,0,0)
    raw = b"\x00\xff\x00\x00"
    idat = chunk(b"IDAT", zlib.compress(raw))
    iend = chunk(b"IEND", b"")
    return sig + ihdr + idat + iend


# --------------------------- Photos: seed --------------------------------
class TestPhotosSeed:
    def test_photos_include_award_show_for_2025_and_2026(self, session):
        r = session.get(f"{API}/photos")
        assert r.status_code == 200
        rows = r.json()
        years_with_award_show = {
            int(p["year"]) for p in rows
            if "award show" in (p.get("caption") or "").lower()
        }
        assert 2025 in years_with_award_show, f"2025 award show placeholder missing; got {rows}"
        assert 2026 in years_with_award_show, f"2026 award show placeholder missing; got {rows}"

    def test_photos_do_not_contain_founders_day_feature(self, session):
        r = session.get(f"{API}/photos")
        assert r.status_code == 200
        for p in r.json():
            cap = (p.get("caption") or "").lower()
            assert "founders day feature" not in cap, f"stale 'Founders Day feature' caption still present: {p}"


# --------------------------- Photos: upload ------------------------------
class TestPhotoUpload:
    def test_upload_requires_admin(self, session):
        png = _tiny_png_bytes()
        files = {"file": ("test.png", io.BytesIO(png), "image/png")}
        data = {"year": "2026", "caption": "TEST_no_auth"}
        r = requests.post(f"{API}/photos/upload", files=files, data=data)
        assert r.status_code == 401, f"expected 401, got {r.status_code} {r.text}"

    def test_upload_rejects_non_image(self, admin_headers):
        files = {"file": ("test.txt", io.BytesIO(b"hello world"), "text/plain")}
        data = {"year": "2026", "caption": "TEST_bad_mime"}
        r = requests.post(f"{API}/photos/upload", files=files, data=data, headers=admin_headers)
        assert r.status_code == 400, f"expected 400 got {r.status_code} {r.text}"

    def test_upload_accepts_png_and_returns_data_url(self, admin_headers):
        png = _tiny_png_bytes()
        cap = f"TEST_upload_{uuid.uuid4().hex[:6]}"
        files = {"file": ("test.png", io.BytesIO(png), "image/png")}
        data = {"year": "2026", "caption": cap}
        r = requests.post(f"{API}/photos/upload", files=files, data=data, headers=admin_headers)
        assert r.status_code == 200, r.text
        created = r.json()
        assert created["url"].startswith("data:image/"), f"expected data URL, got {created['url'][:60]}"
        assert created["caption"] == cap
        assert int(created["year"]) == 2026
        pid = created["id"]

        # Verify present in GET /api/photos
        r2 = requests.get(f"{API}/photos")
        rows = r2.json()
        found = [p for p in rows if p["id"] == pid]
        assert found, f"uploaded photo {pid} not in GET /api/photos"
        assert found[0]["url"].startswith("data:image/")

        # Cleanup
        rd = requests.delete(f"{API}/photos/{pid}", headers=admin_headers)
        assert rd.status_code == 200


# --------------------------- Tracking ------------------------------------
class TestTrackingNoJaneDoe:
    def test_no_jane_doe_in_selection(self, session):
        r = session.get(f"{API}/tracking", params={"board": "selection"})
        assert r.status_code == 200
        rows = r.json()
        assert len(rows) > 0
        for row in rows:
            name = str(row["data"].get("Name", ""))
            assert "jane doe" not in name.lower(), f"selection still has Jane Doe row: {row}"

    def test_no_jane_doe_in_production(self, session):
        r = session.get(f"{API}/tracking", params={"board": "production"})
        assert r.status_code == 200
        rows = r.json()
        assert len(rows) > 0
        for row in rows:
            awardee = str(row["data"].get("Awardee", ""))
            assert "jane doe" not in awardee.lower(), f"production still has Jane Doe row: {row}"


# --------------------------- Contacts ------------------------------------
class TestContactsV4:
    def test_summer_phenix_is_founding_media_chair(self, session):
        r = session.get(f"{API}/contacts")
        assert r.status_code == 200
        rows = r.json()
        summer = next((c for c in rows if c["name"] == "Summer Phenix"), None)
        assert summer is not None, f"Summer Phenix missing from contacts: {[c['name'] for c in rows]}"
        assert summer["role"] == "Founding Media Chair", f"got role={summer['role']!r}"

    def test_kelsie_note_contains_cute_message(self, session):
        r = session.get(f"{API}/contacts")
        rows = r.json()
        kelsie = next((c for c in rows if c["name"] == "Kelsie Tillage"), None)
        assert kelsie is not None
        note = kelsie.get("note", "")
        assert "i am so excited to have this be continued" in note.lower(), f"note={note!r}"


# --------------------------- Themes --------------------------------------
class TestThemes2025:
    def test_theme_2025_description_contains_award_system(self, session):
        r = session.get(f"{API}/themes")
        assert r.status_code == 200
        themes = r.json()
        t2025 = next((t for t in themes if int(t.get("year", 0)) == 2025), None)
        assert t2025 is not None, "2025 theme missing"
        desc = (t2025.get("description") or "").lower()
        assert "award system" in desc, f"2025 desc missing 'award system'; got: {desc[:200]}"

    def test_theme_2025_does_not_contain_preserved_by_future_cochairs(self, session):
        r = session.get(f"{API}/themes")
        themes = r.json()
        t2025 = next((t for t in themes if int(t.get("year", 0)) == 2025), None)
        desc = (t2025.get("description") or "").lower()
        assert "should be preserved by future co-chairs" not in desc, \
            f"2025 desc still contains the removed sentence: {desc[:400]}"

    def test_theme_2025_does_not_contain_editorial_series(self, session):
        # 'editorial series' was replaced by 'award system'
        r = session.get(f"{API}/themes")
        themes = r.json()
        t2025 = next((t for t in themes if int(t.get("year", 0)) == 2025), None)
        desc = (t2025.get("description") or "").lower()
        assert "editorial series" not in desc, f"2025 desc still says 'editorial series': {desc[:400]}"


# --------------------------- Auth guard sanity ---------------------------
class TestAuthSanity:
    def test_login_ok(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        assert r.json()["user"]["role"] == "admin"
