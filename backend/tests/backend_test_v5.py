"""v5 backend tests: Correspondence (email templates) — CRUD + seed verification."""
import os
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
ADMIN_EMAIL = "cochair@theblueprint.com"
ADMIN_PASSWORD = "Spotlight2025"


@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(api):
    r = api.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


# ---------- GET /api/emails ---------------------------------------------------
class TestEmailsSeed:
    def test_get_emails_returns_four_ordered(self, api):
        r = api.get(f"{BASE_URL}/api/emails")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 4, f"expected 4 seeded emails, got {len(data)}: {[e.get('title') for e in data]}"
        orders = [e["order"] for e in data]
        assert orders == [1, 2, 3, 4], f"emails not ordered 1..4: {orders}"
        for e in data:
            for k in ("id", "audience", "title", "when", "subject", "body", "order"):
                assert k in e, f"missing field {k} in {e}"

    def test_seed_audiences(self, api):
        data = api.get(f"{BASE_URL}/api/emails").json()
        by_order = {e["order"]: e for e in data}
        assert by_order[1]["audience"] == "Awardee"
        assert by_order[2]["audience"] == "Nominator (selected)"
        assert by_order[3]["audience"] == "Nominator (rejected)"
        assert by_order[4]["audience"] == "Awardee (post-acceptance)"

    def test_awardee_subject_contains_congratulations(self, api):
        data = api.get(f"{BASE_URL}/api/emails").json()
        awardee = next(e for e in data if e["order"] == 1)
        assert "Congratulations! You've Been Selected" in awardee["subject"]

    def test_no_mongo_id_leak(self, api):
        data = api.get(f"{BASE_URL}/api/emails").json()
        for e in data:
            assert "_id" not in e


# ---------- Auth on write endpoints ------------------------------------------
class TestEmailsAuth:
    def test_post_requires_admin(self, api):
        r = api.post(f"{BASE_URL}/api/emails", json={
            "order": 99, "audience": "TEST", "title": "TEST_no_auth", "when": "", "subject": "x", "body": "y"
        })
        assert r.status_code == 401, f"expected 401 without token, got {r.status_code}"

    def test_put_requires_admin(self, api):
        # Fetch an existing id to attempt update
        rows = api.get(f"{BASE_URL}/api/emails").json()
        target_id = rows[0]["id"]
        r = api.put(f"{BASE_URL}/api/emails/{target_id}", json={
            "order": 1, "audience": "X", "title": "X", "when": "", "subject": "x", "body": "y"
        })
        assert r.status_code == 401

    def test_delete_requires_admin(self, api):
        rows = api.get(f"{BASE_URL}/api/emails").json()
        target_id = rows[0]["id"]
        r = api.delete(f"{BASE_URL}/api/emails/{target_id}")
        assert r.status_code == 401


# ---------- Admin CRUD roundtrip ---------------------------------------------
class TestEmailsCrud:
    def test_create_update_delete_persistence(self, api, admin_headers):
        # CREATE
        payload = {
            "order": 42,
            "audience": "TEST Audience",
            "title": "TEST_email_template",
            "when": "Test only",
            "subject": "TEST subject [placeholder]",
            "body": "Hello [Name], this is a test.",
        }
        r = api.post(f"{BASE_URL}/api/emails", json=payload, headers=admin_headers)
        assert r.status_code == 200, r.text
        created = r.json()
        assert created["title"] == payload["title"]
        assert "id" in created
        eid = created["id"]

        # GET verifies persistence
        rows = api.get(f"{BASE_URL}/api/emails").json()
        assert any(e["id"] == eid and e["title"] == "TEST_email_template" for e in rows)

        # UPDATE
        upd_payload = {**payload, "title": "TEST_email_template_updated"}
        r = api.put(f"{BASE_URL}/api/emails/{eid}", json=upd_payload, headers=admin_headers)
        assert r.status_code == 200
        assert r.json()["title"] == "TEST_email_template_updated"

        # GET verifies update
        rows = api.get(f"{BASE_URL}/api/emails").json()
        row = next(e for e in rows if e["id"] == eid)
        assert row["title"] == "TEST_email_template_updated"

        # DELETE
        r = api.delete(f"{BASE_URL}/api/emails/{eid}", headers=admin_headers)
        assert r.status_code == 200
        assert r.json().get("status") == "deleted"

        # Confirm removal
        rows = api.get(f"{BASE_URL}/api/emails").json()
        assert not any(e["id"] == eid for e in rows)
        # Seed count restored
        assert len(rows) == 4
