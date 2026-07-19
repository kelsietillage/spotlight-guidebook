"""Initial content seed for the Spelman Blueprint Spotlight Award Guidebook."""
import uuid
from datetime import datetime, timezone

ADMIN_ROLE = "admin"
SEED_VERSION = 5  # bump to force reseed of managed collections

LOGO_URL = "https://customer-assets-cm19k8pv.emergentagent.net/job_spotlight-co-chair/artifacts/oos0yto2_BP%20Logo.png"


def _mk(items):
    now = datetime.now(timezone.utc).isoformat()
    return [{"id": str(uuid.uuid4()), "created_at": now, **it} for it in items]


WINNERS_2025 = [
    ("Aiyana Ringo", "Public Service & Community Engagement"),
    ("Alexandra Nelson", "Arts & Academia"),
    ("Alyssa Chinyere Richardson", "Arts & Academia"),
    ("Anise Puckett", "Entrepreneurship & Business"),
    ("Cadence Patrick", "Arts & Academia"),
    ("Elise Sampson", "Public Service & Community Engagement"),
    ("Gabrielle Knox", "Public Service & Community Engagement"),
    ("Grace Barlow", "Arts & Academia"),
    ("Hannah Baumgardner", "Arts & Academia"),
    ("Jada Joshua", "Public Service & Community Engagement"),
    ("Jaleia Latson", "Public Service & Community Engagement"),
    ("Jaliyah Goodlow", "Public Service & Community Engagement"),
    ("Jordan Greene", "Public Service & Community Engagement"),
    ("Kai Hardimon", "Entrepreneurship & Business"),
    ("Kai Ricketts", "Public Service & Community Engagement"),
    ("Kamora Freeland", "Entrepreneurship & Business"),
    ("Lauren Legardy", "Entrepreneurship & Business"),
    ("Mackenzie Hickson", "Arts & Academia"),
    ("Mya Spencer", "Entrepreneurship & Business"),
    ("Naima Eggleston", "Entrepreneurship & Business"),
    ("Nia Lambert", "Arts & Academia"),
    ("Ryan Arielle Bates", "Public Service & Community Engagement"),
    ("Sarah Williams", "Arts & Academia"),
    ("Shiloh Wolfork", "Public Service & Community Engagement"),
    ("Simone Moales", "Public Service & Community Engagement"),
    ("Trinity Williams", "Entrepreneurship & Business"),
]

WINNERS_2026 = [
    ("Kennedy Rogers", "Arts & Academia"),
    ("Mariama Barry", "Entrepreneurship & Business"),
    ("Ariana Swindell", "Arts & Academia"),
    ("Madison Harris", "Arts & Academia"),
    ("Gabrielle Adams", "Entrepreneurship & Business"),
    ("Autumn Gary", "Public Service & Community Engagement"),
    ("Latch'd (Logan Smith & Aisjah Glaspie)", "Entrepreneurship & Business"),
    ("Dana Thompson", "Arts & Academia"),
    ("Enjoli Pierre", "Arts & Academia"),
    ("Jayda Hendrickson", "Arts & Academia"),
    ("Aubrey Patton", "Entrepreneurship & Business"),
    ("Aubria King", "Public Service & Community Engagement"),
    ("Ana Villavasso", "Arts & Academia"),
    ("MaKyra Wilson", "Public Service & Community Engagement"),
    ("Avery Dianne Pratt", "Public Service & Community Engagement"),
    ("Morgan Chambers", "Public Service & Community Engagement"),
    ("Analiese Poe", "Public Service & Community Engagement"),
    ("Jewelia Taylor", "Entrepreneurship & Business"),
]


def _winners():
    out = []
    for name, cat in WINNERS_2025:
        out.append({"name": name, "year": 2025, "category": cat, "theme": "25 for 25", "notes": ""})
    for name, cat in WINNERS_2026:
        out.append({"name": name, "year": 2026, "category": cat, "theme": "Gamechangers", "notes": ""})
    return out


