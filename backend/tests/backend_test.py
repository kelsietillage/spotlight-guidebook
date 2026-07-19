"""Backend tests for the Spelman Blueprint Spotlight Award Guidebook - iteration 2.

Focus: new endpoints (photos, contacts), rubric 1-5 scale (max total 25),
tracking outcomes (Accepted/Waitlist/Rejected/Disqualified + Jane Doe template),
production N/A cases + Jane Doe, nomination Nominator Information + social links,
themes descriptions (intentional themes + 18/1881), auth-guarded CRUD.
"""
import os
import uuid
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
    assert "access_token" in data and data["user"]["role"] == "admin"
    return data["access_token"]


@pytest.fixture()
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


# --------------------------- Rubric --------------------------------------
class TestRubric:
    def test_rubric_returns_5_criteria_max_5_total_25(self, session):
        r = session.get(f"{API}/rubric")
        assert r.status_code == 200
        rows = r.json()
        assert len(rows) == 5, f"expected 5 criteria, got {len(rows)}"
        for row in rows:
            assert row["max_score"] == 5, f"criterion '{row.get('name')}' max_score={row.get('max_score')}"
        total = sum(row["max_score"] for row in rows)
        assert total == 25


# --------------------------- Tracking ------------------------------------
class TestTracking:
    def test_selection_rows_include_all_statuses_and_jane_doe(self, session):
        r = session.get(f"{API}/tracking", params={"board": "selection"})
        assert r.status_code == 200
        rows = r.json()
        assert len(rows) > 0
        statuses = {str(row["data"].get("Status", "")) for row in rows}
        for expected in ["Accepted", "Waitlist", "Rejected", "Disqualified"]:
            assert expected in statuses, f"missing status {expected}; got {statuses}"
        names = {row["data"].get("Name") for row in rows}
        assert "Jane Doe" in names, "selection board is missing Jane Doe template row"

    def test_production_rows_include_na_and_jane_doe(self, session):
        r = session.get(f"{API}/tracking", params={"board": "production"})
        assert r.status_code == 200
        rows = r.json()
        assert len(rows) > 0
        awardees = {row["data"].get("Awardee") for row in rows}
        assert "Jane Doe" in awardees, "production board is missing Jane Doe template row"

        # At least one row contains N/A in any of the columns
        has_na = any(
            any(str(v).strip() == "N/A" for v in row["data"].values())
            for row in rows
        )
        assert has_na, "expected at least one production row to include N/A"


# --------------------------- Photos --------------------------------------
class TestPhotos:
    def test_photos_seed_has_min_three(self, session):
        r = session.get(f"{API}/photos")
        assert r.status_code == 200
        rows = r.json()
        assert len(rows) >= 3, f"expected >=3 photos, got {len(rows)}"
        for row in rows:
            assert row["url"].startswith("http")
            assert isinstance(row["year"], int)

    def test_photos_require_admin_for_write(self, session):
        payload = {"year": 2026, "url": "https://example.com/p.jpg", "caption": "no auth"}
        r = session.post(f"{API}/photos", json=payload)
        assert r.status_code == 401

    def test_photos_crud_end_to_end(self, session, admin_headers):
        payload = {
            "year": 2027,
            "url": f"https://example.com/TEST_{uuid.uuid4().hex}.jpg",
            "caption": "TEST_photo caption",
        }
        # CREATE
        r = session.post(f"{API}/photos", json=payload, headers=admin_headers)
        assert r.status_code == 200, r.text
        created = r.json()
        assert created["year"] == 2027 and created["caption"] == payload["caption"]
        pid = created["id"]

        # GET to verify persistence
        r = session.get(f"{API}/photos")
        assert any(p["id"] == pid for p in r.json())

        # UPDATE
        update = {**payload, "caption": "TEST_photo updated"}
        r = session.put(f"{API}/photos/{pid}", json=update, headers=admin_headers)
        assert r.status_code == 200
        assert r.json()["caption"] == "TEST_photo updated"

        # DELETE
        r = session.delete(f"{API}/photos/{pid}", headers=admin_headers)
        assert r.status_code == 200
        r = session.get(f"{API}/photos")
        assert not any(p["id"] == pid for p in r.json())