THEMES = [
    {
        "year": 2025,
        "title": "25 for 25",
        "tagline": "A Choice to Change the World",
        "description": (
            "The Blueprint 25 for 25 was the inaugural award system designed to spotlight 25 Spelman students "
            "making an impact through leadership, innovation, activism, entrepreneurship, academia, the "
            "arts, and public service. Issues were released periodically, culminating in the announcement "
            "of top honorees during Founders Week.\n\n"
            "Note on cohort size: 2025 was a non-thematic anchor year and honored 25 students to mirror the "
            "year itself. Going forward, all Spotlight cohorts will consist of 18 honorees — a direct nod to "
            "Spelman's founding year, 1881."
        ),
        "faq": [
            {"q": "Who can I nominate?", "a": "Any Spelman student, regardless of classification."},
            {"q": "How many times can I nominate?", "a": "As many times as you want — you can nominate different people."},
            {"q": "Can I nominate myself?", "a": "Yes."},
            {"q": "What does 25 for 25 stand for?", "a": "25 students making an impact in the year 2025."},
        ],
    },
    {
        "year": 2026,
        "title": "Gamechangers",
        "tagline": "Who's that girl changing up the game?",
        "description": (
            "The 2026 Spotlight Awards celebrate Spelman students making powerful plays in "
            "Entrepreneurship & Business, Public Service & Community Engagement, and Arts & Academia — "
            "visionaries shifting culture, expanding opportunity, and redefining excellence on campus and beyond.\n\n"
            "On themes: every Spotlight theme should be intentional. It must be culturally relevant to the year, "
            "resonant with the Spelman student experience, and specific enough to give the editorial team a clear "
            "voice for photoshoots, articles, and promotion. Cohort size: 18 honorees — the '18 for 1881' standard "
            "established after 2025."
        ),
        "faq": [
            {"q": "What is the Spotlight Award?", "a": "It recognizes Spelman students making a meaningful impact in their communities through scholarship, service, creativity, advocacy, and leadership."},
            {"q": "Who is eligible?", "a": "All Spelman students are eligible for nomination."},
            {"q": "Who can nominate?", "a": "Students are strongly encouraged to nominate their Spelman sisters. Self-nominations are allowed."},
            {"q": "How many nominations can a person submit?", "a": "Each Spelman student may nominate up to three people (including themselves)."},
            {"q": "Can someone be nominated more than once?", "a": "Yes. An individual can receive multiple nominations, but each must come from a different person."},
            {"q": "Tip for a strong nomination", "a": "Write with detail and clarity. Assume the selection committee does not know you or the nominee — provide context, impact, and specific examples."},
        ],
    },
]


TIMELINES = [
    # 2025
    {"year": 2025, "month": "February", "date_range": "Feb 1 – Feb 15", "items": ["Nomination form sent out"]},
    {"year": 2025, "month": "February", "date_range": "Feb 16 – Feb 22", "items": ["Finalize rankings", "Send notification emails"]},
    {"year": 2025, "month": "February", "date_range": "Feb 23 – Mar 15", "items": ["Write & publish articles"]},
    {"year": 2025, "month": "March", "date_range": "Mar 16 – Mar 22", "items": ["Finalize top 5 articles for Founders Day print issue"]},
    {"year": 2025, "month": "March", "date_range": "Mar 23 – Apr 5", "items": ["Publish articles"]},
    # 2026
    {"year": 2026, "month": "December", "date_range": "Dec 7 – Dec 13", "items": [
        "Introductory info sent to EIC + Committee",
        "Final approval of theme",
        "Finalize committee members",
        "Finalize full project timeline",
    ]},
    {"year": 2026, "month": "December", "date_range": "Dec 20 — First Committee Meeting", "items": [
        "Role assignments + reflection overview",
        "40 Under 40 overview",
        "Discuss theme shoot: concepts, date, models, videographer",
        "Shortlist videographers",
        "Promotion strategy planning",
        "Assign designer for teaser flyer ('it's back' moment)",
    ]},
    {"year": 2026, "month": "January", "date_range": "Jan 14", "items": ["First Day of Class (FDOC)"]},
    {"year": 2026, "month": "January", "date_range": "Jan 18 – Jan 22", "items": ["Promo shoot"]},
    {"year": 2026, "month": "January", "date_range": "Jan 23 – Jan 29", "items": ["Edit & finalize promo shoot"]},
    {"year": 2026, "month": "January", "date_range": "Jan 31", "items": ["Applications launch"]},
    {"year": 2026, "month": "February", "date_range": "Feb 1 – Feb 12", "items": ["Applications open"]},
    {"year": 2026, "month": "February", "date_range": "Feb 12 – Feb 16", "items": [
        "Selection Committee reviews (in-person encouraged)",
        "Final decisions due by Feb 16, 11:59 PM",
        "Selection Committee chosen by EIC + Perri",
    ]},
    {"year": 2026, "month": "February", "date_range": "Feb 17", "items": [
        "Decision emails sent",
        "Interview sign-ups open",
        "Coordinate interview structure with Nola",
        "All interviews/articles completed by March 12",
        "Interviews posted on Blueprint website for Founders Day",
    ]},
    {"year": 2026, "month": "March", "date_range": "Mar 9 – Mar 13", "items": ["Spring Break"]},
    {"year": 2026, "month": "March", "date_range": "Before Mar 20", "items": ["Group photoshoot (or before print deadline)"]},
    {"year": 2026, "month": "March", "date_range": "Before Mar 31", "items": [
        "All individual photos completed",
        "Article format finalized",
        "All articles completed",
    ]},
    {"year": 2026, "month": "April", "date_range": "TBD", "items": ["Award ceremony (option 1: before Founders Day)"]},
    {"year": 2026, "month": "May", "date_range": "TBD", "items": ["Alternate ceremony window (option 2: late April, before finals)"]},
]


NOMINATION_QUESTIONS = [
    # Nominator
    {"section": "Nominator Information", "order": 1, "type": "short", "options": [], "question": "Nominator's full name"},
    {"section": "Nominator Information", "order": 2, "type": "short", "options": [], "question": "Nominator's Spelman email"},
    {"section": "Nominator Information", "order": 3, "type": "short", "options": [], "question": "Nominator's classification & major (optional)"},
    {"section": "Nominator Information", "order": 4, "type": "choice", "options": ["Share my name with the nominee", "Keep me anonymous to the nominee"],
     "question": "Anonymity preference — do you wish to remain anonymous to the nominee?"},
    {"section": "Nominator Information", "order": 5, "type": "choice", "options": ["Yes", "No"], "question": "Are you nominating yourself?"},

    # Nominee
    {"section": "About the Nominee", "order": 1, "type": "short", "options": [], "question": "Nominee's full name"},
    {"section": "About the Nominee", "order": 2, "type": "short", "options": [], "question": "Nominee's Spelman email"},
    {"section": "About the Nominee", "order": 3, "type": "short", "options": [], "question": "Classification (First-year / Sophomore / Junior / Senior)"},
    {"section": "About the Nominee", "order": 4, "type": "short", "options": [], "question": "Major"},
    {"section": "About the Nominee", "order": 5, "type": "choice",
     "options": ["Arts & Academia", "Entrepreneurship & Business", "Public Service & Community Engagement"],
     "question": "Category of nomination"},
    {"section": "About the Nominee", "order": 6, "type": "long", "options": [],
     "question": "Nominee's social media handles and/or links (Instagram, LinkedIn, portfolio, business, etc.) — one per line"},

    # Impact
    {"section": "Impact & Excellence", "order": 1, "type": "long", "options": [],
     "question": "Why does this nominee deserve the Spotlight Award? Provide specific examples of leadership, impact, and excellence."},
    {"section": "Impact & Excellence", "order": 2, "type": "long", "options": [],
     "question": "How has the nominee contributed to campus involvement or community service?"},
    {"section": "Impact & Excellence", "order": 3, "type": "long", "options": [],
     "question": "What innovation, initiative, or legacy has the nominee built at Spelman or beyond?"},
    {"section": "Impact & Excellence", "order": 4, "type": "long", "options": [],
     "question": "Personal or professional impact — describe wins, projects, publications, businesses, or programs."},

    {"section": "Confirmation", "order": 1, "type": "choice", "options": ["Yes", "No"],
     "question": "I understand each Spelman student may nominate up to three people, and duplicate nominations must come from different people."},
]