# --------------------------- Contacts ------------------------------------
class TestContacts:
    def test_contacts_seed_has_founder_and_three_chairs(self, session):
        r = session.get(f"{API}/contacts")
        assert r.status_code == 200
        rows = r.json()
        names = [c["name"] for c in rows]
        assert "Kelsie Tillage" in names, f"founder missing; got {names}"
        chairs = [c for c in rows if "Co-Chair" in c["role"]]
        assert len(chairs) >= 3, f"expected >=3 co-chairs, got {len(chairs)}: {names}"

    def test_contacts_require_admin_for_write(self, session):
        r = session.post(f"{API}/contacts", json={"role": "Co-Chair", "name": "x"})
        assert r.status_code == 401

    def test_contacts_crud_end_to_end(self, session, admin_headers):
        payload = {
            "role": "Co-Chair",
            "name": f"TEST_Contact_{uuid.uuid4().hex[:6]}",
            "year": "2028",
            "email": "test_contact@example.com",
            "phone": "",
            "note": "TEST_note",
        }
        r = session.post(f"{API}/contacts", json=payload, headers=admin_headers)
        assert r.status_code == 200, r.text
        created = r.json()
        cid = created["id"]
        assert created["name"] == payload["name"]

        r = session.get(f"{API}/contacts")
        assert any(c["id"] == cid for c in r.json())

        r = session.put(f"{API}/contacts/{cid}", json={**payload, "note": "TEST_updated"}, headers=admin_headers)
        assert r.status_code == 200
        assert r.json()["note"] == "TEST_updated"

        r = session.delete(f"{API}/contacts/{cid}", headers=admin_headers)
        assert r.status_code == 200


# --------------------------- Nomination ----------------------------------
class TestNomination:
    def test_nomination_has_nominator_info_and_anonymity_and_social(self, session):
        r = session.get(f"{API}/nomination")
        assert r.status_code == 200
        rows = r.json()
        sections = {row["section"] for row in rows}
        assert "Nominator Information" in sections, f"sections={sections}"
        assert "About the Nominee" in sections

        # anonymity choice must exist in Nominator Information
        anonymity = [
            row for row in rows
            if row["section"] == "Nominator Information" and "anonym" in row["question"].lower()
        ]
        assert anonymity, "missing anonymity question"
        assert anonymity[0]["type"] == "choice"
        assert len(anonymity[0].get("options", [])) >= 2

        # social handles / links question under About the Nominee
        social = [
            row for row in rows
            if row["section"] == "About the Nominee"
            and ("social" in row["question"].lower() or "handle" in row["question"].lower() or "link" in row["question"].lower())
        ]
        assert social, "missing social handles/links question"


# --------------------------- Themes --------------------------------------
class TestThemes:
    def test_theme_descriptions_mention_intentional_and_18_1881(self, session):
        r = session.get(f"{API}/themes")
        assert r.status_code == 200
        themes = r.json()
        assert len(themes) >= 2
        all_desc = " ".join((t.get("description") or "") for t in themes).lower()
        assert "intentional" in all_desc, "theme descriptions should mention 'intentional'"
        assert "1881" in all_desc and "18" in all_desc, "theme descriptions should reference 18/1881"


# --------------------------- Auth basic ----------------------------------
class TestAuth:
    def test_login_bad_credentials(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_me_requires_token(self, session):
        r = session.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_returns_admin_user(self, session, admin_headers):
        r = session.get(f"{API}/auth/me", headers=admin_headers)
        assert r.status_code == 200
        u = r.json()
        assert u["email"] == ADMIN_EMAIL and u["role"] == "admin"