RUBRIC = [
    {"order": 1, "name": "Leadership & Campus Involvement", "max_score": 5,
     "description": "Formal or informal leadership roles, org involvement, and initiative shown at Spelman."},
    {"order": 2, "name": "Community Service & Philanthropy", "max_score": 5,
     "description": "Consistent, measurable service and philanthropic impact in the AUC or broader community."},
    {"order": 3, "name": "Personal & Professional Impact", "max_score": 5,
     "description": "Career wins, publications, businesses, programs, awards, or advocacy achieved by the nominee."},
    {"order": 4, "name": "Innovation & Legacy at Spelman", "max_score": 5,
     "description": "Original initiatives, cultural contributions, or lasting programs the nominee has built."},
    {"order": 5, "name": "Peer Review Score", "max_score": 5,
     "description": "Selection committee peer review score."},
]


TRACKING_SELECTION = [
    {"board": "selection", "data": {"Name": "Kennedy Rogers", "Status": "Accepted", "Nominations": 6, "Avg Score": 24.9, "Notes": "Awardee"}},
    {"board": "selection", "data": {"Name": "Mariama Barry", "Status": "Accepted", "Nominations": 2, "Avg Score": 24.6, "Notes": "Awardee"}},
    {"board": "selection", "data": {"Name": "Ariana Swindell", "Status": "Accepted", "Nominations": 7, "Avg Score": 24.1, "Notes": "Awardee"}},
    {"board": "selection", "data": {"Name": "Ava Makombe", "Status": "Waitlist", "Nominations": 1, "Avg Score": 21.0, "Notes": "Alternate — moved to shortlist"}},
    {"board": "selection", "data": {"Name": "Nyla Lovelock", "Status": "Waitlist", "Nominations": 4, "Avg Score": 20.4, "Notes": "Alternate"}},
    {"board": "selection", "data": {"Name": "Zuri Riggins", "Status": "Rejected", "Nominations": 1, "Avg Score": 14.5, "Notes": "Below cutoff"}},
    {"board": "selection", "data": {"Name": "Mushira Housen", "Status": "Rejected", "Nominations": 1, "Avg Score": 10.5, "Notes": "Below cutoff"}},
    {"board": "selection", "data": {"Name": "Alexa Norman", "Status": "Disqualified", "Nominations": 7, "Avg Score": 17.4, "Notes": "Ineligible — committee affiliation"}},
]

TRACKING_PRODUCTION = [
    {"board": "production", "data": {
        "Awardee": "Kennedy Rogers", "Staff Writer": "Amara Smith", "Editor": "Bethany Benjamin",
        "Interview": "Complete", "Article": "Complete", "Uploaded": "Yes"}},
    {"board": "production", "data": {
        "Awardee": "Mariama Barry", "Staff Writer": "Dhiara Berkley", "Editor": "Bethany Benjamin",
        "Interview": "Complete", "Article": "Complete", "Uploaded": "Not yet"}},
    {"board": "production", "data": {
        "Awardee": "Ariana Swindell", "Staff Writer": "Paris George", "Editor": "Hala Karim",
        "Interview": "Complete", "Article": "Complete", "Uploaded": "Yes"}},
    {"board": "production", "data": {
        "Awardee": "Madison Harris", "Staff Writer": "Bethany Benjamin", "Editor": "Hala Karim",
        "Interview": "Complete", "Article": "In progress", "Uploaded": "N/A"}},
    {"board": "production", "data": {
        "Awardee": "Analiese Poe", "Staff Writer": "Nola James", "Editor": "N/A",
        "Interview": "N/A", "Article": "Waiting on article", "Uploaded": "N/A"}},
    {"board": "production", "data": {
        "Awardee": "Aubrey Patton", "Staff Writer": "Aeiress Stancil", "Editor": "N/A",
        "Interview": "Not conducted", "Article": "N/A", "Uploaded": "N/A"}},
]


PHOTOS = [
    {"year": 2025, "url": "https://images.pexels.com/photos/6532364/pexels-photo-6532364.jpeg",
     "caption": "25 for 25 promo shoot (placeholder)"},
    {"year": 2025, "url": "https://images.pexels.com/photos/36512552/pexels-photo-36512552.jpeg",
     "caption": "Award show (placeholder)"},
    {"year": 2026, "url": "https://images.pexels.com/photos/26178655/pexels-photo-26178655.jpeg",
     "caption": "Gamechangers editorial cover (placeholder)"},
    {"year": 2026, "url": "https://images.pexels.com/photos/1729931/pexels-photo-1729931.jpeg",
     "caption": "Award show (placeholder)"},
]


CONTACTS = [
    {"role": "Creator & Founding Chair", "name": "Kelsie Tillage", "year": "2025 & 2026",
     "email": "kelsietillage@gmail.com", "phone": "(225) 747-0719",
     "note": "I am so excited to have this be continued — please reach out if you ever need anything. xoxo"},
    {"role": "Founding Media Chair", "name": "Summer Phenix", "year": "2025", "email": "", "phone": "",
     "note": "Founding media chair, 25 for 25."},
    {"role": "Co-Chair", "name": "Ava White", "year": "2027", "email": "", "phone": "", "note": ""},
    {"role": "Co-Chair", "name": "Madeline Wright", "year": "2027", "email": "", "phone": "", "note": ""},
]


EMAILS = [
    {
        "order": 1,
        "audience": "Awardee",
        "title": "Awardee acceptance email",
        "when": "Send after selection committee finalizes honorees.",
        "subject": "Congratulations! You've Been Selected for the Spotlight Award [insert theme]",
        "body": (
            "Dear [Insert Name Here],\n\n"
            "On behalf of The Spelman Blueprint, we are excited to inform you that you have been selected "
            "as an honoree for our Spotlight Award! Your leadership, service, innovation, and impact truly "
            "embody the spirit of excellence that this award seeks to uplift and we're proud to recognize you "
            "as a leader in [Entrepreneurship & Business / Public Service & Community Engagement / Arts & Academia].\n\n"
            "To accept this recognition, please respond to this email no later than [insert date].\n\n"
            "Next Steps:\n"
            "• Once you accept, a staff writer will reach out to schedule an interview for your feature in "
            "The Spelman Blueprint, where we will highlight your journey and contributions.\n"
            "• We will also coordinate a photoshoot for the official reveal of our honorees. These photos will "
            "be featured in our print issue, on our social media platforms, and on our website. Please use "
            "this link [insert link] to help us gauge availability.\n"
            "• Since we plan to do a reveal, we kindly ask that you refrain from sharing this recognition on "
            "LinkedIn or social media until the confirmed activation date.\n\n"
            "Awards Ceremony:\n"
            "We also invite you to attend our Spotlight Award Ceremony, tentatively scheduled for [insert date]. "
            "More details will follow as we finalize the event.\n\n"
            "Congratulations again on this well-deserved recognition! If you have any questions, please feel "
            "free to reach out. We look forward to celebrating your accomplishments and receiving your acceptance "
            "no later than [insert date].\n\n"
            "Sincerely,\n"
            "The Spotlight Award Committee"
        ),
    },
    {
        "order": 2,
        "audience": "Nominator (selected)",
        "title": "Nominator — nominee accepted",
        "when": "Send after the awardee accepts the recognition.",
        "subject": "Congratulations! Your nominee has been selected for the Spotlight Award: [insert theme]!",
        "body": (
            "Hello,\n\n"
            "On behalf of The Spelman Blueprint, we sincerely thank you for submitting a nomination for our "
            "Spotlight Award: [insert theme]. We appreciate the effort and enthusiasm you put into recognizing "
            "and spotlighting your nominee.\n\n"
            "After careful consideration, we are excited to inform you that your nominee, [Insert Name Here], "
            "has been selected for the Spotlight Award! We have already notified them of their acceptance.\n\n"
            "We truly appreciate your participation and support, and we encourage you to continue celebrating "
            "and uplifting those who are making a choice to change the world. Thank you again for your "
            "thoughtful submission.\n\n"
            "Sincerely,\n"
            "The Spotlight Award Committee"
        ),
    },
    {
        "order": 3,
        "audience": "Nominator (rejected)",
        "title": "Nominator — nominee not selected",
        "when": "Send to every nominator whose nominee was not chosen.",
        "subject": "Update on Your Spotlight Award: [insert theme] Nomination",
        "body": (
            "Dear [Nominator's Name],\n\n"
            "On behalf of The Spelman Blueprint, we sincerely thank you for submitting a nomination for the "
            "Spotlight Award [insert theme]. We appreciate the effort and enthusiasm you put into recognizing "
            "and spotlighting your nominee.\n\n"
            "After careful consideration, we regret to inform you that your nominee, [insert name here], has "
            "not been selected for the Spotlight Award. This decision was not easy, as we received many "
            "outstanding nominations.\n\n"
            "We truly appreciate your participation and support, and we encourage you to continue celebrating "
            "and uplifting those who are making a choice to change the world. Thank you again for your "
            "thoughtful submission.\n\n"
            "Sincerely,\n"
            "The Spotlight Award Committee"
        ),
    },
    {
        "order": 4,
        "audience": "Awardee (post-acceptance)",
        "title": "Staff writer hand-off",
        "when": "Send once the honoree confirms acceptance.",
        "subject": "Your Spotlight Award interview — staff writer assignment",
        "body": (
            "Thank you for confirming your nomination! A staff writer will be reaching out to you soon to "
            "schedule an interview.\n\n"
            "Your assigned staff writer is [Writer's Name].\n\n"
            "Please be sure to fill out the availability form, and we will follow up with details regarding "
            "the photoshoot at a later date.\n\n"
            "Thank you again, and congratulations!\n\n"
            "Sincerely,\n"
            "The Spotlight Award Committee"
        ),
    },
]


async def _seed_if_empty(db, coll, docs):
    if await db[coll].count_documents({}) == 0 and docs:
        await db[coll].insert_many(_mk(docs))


async def seed_content(db):
    # Migration: if seed version outdated, drop managed collections so they re-seed with new content.
    meta = await db.meta.find_one({"key": "seed_version"}) or {}
    if meta.get("value", 0) < SEED_VERSION:
        for coll in ("themes", "rubric", "nomination", "tracking", "photos", "contacts", "emails"):
            await db[coll].drop()
        await db.meta.update_one(
            {"key": "seed_version"},
            {"$set": {"value": SEED_VERSION}},
            upsert=True,
        )

    await _seed_if_empty(db, "winners", _winners())
    await _seed_if_empty(db, "themes", THEMES)
    await _seed_if_empty(db, "timelines", TIMELINES)
    await _seed_if_empty(db, "nomination", NOMINATION_QUESTIONS)
    await _seed_if_empty(db, "rubric", RUBRIC)
    await _seed_if_empty(db, "tracking", TRACKING_SELECTION + TRACKING_PRODUCTION)
    await _seed_if_empty(db, "photos", PHOTOS)
    await _seed_if_empty(db, "contacts", CONTACTS)
    await _seed_if_empty(db, "emails", EMAILS)
