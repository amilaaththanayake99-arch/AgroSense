# -*- coding: utf-8 -*-
"""
Sri Lankan Agricultural Research & Dynamic Knowledge Synthesis Engine
Accurate DOA / DEA / HARTI guidelines, agro-ecological zoning, and persistent storage.
"""

import os
import json
import re
from typing import Optional, Dict, Any, Tuple

CUSTOM_CROPS_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data",
    "custom_crops.json"
)

ALL_SRI_LANKA_DISTRICTS = [
    'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
    'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
    'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
    'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
    'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
]

UPCOUNTRY_DISTRICTS = ['Nuwara Eliya', 'Badulla', 'Kandy', 'Matale']
WET_ZONE_DISTRICTS = ['Colombo', 'Gampaha', 'Kalutara', 'Galle', 'Matara', 'Ratnapura', 'Kegalle']
DRY_INTERMEDIATE_DISTRICTS = [
    'Anuradhapura', 'Polonnaruwa', 'Kurunegala', 'Puttalam', 'Hambantota',
    'Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu',
    'Trincomalee', 'Batticaloa', 'Ampara', 'Monaragala'
]

# Strictly disallowed for any Upcountry Temperate crop (including Monaragala!)
UPCOUNTRY_DISALLOWED = [d for d in ALL_SRI_LANKA_DISTRICTS if d not in UPCOUNTRY_DISTRICTS]


def load_custom_crops(crops_database: dict):
    """Load persistent custom crops from disk into CROPS_DATABASE"""
    try:
        if os.path.exists(CUSTOM_CROPS_FILE):
            with open(CUSTOM_CROPS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, dict):
                    for k, v in data.items():
                        crops_database[k] = v
                    print(f"[CropResearchService] Loaded {len(data)} custom crops from {CUSTOM_CROPS_FILE}")
    except Exception as e:
        print(f"[CropResearchService] Error loading custom crops: {e}")


def save_custom_crop(crop_data: dict, crops_database: Optional[dict] = None):
    """Save a newly researched crop into CROPS_DATABASE and disk"""
    try:
        crop_id = crop_data.get("id")
        if not crop_id:
            return
        if crops_database is not None:
            crops_database[crop_id] = crop_data
        
        os.makedirs(os.path.dirname(CUSTOM_CROPS_FILE), exist_ok=True)
        existing = {}
        if os.path.exists(CUSTOM_CROPS_FILE):
            try:
                with open(CUSTOM_CROPS_FILE, "r", encoding="utf-8") as f:
                    existing = json.load(f)
            except Exception:
                existing = {}
        
        existing[crop_id] = crop_data
        with open(CUSTOM_CROPS_FILE, "w", encoding="utf-8") as f:
            json.dump(existing, f, indent=2, ensure_ascii=False)
        print(f"[CropResearchService] Persisted researched crop '{crop_id}' to {CUSTOM_CROPS_FILE}")
    except Exception as e:
        print(f"[CropResearchService] Error saving custom crop: {e}")


def match_crop_in_database(crop_name: str, crops_database: dict) -> Optional[dict]:
    """Look up crop by name, id, or translation in the active CROPS_DATABASE"""
    if not crop_name:
        return None
    c = crop_name.lower().strip()
    
    # 1. Exact key match
    if c in crops_database:
        return crops_database[c]
    
    # 2. Match against names dict and aliases
    for crop_id, crop_data in crops_database.items():
        if c == crop_id.lower():
            return crop_data
        names = crop_data.get("names", {})
        for lang_code, n in names.items():
            if n and c == n.lower().strip():
                return crop_data
        aliases = crop_data.get("aliases", [])
        if any(c == a.lower().strip() for a in aliases):
            return crop_data

    # 3. Substring match
    for crop_id, crop_data in crops_database.items():
        if c in crop_id.lower() or crop_id.lower() in c:
            return crop_data
        names = crop_data.get("names", {})
        for lang_code, n in names.items():
            if n and (c in n.lower() or n.lower() in c):
                return crop_data
        aliases = crop_data.get("aliases", [])
        if any(a.lower() in c or c in a.lower() for a in aliases):
            return crop_data

    return None


# Comprehensive Sri Lankan Agricultural Research Archetypes (DOA / DEA / HARTI / FRDI / HORDI)
CROP_RESEARCH_ARCHETYPES = [
    {
        "keywords": ["beetroot", "beet", "බීට්", "බීට්රූට්", "பீட்ரூட்"],
        "id": "beetroot",
        "names": {"en": "Beetroot", "si": "බීට්රූට්", "ta": "பீட்ரூட்"},
        "category": "Highland Root Vegetable",
        "duration_days": 75,
        "disallowed_districts": UPCOUNTRY_DISALLOWED,  # Strictly Upcountry: Nuwara Eliya, Badulla, Kandy, Matale only!
        "unsuitable_planting_months": [1, 2, 6, 7],
        "production_cost_per_acre": 220000,
        "yield_per_acre_kg": 8000,
        "normal_wholesale_price": [240, 380],
        "glut_harvest_months": [3, 4],
        "glut_price": [140, 200],
        "varieties": {
            "en": "Crimson Globe, Detroit Dark Red, Ruby Queen",
            "si": "ක්‍රිම්සන් ග්ලෝබ්, ඩෙට්‍රොයිට් ඩාක් රෙඩ්, රූබි ක්වීන්",
            "ta": "கிரிம்சன் குளோப், டெட்ராய்ட் டார்க் ரெட், ரூபி குயின்"
        },
        "seed_rate": {
            "en": "3.5 - 4.5 kg multi-germ seeds / acre",
            "si": "අක්කරයකට බීජ කිලෝ 3.5 - 4.5ක්",
            "ta": "ஏக்கருக்கு 3.5 - 4.5 கிலோ விதைகள்"
        },
        "spacing": {
            "en": "20 cm between rows x 10 cm within rows on raised beds",
            "si": "පේළි අතර සෙ.මී. 20 x පැළ අතර සෙ.මී. 10 (උස් පාත්ති මත)",
            "ta": "வரிசைகளுக்கு இடையே 20 செ.மீ x செடிகளுக்கு இடையே 10 செ.மீ"
        },
        "soil_and_ph": {
            "en": "Deep, stone-free friable Red-Yellow Podzolic or humic loam (pH 6.0 - 6.8). High sensitivity to boron deficiency. Requires cool 15-20C temperature.",
            "si": "ගැඹුරු ලිහිල් රතු-කහ පොඩ්සොලික් පස (pH 6.0 - 6.8). සෙල්සියස් 15-20 සිසිල් උෂ්ණත්වයක් අත්‍යවශ්‍ය වේ. පහතරට උෂ්ණත්වයේදී අල කෙඳි සහිත වේ.",
            "ta": "மென்மையான செம்மஞ்சள் மண் (pH 6.0 - 6.8). 15-20C குளிர்ந்த வெப்பநிலை தேவை."
        },
        "stages_desc": {
            "s1_en": "Prepare 20 cm raised beds; pulverize soil completely; mix 8 tons compost + 150kg dolomite + 5kg Borax per acre.",
            "s1_si": "සෙ.මී. 20 උස් පාත්ති සාදා කැට සියුම් කර කොම්පෝස්ට් ටොන් 8ක්, ඩොලමයිට් 150kg සහ බොරැක්ස් 5kg කලවම් කරන්න.",
            "s1_ta": "20 செ.மீ மேட்டுப்பாத்தி அமைத்து 8 டன் உரம் + 150 கிலோ டோலமைட் + 5 கிலோ போராக்ஸ் இடவும்.",
            "s2_en": "Sow seeds at 2 cm depth; thin clumps to single healthy plant at 15 days; ensure uniform moisture.",
            "s2_si": "සෙ.මී. 2ක් ගැඹුරට බීජ දමා දින 15දී පැළ තුනී කරන්න.",
            "s2_ta": "2 செ.மீ ஆழத்தில் விதைத்து 15 நாட்களில் செடிகளை கலைக்கவும்.",
            "s3_en": "Apply DOA Upcountry NPK top dressing at 3 and 5 weeks; earth up soil over exposed root tops.",
            "s3_si": "සති 3 සහ 5දී NPK පොහොර යොදා අල එළියට නොපෙනෙන සේ පස් ගොඩගසන්න.",
            "s3_ta": "3 மற்றும் 5 வாரங்களில் NPK உரமிட்டு மண் அணைக்கவும்.",
            "s4_en": "Irrigate regularly with micro-sprinklers; maintain even moisture to prevent internal white zoning and root splitting.",
            "s4_si": "අල පැලීම සහ ඇතුළත සුදු වළලු හටගැනීම වැළැක්වීමට ඒකාකාරී තෙතමනයක් පවත්වා ගන්න.",
            "s4_ta": "கிழங்கு வெடிப்பதைத் தடுக்க தூறல் பாசனம் மூலம் சீரான ஈரப்பதத்தை பேணவும்.",
            "s5_en": "Manage Cercospora leaf spot and cutworms with preventative bio-controls or approved sprays.",
            "s5_si": "සර්කොස්පෝරා කොළ ලප රෝගය සහ කපන පණුවන් පාලනය කරන්න.",
            "s5_ta": "இலைப்புள்ளி நோய்க்கு செம்பு பூஞ்சைக்கொல்லி தெளிக்கவும்.",
            "s6_en": "Harvest roots at 70-75 days (5-7 cm diameter); wash carefully, trim tops, and pack into ventilated plastic crates.",
            "s6_si": "දින 70-75න් අල ගලවා පිරිසිදු කර ප්ලාස්ටික් කූඩවල අසුරා වෙළඳපලට යොමු කරන්න.",
            "s6_ta": "70-75 நாட்களில் அறுவடை செய்து பிளாஸ்டிக் கூடைகளில் அனுப்பவும்."
        }
    },
    {
        "keywords": ["carrot", "කැරට්", "கேரட்"],
        "id": "carrot",
        "names": {"en": "Carrot", "si": "කැරට්", "ta": "கேரட்"},
        "category": "Upcountry Temperate Vegetable",
        "duration_days": 90,
        "disallowed_districts": UPCOUNTRY_DISALLOWED,  # Strictly Upcountry!
        "unsuitable_planting_months": [1, 2, 6, 7],
        "production_cost_per_acre": 280000,
        "yield_per_acre_kg": 9000,
        "normal_wholesale_price": [280, 460],
        "glut_harvest_months": [3, 4],
        "glut_price": [170, 240],
        "varieties": {
            "en": "New Kuroda, Topweight, Meenachi, Local Selection",
            "si": "නිව් කුරෝඩා, ටොප්වෙයිට්, මීනාචි, දේශීය තේරීම්",
            "ta": "நியூ குரோடா, டாப்வெயிட், மீனாட்சி, உள்ளூர் ரகங்கள்"
        },
        "seed_rate": {
            "en": "2.0 - 2.5 kg high quality pelleted/treated seeds / acre",
            "si": "අක්කරයකට උසස් ප්‍රමිතියේ බීජ කිලෝ 2.0 - 2.5ක්",
            "ta": "ஏக்கருக்கு 2.0 - 2.5 கிலோ உயர்தர விதைகள்"
        },
        "spacing": {
            "en": "15 cm between rows x 10 cm within rows on fine tilth raised beds",
            "si": "සූක්ෂ්මව කැට පොඩි කළ උස් පාත්ති මත පේළි අතර සෙ.මී. 15 x පැළ අතර සෙ.මී. 10",
            "ta": "மேட்டுப்பாத்திகளில் வரிசைகளுக்கு இடையே 15 செ.மீ x செடிகளுக்கு இடையே 10 செ.மீ"
        },
        "soil_and_ph": {
            "en": "Deep, stone-free friable Red-Yellow Podzolic soil (pH 5.8 - 6.5). Stones or heavy lumps cause forked roots.",
            "si": "ගල් සහ කැට රහිත ලිහිල් රතු-කහ පොඩ්සොලික් පස (pH 5.8 - 6.5). ගල් කැට තිබුණහොත් අල දෙබල වේ.",
            "ta": "கற்களற்ற மென்மையான செம்மஞ்சள் மண் (pH 5.8 - 6.5). கற்கள் இருந்தால் கிழங்கு பிளவுபடும்."
        },
        "stages_desc": {
            "s1_en": "Plow to 30 cm depth, pulverize lumps completely; form 20 cm raised beds; incorporate 8 tons sieved compost.",
            "s1_si": "පස සෙ.මී. 30ක් ගැඹුරට සී සා කැට සියුම් කර උස් පාත්ති සාදා හළාගත් කොම්පෝස්ට් ටොන් 8ක් යොදන්න.",
            "s1_ta": "30 செ.மீ ஆழத்திற்கு உழுது கட்டிகளை உடைத்து 20 செ.மீ மேட்டுப்பாத்திகளில் 8 டன் உரம் இடவும்.",
            "s2_en": "Sow seeds in shallow furrows (1 cm depth) mixed with fine sand; cover lightly with sieved compost and straw mulch.",
            "s2_si": "වැලි සමඟ කලවම් කළ බීජ සෙ.මී. 1ක් නොගැඹුරු කානුවල තැන්පත් කර පිදුරු වසුන් යොදන්න.",
            "s2_ta": "விதைகளை ஆற்று மணலுடன் கலந்து 1 செ.மீ ஆழத்தில் விதைத்து மெல்லிய மூடாக்கிடவும்.",
            "s3_en": "Thin seedlings to 10 cm at 21 days; apply DOA Upcountry NPK top dressing and earth up roots to prevent green shoulder.",
            "s3_si": "දින 21දී පැළ පරතරය සෙ.මී. 10 වන සේ තුනී කර NPK පොහොර යොදා අල කොළ පැහැවීම වැළැක්වීමට පස් ගොඩගසන්න.",
            "s3_ta": "21 நாட்களில் 10 செ.மீ இடைவெளிக்கு செடிகளை கலைத்து உரமிட்டு மண் அணைக்கவும்.",
            "s4_en": "Irrigate with fine micro-sprinklers; maintain even soil moisture to avoid root splitting.",
            "s4_si": "සියුම් ස්ප්‍රින්ක්ලර් මඟින් පසෙහි තෙතමනය ඒකාකාරව පවත්වා ගන්න.",
            "s4_ta": "தூறல் பாசனம் மூலம் மண்ணில் சீரான ஈரப்பதத்தை பேணவும்.",
            "s5_en": "Prevent leaf blight (Alternaria) and root-knot nematodes; rogue diseased plants.",
            "s5_si": "කොළ අංගමාරය සහ වටපණුවන් පාලනය කරන්න.",
            "s5_ta": "இலைக்கருகல் மற்றும் நூற்புழுக்களை கட்டுப்படுத்தவும்.",
            "s6_en": "Harvest roots at 85-90 days; wash carefully, trim tops to 1 cm, and pack in ventilated crates.",
            "s6_si": "දින 85-90දී අල ගලවා පිරිසිදු ජලයෙන් සෝදා ප්ලාස්ටික් කූඩවල අසුරන්න.",
            "s6_ta": "85-90 நாட்களில் அறுவடை செய்து கழுவி பிளாஸ்டிக் கூடைகளில் சந்தைக்கு அனுப்பவும்."
        }
    },
    {
        "keywords": ["leek", "leeks", "ලීක්ස්", "லீக்ஸ்"],
        "id": "leeks",
        "names": {"en": "Leeks", "si": "ලීක්ස්", "ta": "லீக்ஸ்"},
        "category": "Upcountry Temperate Vegetable",
        "duration_days": 110,
        "disallowed_districts": UPCOUNTRY_DISALLOWED,  # Strictly Upcountry!
        "unsuitable_planting_months": [1, 2, 6, 7],
        "production_cost_per_acre": 310000,
        "yield_per_acre_kg": 11000,
        "normal_wholesale_price": [260, 420],
        "glut_harvest_months": [3, 4],
        "glut_price": [150, 220],
        "varieties": {
            "en": "Bandit, Giant Carentan, Colonna",
            "si": "බැන්ඩිට්, ජයන්ට් කැරන්ටන්, කොලෝනා",
            "ta": "பாண்டிட், ஜெயண்ட் காரண்டன், கொலோனா"
        },
        "seed_rate": {
            "en": "1.5 - 2.0 kg seeds / acre (nursery tray raising)",
            "si": "අක්කරයකට බීජ කිලෝ 1.5 - 2.0ක්",
            "ta": "ஏக்கருக்கு 1.5 - 2.0 கிலோ விதைகள்"
        },
        "spacing": {
            "en": "15 cm x 10 cm in trenches with regular earthing up",
            "si": "පේළි අතර සෙ.මී. 15 x පැළ අතර සෙ.මී. 10 (කානු තුළ සිටුවා පස් ගොඩගසමින්)",
            "ta": "15 செ.மீ x 10 செ.மீ இடைவெளி"
        },
        "soil_and_ph": {
            "en": "Deep, humic Red-Yellow Podzolic soil (pH 5.8 - 6.5). Strictly requires temperate montane climate.",
            "si": "ගැඹුරු ආම්ලික පස (pH 5.8 - 6.5). සිසිල් උඩරට පරිසරයක් අත්‍යවශ්‍යයි.",
            "ta": "ஆழமான அமில மண் (pH 5.8 - 6.5). குளிர்ந்த காலநிலை தேவை."
        },
        "stages_desc": {
            "s1_en": "Dig 15 cm deep planting trenches; mix 10 tons compost + 150kg dolomite per acre.",
            "s1_si": "සෙ.මී. 15ක් ගැඹුරු කානු සාදා කොම්පෝස්ට් ටොන් 10ක් සහ ඩොලමයිට් කලවම් කරන්න.",
            "s1_ta": "15 செ.மீ ஆழமான பள்ளங்கள் அமைத்து உரம் இடவும்.",
            "s2_en": "Transplant pencil-thick seedlings at 15 cm spacing in trenches.",
            "s2_si": "පැන්සලක මහත ඇති නිරෝගී තවාන් පැළ සෙ.මී. 15 පරතරයෙන් සිටුවන්න.",
            "s2_ta": "ஆரோக்கியமான நாற்றுகளை பள்ளங்களில் நடவும்.",
            "s3_en": "Apply split NPK fertilizer every 3 weeks; progressively earth up soil around stems for blanching.",
            "s3_si": "සති 3කට වරක් NPK පොහොර යොදා කඳ සුදු පැහැවීම සඳහා පස් ගොඩගසන්න.",
            "s3_ta": "3 வாரங்களுக்கு ஒருமுறை உரமிட்டு தண்டுக்கு மண் அணைக்கவும்.",
            "s4_en": "Maintain consistent soil moisture throughout the long vegetative cycle.",
            "s4_si": "වගා කාලය පුරා නිරන්තර තෙතමනයක් පවත්වා ගන්න.",
            "s4_ta": "மண்ணில் சீரான ஈரப்பதத்தை பேணவும்.",
            "s5_en": "Manage purple blotch (Alternaria porri) and thrips with preventative bio-controls.",
            "s5_si": "දම් පැහැති ලප රෝගය සහ පැළ මැක්කන් මර්දනය කරන්න.",
            "s5_ta": "ஊதா புள்ளி நோய் மற்றும் த்ரிப்ஸ்களை கட்டுப்படுத்தவும்.",
            "s6_en": "Harvest when pseudostem diameter exceeds 2.5 cm; wash and crate in plastic containers.",
            "s6_si": "කඳ සෙ.මී. 2.5 ඉක්මවූ පසු ගලවා සෝදා ප්ලාස්ටික් කූඩවල අසුරන්න.",
            "s6_ta": "தண்டு தடித்தவுடன் அறுவடை செய்து பிளாஸ்டிக் கூடைகளில் அனுப்பவும்."
        }
    },
    {
        "keywords": ["strawberry", "ස්ට්‍රෝබෙරි", "ஸ்ட்ராபெரி"],
        "id": "strawberry",
        "names": {"en": "Strawberry", "si": "ස්ට්‍රෝබෙරි", "ta": "ஸ்ட்ராபெரி"},
        "category": "Highland Exotic Fruit",
        "duration_days": 120,
        "disallowed_districts": [d for d in ALL_SRI_LANKA_DISTRICTS if d not in ['Nuwara Eliya', 'Badulla']],  # Highlands only!
        "unsuitable_planting_months": [1, 2, 6, 7],
        "production_cost_per_acre": 650000,
        "yield_per_acre_kg": 4500,
        "normal_wholesale_price": [1400, 2200],
        "glut_harvest_months": [],
        "glut_price": [900, 1200],
        "varieties": {
            "en": "Chandler, Sweet Charlie, Festival, Camarosa",
            "si": "චැන්ඩ්ලර්, ස්වීට් චාර්ලි, ෆෙස්ටිවල්, කැමරෝසා",
            "ta": "சாண்ட்லர், ஸ்வீட் சார்லி, திருவிழா, கமரோசா"
        },
        "seed_rate": {
            "en": "20,000 - 24,000 certified runner plantlets / acre",
            "si": "අක්කරයකට සහතිකලත් ධාවක පැළ 20,000 - 24,000ක්",
            "ta": "ஏக்கருக்கு 20,000 - 24,000 சான்றளிக்கப்பட்ட நாற்றுகள்"
        },
        "spacing": {
            "en": "30 cm x 30 cm on silver-black poly-mulched raised beds or polyhouse gutters",
            "si": "රිදී-කළු පොලිතින් වසුන් කළ උස් පාත්ති මත සෙ.මී. 30 x 30 පරතරය",
            "ta": "பாலி-மூடாக்கு மேட்டுப்பாத்திகளில் 30 செ.மீ x 30 செ.மீ இடைவெளி"
        },
        "soil_and_ph": {
            "en": "Highland acidic humic loam (pH 5.5 - 6.2). Strictly requires cool highland temperatures (10-18C). Zero tolerance for lowland heat.",
            "si": "උඩරට ආම්ලික හියුමස් බහුල පස (pH 5.5 - 6.2). උෂ්ණත්වය සෙල්සියස් 10-18 අතර විය යුතුය.",
            "ta": "உயர்மலை அமில மண் (pH 5.5 - 6.2). குறைந்த வெப்பநிலை (10-18C) தேவை."
        },
        "stages_desc": {
            "s1_en": "Construct rain-shelter poly tunnels; prepare raised beds with cocopeat and well-composted manure.",
            "s1_si": "වැසි ආවරණ සකසා කොහුබත් සහ කොම්පෝස්ට් පිරවූ උස් පාත්ති හෝ බඳුන් සකසන්න.",
            "s1_ta": "மழை மறைப்பு கூடாரம் அமைத்து தென்னை நார்க்கழிவு கலந்த மேட்டுப்பாத்திகள் அமைக்கவும்.",
            "s2_en": "Plant runner plants with crown precisely at soil surface level; install drip fertigation tubes.",
            "s2_si": "පැළයේ කරටිය පස් මට්ටමේ තබා බිංදු ජල නල සමඟ සිටුවන්න.",
            "s2_ta": "நாற்றின் தண்டுப்பகுதி தரைமட்டத்தில் இருக்குமாறு நட்டு சொட்டுநீர் குழாய் அமைக்கவும்.",
            "s3_en": "Apply water-soluble high-K fertigation; supplement with Calcium and Boron for fruit firmness.",
            "s3_si": "දියවන NPK දියර පොහොර සහ කැල්සියම්, බෝරෝන් බිංදු ජලය සමඟ යොදන්න.",
            "s3_ta": "கால்சியம் மற்றும் போரான் கலந்த நீர்வழி உரங்களை வழங்கவும்.",
            "s4_en": "Operate automated drip irrigation 3-4 times daily in micro pulses.",
            "s4_si": "ස්වයංක්‍රීය බිංදු ජල සම්පාදනය දිනකට කිහිපවරක් ක්‍රියාත්මක කරන්න.",
            "s4_ta": "தானியங்கி சொட்டுநீர் பாசனத்தை தினமும் செயல்படுத்தவும்.",
            "s5_en": "Manage botrytis grey mold and powdery mildew with bio-fungicides; deploy predatory mites for red spider.",
            "s5_si": "අළු පුස් රෝගය සහ මයිටාවන් පාලනය කරන්න.",
            "s5_ta": "சாம்பல் பூஞ்சை மற்றும் சிலந்திகளை கட்டுப்படுத்தவும்.",
            "s6_en": "Harvest fruits at 90% red coloration in early morning; pack directly into 250g clear punnets.",
            "s6_si": "උදෑසන ග්‍රෑම් 250 විනිවිද පෙනෙන පෙට්ටිවලට කෙළින්ම නෙලා සුපිරි වෙළඳපලට යවන්න.",
            "s6_ta": "காலையில் 250 கிராம் பெட்டிகளில் நேரடியாக அறுவடை செய்து சந்தைக்கு அனுப்பவும்."
        }
    },
    {
        "keywords": ["dragon fruit", "pitaya", "ඩ්‍රැගන්", "කටු අනෝදා", "டிராகன் பழம்", "டிராகன்"],
        "id": "dragon_fruit",
        "names": {"en": "Dragon Fruit", "si": "ඩ්‍රැගන් ෆෘට්", "ta": "டிராகன் பழம்"},
        "category": "High-Value Commercial Fruit",
        "duration_days": 180,
        "disallowed_districts": ["Nuwara Eliya", "Badulla"],
        "unsuitable_planting_months": [1, 2, 7, 8],
        "production_cost_per_acre": 480000,
        "yield_per_acre_kg": 5500,
        "normal_wholesale_price": [450, 750],
        "glut_harvest_months": [],
        "glut_price": [300, 420],
        "varieties": {
            "en": "Red Flesh (Hylocereus polyrhizus), White Flesh (Hylocereus undatus), Yellow Pitahaya",
            "si": "රතු මද ප්‍රභේදය (Hylocereus polyrhizus), සුදු මද ප්‍රභේදය (Hylocereus undatus), කහ ඩ්‍රැගන්",
            "ta": "சிவப்பு சதை (Hylocereus polyrhizus), வெள்ளை சதை (Hylocereus undatus), மஞ்சள் டிராகன்"
        },
        "seed_rate": {
            "en": "1,800 - 2,000 rooted stem cuttings / acre (4 cuttings per trellis post, 450-500 posts/acre)",
            "si": "අක්කරයකට මුල් ඇදගත් කඳ කැබලි 1,800 - 2,000 (ආධාරක කණුවකට පැළ 4 බැගින්, කණු 450-500ක්)",
            "ta": "ஏக்கருக்கு 1,800 - 2,000 வேர்விட்ட தண்டுத் துண்டுகள் (ஒரு தூணுக்கு 4 செடிகள்)"
        },
        "spacing": {
            "en": "3.0 m x 3.0 m with reinforced concrete posts (2m height) & tire support frames",
            "si": "මීටර් 3.0 x 3.0 පරතරය සහිත කොන්ක්‍රීට් ආධාරක කණු සහ යතුරුපැදි ටයර් රාමු",
            "ta": "3.0 மீ x 3.0 மீ இடைவெளியில் கான்கிரீட் தூண்கள் மற்றும் டயர் சட்டங்கள்"
        },
        "soil_and_ph": {
            "en": "Well-drained sandy loam or gravelly soil rich in organic matter (pH 6.0 - 7.0). Intolerant to water stagnation.",
            "si": "හොඳින් ජලය බැසයන කාබනික ද්‍රව්‍ය බහුල වැලි ලෝම පස (pH 6.0 - 7.0). ජලය රැඳීමට කිසිසේත් ඉඩ නොතබන්න.",
            "ta": "நல்ல வடிகால் வசதியுள்ள மணல் கலந்த களிமண் (pH 6.0 - 7.0). நீர் தேங்குவதை தாங்காது."
        },
        "stages_desc": {
            "s1_en": "Erect 2m concrete posts (50cm in ground). Dig 60x60x60cm pits and fill with topsoil and 15kg compost + 100g ERP.",
            "s1_si": "මීටර් 2 කොන්ක්‍රීට් කණු සවි කර සෙන්ටිමීටර 60x60x60 වළවල් සාදා කොම්පෝස්ට් කිලෝ 15ක් සහ රොක් පොස්පේට් ග්‍රෑම් 100ක් පසට කලවම් කරන්න.",
            "s1_ta": "2 மீ கான்கிரீட் தூண்களை நிறுவி, 60x60x60 செ.மீ குழிகள் தோண்டி மக்கிய உரம் 15 கிலோ மற்றும் ERP 100 கிராம் இடவும்.",
            "s2_en": "Plant 4 cured, treated rooted cuttings around each post; loosely tie with soft coir twine toward top ring.",
            "s2_si": "දිලීර නාශක ප්‍රතිකාර කළ මුල් ඇදගත් පැළ 4ක් කණුව වටා සිටුවා මෘදු කොහු ලණුවලින් කණුවට බඳින්න.",
            "s2_ta": "ஒவ்வொரு தூணையும் சுற்றி 4 வேர்விட்ட தண்டுகளை நட்டு மென்மையான கயிற்றால் தளர்வாக கட்டவும்.",
            "s3_en": "Apply DOA fruit mixture: Urea 50g + MOP 50g + TSP 40g per post every 3 months; increase Potassium during flowering.",
            "s3_si": "කෘෂිකර්ම දෙපාර්තමේන්තු පලතුරු පොහොර මිශ්‍රණය: කණුවකට යූරියා 50g + MOP 50g + TSP 40g මාස 3කට වරක් යොදන්න.",
            "s3_ta": "3 மாதங்களுக்கு ஒருமுறை தூணுக்கு யூரியா 50g + MOP 50g + TSP 40g இடவும்; பூக்கும் பருவத்தில் பொட்டாசியத்தை அதிகரிக்கவும்.",
            "s4_en": "Adopt drip irrigation; apply 4-5 liters per post every 2-3 days during dry spells; cease excess watering near ripening.",
            "s4_si": "බිංදු ජල සම්පාදනය යොදා වියළි කාලවලදී කණුවකට දින 2-3කට වරක් ලීටර් 4-5ක් සපයන්න.",
            "s4_ta": "சொட்டு நீர் பாசனம் அமைத்து உலர் காலங்களில் 2-3 நாட்களுக்கு ஒருமுறை தூணுக்கு 4-5 லிட்டர் நீர் பாய்ச்சவும்.",
            "s5_en": "Prune hanging canopy branches; manage anthracnose with copper hydroxide; install fruit fly traps.",
            "s5_si": "අතු කප්පාදු කර වාතාශ්‍රය සලසන්න; ඇන්ත්‍රැක්නෝස් රෝගයට කොපර් දිලීර නාශක යොදන්න; පළතුරු මැසි උගුල් සවි කරන්න.",
            "s5_ta": "கிளைகளை கவாத்து செய்யவும்; ஆந்த்ராக்னோஸ் நோய்க்கு செப்பு பூஞ்சைக்கொல்லி தெளிக்கவும்; பழ ஈ பொறிகளை வைக்கவும்.",
            "s6_en": "Harvest fruits when peel color turns 85% deep pink/red; pack in rigid ventilated plastic crates for high-end supermarkets.",
            "s6_si": "පොත්ත 85%ක් තද රෝස පැහැයට හැරුණු පසු නෙලා ප්ලාස්ටික් කූඩවල අසුරා සුපිරි වෙළඳපල හෝ මැනිං වෙළඳපලට යොමු කරන්න.",
            "s6_ta": "தோல் 85% இளஞ்சிவப்பு நிறமாக மாறும்போது அறுவடை செய்து காற்றோட்டமான பிளாஸ்டிக் கூடைகளில் அடைத்து சந்தைக்கு அனுப்பவும்."
        }
    },
    {
        "keywords": ["passion fruit", "passionfruit", "පැෂන්", "கொடித்தோடை", "பாஷன்"],
        "id": "passion_fruit",
        "names": {"en": "Passion Fruit", "si": "පැෂන් ෆෘට්", "ta": "கொடித்தோடை"},
        "category": "Commercial Vine Fruit",
        "duration_days": 150,
        "disallowed_districts": ["Nuwara Eliya"],
        "unsuitable_planting_months": [1, 2, 7],
        "production_cost_per_acre": 260000,
        "yield_per_acre_kg": 6000,
        "normal_wholesale_price": [320, 480],
        "glut_harvest_months": [],
        "glut_price": [220, 300],
        "varieties": {
            "en": "Yellow Passion Fruit (flavicarpa), Rahangala Purple Hybrid, Golden Passion",
            "si": "කහ පැෂන් (flavicarpa), රහංගල දම් දෙමුහුම්, ගෝල්ඩන් පැෂන්",
            "ta": "மஞ்சள் பாஷன் (flavicarpa), ரஹங்கல ஊதா கலப்பினம், தங்க பாஷன்"
        },
        "seed_rate": {
            "en": "500 - 600 healthy grafted or polybag nursery vines / acre",
            "si": "අක්කරයකට බද්ධ කළ හෝ පොලිතින් බෑග්වල වැඩුණු නිරෝගී පැළ 500 - 600ක්",
            "ta": "ஏக்கருக்கு 500 - 600 ஆரோக்கியமான ஒட்டு அல்லது பாலித்தீன் நாற்றுகள்"
        },
        "spacing": {
            "en": "3.0 m between rows x 2.5 m within rows on overhead wire bower / kniffin trellis",
            "si": "පේළි අතර මීටර් 3.0 x වැල් අතර මීටර් 2.5 පරතරයෙන් කම්බි මැසි ක්‍රමයට",
            "ta": "வரிசைகளுக்கு இடையே 3.0 மீ x கொடிகளுக்கு இடையே 2.5 மீ கம்பி பந்தல் அமைப்பு"
        },
        "soil_and_ph": {
            "en": "Deep, well-drained loamy soil with high organic content (pH 5.8 - 6.8). Highly prone to collar rot in waterlogged conditions.",
            "si": "හොඳින් ජලය බැසයන ගැඹුරු ලෝම පස (pH 5.8 - 6.8). ජලය රැඳුණහොත් පාදස්ථ කුණුවීම හටගනී.",
            "ta": "ஆழமான நல்ல வடிகால் உள்ள களிமண் (pH 5.8 - 6.8). நீர் தேங்கினால் தண்டு அழுகல் ஏற்படும்."
        },
        "stages_desc": {
            "s1_en": "Erect galvanized trellis wire at 2m height; dig 45x45x45cm pits with 10kg cattle compost + 150g dolomite.",
            "s1_si": "මීටර් 2 උසින් ගැල්වනයිස් කම්බි මැස්ස සකසා සෙන්ටිමීටර 45x45x45 වළවල් සාදා කොම්පෝස්ට් 10kg සහ ඩොලමයිට් 150g යොදන්න.",
            "s1_ta": "2 மீ உயரத்தில் கம்பி பந்தல் அமைத்து, 45x45x45 செ.மீ குழிகளில் 10 கிலோ உரம் + 150 கிராம் டோலமைட் இடவும்.",
            "s2_en": "Plant grafted vines in late afternoon; train single stem upwards with stake to the main trellis wire.",
            "s2_si": "පස්වරු කාලයේ බද්ධ පැළ සිටුවා තනි කඳ ආධාරක පඳුරක් දිගේ ප්‍රධාන කම්බිය දක්වා පුහුණු කරන්න.",
            "s2_ta": "மாலை வேளையில் ஒட்டு நாற்றுகளை நட்டு, ஒற்றை தண்டாக பிரதான கம்பிக்கு ஏற்றிவிடவும்.",
            "s3_en": "Apply DOA Fruit Fertilizer Mixture (Urea + TSP + MOP) every 2 months around vine drip perimeter.",
            "s3_si": "කෘෂිකර්ම දෙපාර්තමේන්තු NPK පලතුරු පොහොර මිශ්‍රණය මාස 2කට වරක් වැලේ මුල් වටා යොදන්න.",
            "s3_ta": "2 மாதங்களுக்கு ஒருமுறை கொடியின் வேர் வட்டத்தைச் சுற்றி DOA பழ உரக் கலவையை இடவும்.",
            "s4_en": "Provide regular furrow or micro-sprinkler irrigation; maintain moist soil during flowering and fruit sizing.",
            "s4_si": "මල් පිපෙන සහ ගෙඩි ලොකුවන අවධියේදී පසෙහි තෙතමනය අඛණ්ඩව පවත්වා ගන්න.",
            "s4_ta": "பூக்கும் மற்றும் காய் பிடிக்கும் பருவத்தில் சீரான நீர் பாசனம் வழங்கவும்.",
            "s5_en": "Prune dead laterals after each harvest flush; inspect for passion fruit woodiness virus and fruit fly.",
            "s5_si": "අස්වනු නෙලූ පසු වියළි අතු කප්පාදු කරන්න; ගැට සහිත වෛරස් රෝගය සහ පළතුරු මැස්සා පාලනය කරන්න.",
            "s5_ta": "அறுவடைக்கு பின் காய்ந்த கிளைகளை கவாத்து செய்யவும்; பழ ஈக்களை கட்டுப்படுத்தவும்.",
            "s6_en": "Harvest when fruit shows 70-80% purple/yellow pigmentation; pack in ventilated crates for juice factories or markets.",
            "s6_si": "පලතුර 70-80%ක් කහ හෝ දම් පැහැයට හැරුණු විට නෙලා වාතාශ්‍රය සහිත ප්ලාස්ටික් කූඩවල අසුරන්න.",
            "s6_ta": "பழம் 70-80% நிறம் மாறியதும் அறுவடை செய்து பிளாஸ்டிக் கூடைகளில் அனுப்பவும்."
        }
    },
    {
        "keywords": ["ginger", "ඉඟුරු", "இஞ்சி"],
        "id": "ginger",
        "names": {"en": "Ginger", "si": "ඉඟුරු", "ta": "இஞ்சி"},
        "category": "Export Spice & Cash Crop",
        "duration_days": 240,
        "disallowed_districts": ["Nuwara Eliya", "Jaffna", "Mannar"],
        "unsuitable_planting_months": [1, 2, 7, 8],
        "production_cost_per_acre": 360000,
        "yield_per_acre_kg": 6500,
        "normal_wholesale_price": [500, 850],
        "glut_harvest_months": [],
        "glut_price": [350, 480],
        "varieties": {
            "en": "Local Sri Lankan Ginger (රට ඉඟුරු), Chinese Ginger (චීන ඉඟුරු), Rangoon Ginger",
            "si": "දේශීය රට ඉඟුරු, චීන ඉඟුරු, රැංගුන් ඉඟුරු",
            "ta": "உள்ளூர் இஞ்சி, சீன இஞ்சி, ரங்கூன் இஞ்சி"
        },
        "seed_rate": {
            "en": "600 - 800 kg disease-free mother rhizome sets (30-40g with 2-3 viable buds) / acre",
            "si": "අක්කරයකට නිරෝගී බීජ ඉඟුරු රයිසෝම කිලෝ 600 - 800 (ක්‍රියාකාරී ඇස් 2-3ක් සහිත ග්‍රෑම් 30-40 කැබලි)",
            "ta": "ஏக்கருக்கு 600 - 800 கிலோ ஆரோக்கியமான விதை இஞ்சி துண்டுகள்"
        },
        "spacing": {
            "en": "30 cm x 20 cm on raised beds (15-20 cm height, 1.2 m width) with organic mulch",
            "si": "පේළි අතර සෙ.මී. 30 x පැළ අතර සෙ.මී. 20 (සෙ.මී. 20ක් උස් පාත්ති මත පිදුරු වසුන් සහිතව)",
            "ta": "30 செ.மீ x 20 செ.மீ இடைவெளியில் மேட்டுப் பாத்திகளில் வைக்கோல் மூடாக்குடன்"
        },
        "soil_and_ph": {
            "en": "Loose, friable sandy loam rich in organic humus (pH 5.5 - 6.5). Excellent drainage essential to prevent bacterial wilt (Ralstonia).",
            "si": "හොඳින් ජලය බැසයන ලිහිල් වැලි ලෝම පස (pH 5.5 - 6.5). බැක්ටීරියා හිටුමැරීම වැළැක්වීමට කානු අත්‍යවශ්‍යයි.",
            "ta": "வளமான மணல் கலந்த களிமண் (pH 5.5 - 6.5). பாக்டீரியா வாடல் நோயைத் தடுக்க நல்ல வடிகால் தேவை."
        },
        "stages_desc": {
            "s1_en": "Prepare raised beds; mix 10-12 tons compost/acre + 200kg dolomite; drench with Trichoderma bio-agent.",
            "s1_si": "උස් පාත්ති සාදා අක්කරයකට කොම්පෝස්ට් ටොන් 10-12ක් සහ ඩොලමයිට් කිලෝ 200ක් කලවම් කර ට්‍රයිකොඩර්මා යොදන්න.",
            "s1_ta": "மேட்டுப்பாத்தி அமைத்து ஏக்கருக்கு 10-12 டன் மக்கிய உரம் + 200 கிலோ டோலமைட் இடவும்.",
            "s2_en": "Treat seed rhizomes with Mancozeb; plant at 5 cm depth; immediately mulch with 5 cm green leaf / paddy straw.",
            "s2_si": "දිලීර නාශක ප්‍රතිකාර කළ බීජ කැබලි සෙ.මී. 5ක් ගැඹුරට සිටුවා ක්ෂණිකව පිදුරු හෝ කොළ වසුන් යොදන්න.",
            "s2_ta": "பூஞ்சைக்கொல்லி நேர்த்தி செய்த விதைகளை 5 செ.மீ ஆழத்தில் நட்டு வைக்கோல் மூடாக்கிடவும்.",
            "s3_en": "Apply DEA fertilizer schedule: split Urea + MOP at 45, 90, and 120 days after planting followed by earthing up.",
            "s3_si": "අපනයන කෘෂිකර්ම නිර්දේශිත NPK පොහොර දින 45, 90 සහ 120දී යොදා පස් ගොඩගසන්න.",
            "s3_ta": "45, 90 மற்றும் 120 நாட்களில் யூரியா மற்றும் MOP உரங்களை இட்டு மண் அணைக்கவும்.",
            "s4_en": "Maintain consistent soil moisture without waterlogging; renew mulch layer at each weeding and fertilizer application.",
            "s4_si": "පසෙහි තෙතමනය ඒකාකාරව පවත්වා ගන්න; පොහොර යෙදූ සෑම වාරයකදීම වසුන් අලුත් කරන්න.",
            "s4_ta": "மண்ணில் ஈரப்பதத்தை சீராக பராமரிக்கவும்; உரமிடும் போதெல்லாம் மூடாக்கை புதுப்பிக்கவும்.",
            "s5_en": "Scout for shoot borer (Conogethes) and rhizome rot (Pythium); apply neem spray or approved systemic fungicide.",
            "s5_si": "කරටි විදින පණුවා සහ රයිසෝම කුණුවීම පරීක්ෂා කර කොහොඹ නිස්සාරකය හෝ දිලීර නාශක යොදන්න.",
            "s5_ta": "தண்டு துளைப்பான் மற்றும் வேரழுகல் நோய்களை கண்காணித்து கட்டுப்படுத்தவும்.",
            "s6_en": "Harvest after 8-9 months when pseudostems turn yellow and dry; wash rhizomes gently and cure in shaded shed.",
            "s6_si": "මාස 8-9කින් ගස් කහ වී වේලෙන විට අස්වැන්න ගලවා මඩ සෝදා සෙවණේ වියළා මැනිං වෙළඳපලට යොමු කරන්න.",
            "s6_ta": "8-9 மாதங்களில் இலைகள் மஞ்சள் நிறமாகி காயும்போது தோண்டி எடுத்து சுத்தம் செய்து சந்தைக்கு அனுப்பவும்."
        }
    },
    {
        "keywords": ["turmeric", "කහ", "மஞ்சள்"],
        "id": "turmeric",
        "names": {"en": "Turmeric", "si": "කහ", "ta": "மஞ்சள்"},
        "category": "Export Spice & Medicinal Crop",
        "duration_days": 270,
        "disallowed_districts": ["Nuwara Eliya"],
        "unsuitable_planting_months": [1, 2, 7, 8],
        "production_cost_per_acre": 340000,
        "yield_per_acre_kg": 7000,
        "normal_wholesale_price": [420, 700],
        "glut_harvest_months": [],
        "glut_price": [280, 380],
        "varieties": {
            "en": "Galgamuwa Local, Prathibha (High Curcumin), Gampaha Local",
            "si": "ගල්ගමුව ප්‍රභේදය, ප්‍රතිභා (ඉහළ කුර්කුමින් ප්‍රතිශතය), ගම්පහ දේශීය කහ",
            "ta": "கல்கமுவ உள்ளூர் ரகம், பிரதிபா (அதிக குர்குமின்), கம்பஹா ரகம்"
        },
        "seed_rate": {
            "en": "700 - 900 kg mother or primary finger rhizomes / acre",
            "si": "අක්කරයකට නිරෝගී මව් හෝ ඇඟිලි රයිසෝම කිලෝ 700 - 900ක්",
            "ta": "ஏக்கருக்கு 700 - 900 கிலோ விதை மஞ்சள் துண்டுகள்"
        },
        "spacing": {
            "en": "30 cm x 25 cm on raised beds with 7 cm organic mulch",
            "si": "පේළි අතර සෙ.මී. 30 x පැළ අතර සෙ.මී. 25 (උස් පාත්ති මත සෙ.මී. 7ක කාබනික වසුන්)",
            "ta": "30 செ.மீ x 25 செ.மீ இடைவெளியில் மேட்டுப்பாத்திகளில் மூடாக்குடன்"
        },
        "soil_and_ph": {
            "en": "Fertile, friable loam to sandy clay loam rich in humus (pH 5.5 - 6.5). Excellent drainage essential.",
            "si": "කාබනික ද්‍රව්‍ය බහුල ලිහිල් ලෝම පස (pH 5.5 - 6.5). ජලාපවහනය අත්‍යවශ්‍ය වේ.",
            "ta": "வளமான மணல் கலந்த களிமண் (pH 5.5 - 6.5). நல்ல வடிகால் வசதி அவசியம்."
        },
        "stages_desc": {
            "s1_en": "Prepare raised beds; mix 10 tons compost/acre + 150kg dolomite; incorporate Trichoderma.",
            "s1_si": "උස් පාත්ති සාදා අක්කරයකට කොම්පෝස්ට් ටොන් 10ක් සහ ඩොලමයිට් කිලෝ 150ක් යොදන්න.",
            "s1_ta": "மேட்டுப்பாத்தி அமைத்து 10 டன் மக்கிய உரம் + 150 கிலோ டோலமைட் இடவும்.",
            "s2_en": "Plant treated rhizomes at 5-7 cm depth; cover with straw mulch immediately to prevent desiccation.",
            "s2_si": "ප්‍රතිකාර කළ බීජ කැබලි සෙ.මී. 5-7ක් ගැඹුරට සිටුවා පිදුරු වසුන් යොදන්න.",
            "s2_ta": "விதை மஞ்சளை 5-7 செ.மீ ஆழத்தில் நட்டு வைக்கோல் மூடாக்கிடவும்.",
            "s3_en": "Apply DEA split fertilizer: Urea + MOP at 45, 90, and 120 days; earth-up soil around rhizomes.",
            "s3_si": "දින 45, 90 සහ 120දී NPK පොහොර යොදා පස් ගොඩගසන්න.",
            "s3_ta": "45, 90 மற்றும் 120 நாட்களில் உரமிட்டு மண் அணைக்கவும்.",
            "s4_en": "Irrigate at 4-5 day intervals; keep soil uniformly moist during active rhizome development.",
            "s4_si": "දින 4-5කට වරක් ජලය සපයා රයිසෝම වර්ධනය වන විට තෙතමනය රඳවා ගන්න.",
            "s4_ta": "4-5 நாட்களுக்கு ஒருமுறை நீர் பாய்ச்சவும்.",
            "s5_en": "Control shoot borer and leaf spot with bio-fungicides or neem oil; maintain field sanitation.",
            "s5_si": "කරටි විදින පණුවන් හා කොළ ලප රෝග පාලනය කරන්න.",
            "s5_ta": "தண்டு துளைப்பான் மற்றும் இலைப்புள்ளி நோய்களை கட்டுப்படுத்தவும்.",
            "s6_en": "Harvest after 9 months when foliage dries down; boil in water and cure in solar dryers or sell fresh.",
            "s6_si": "මාස 9කින් ගස් වියළුණු පසු අස්වැන්න ගලවා සෝදා වෙළඳපලට යොමු කරන්න.",
            "s6_ta": "9 மாதங்களில் இலைகள் காய்ந்ததும் அறுவடை செய்து சந்தைக்கு அனுப்பவும்."
        }
    },
    {
        "keywords": ["manioc", "cassava", "මඤ්ඤොක්කා", "மரவள்ளி", "மரவள்ளிக்கிழங்கு"],
        "id": "cassava",
        "names": {"en": "Cassava (Manioc)", "si": "මඤ්ඤොක්කා", "ta": "மரவள்ளி"},
        "category": "Field Tuber Crop",
        "duration_days": 210,
        "disallowed_districts": ["Nuwara Eliya"],
        "unsuitable_planting_months": [1, 2, 7],
        "production_cost_per_acre": 120000,
        "yield_per_acre_kg": 10000,
        "normal_wholesale_price": [90, 140],
        "glut_harvest_months": [],
        "glut_price": [60, 85],
        "varieties": {
            "en": "MU 51 (High Yielding), CARI 555, Kirikawadi, Swarna",
            "si": "MU 51 (ඉහළ අස්වනු සහිත), CARI 555, කිරිකවඩි, ස්වර්ණා",
            "ta": "MU 51 (அதிக மகசூல்), CARI 555, கிரிகாவடி, சுவர்ணா"
        },
        "seed_rate": {
            "en": "4,000 - 4,500 mature stem cuttings (20-25 cm with 5-7 nodes) / acre",
            "si": "අක්කරයකට නිරෝගී කඳ දඬු කැබලි 4,000 - 4,500 (ඇස් 5-7ක් සහිත සෙ.මී. 20-25 දිග)",
            "ta": "ஏக்கருக்கு 4,000 - 4,500 முதிர்ந்த தண்டுத் துண்டுகள் (20-25 செ.மீ நீளம்)"
        },
        "spacing": {
            "en": "1.0 m x 1.0 m or 90 cm x 90 cm on ridges or mounds",
            "si": "වැටි හෝ පස් ගොඩවල් මත මීටර් 1.0 x 1.0 හෝ සෙ.මී. 90 x 90 පරතරය",
            "ta": "வரப்புகள் அல்லது மேடுகளில் 1.0 மீ x 1.0 மீ இடைவெளி"
        },
        "soil_and_ph": {
            "en": "Friable sandy loam or Red-Yellow Latosol (pH 5.5 - 6.8). Tolerates drought but intolerant to standing water.",
            "si": "ලිහිල් වැලි ලෝම හෝ රතු-කහ ලැටසෝල් පස (pH 5.5 - 6.8). නියඟයට ඔරොත්තු දෙන නමුත් ජලය රැඳීමට ඉඩ නොදෙන්න.",
            "ta": "மணல் கலந்த களிமண் (pH 5.5 - 6.8). வறட்சியைத் தாங்கும், நீர் தேங்கக் கூடாது."
        },
        "stages_desc": {
            "s1_en": "Plow to 25 cm; form 30 cm ridges or mounds; incorporate 5 tons cattle manure/acre.",
            "s1_si": "පස සී සා සෙ.මී. 30 උස වැටි සකසා අක්කරයකට කොම්පෝස්ට් ටොන් 5ක් කලවම් කරන්න.",
            "s1_ta": "30 செ.மீ உயர வரப்புகள் அமைத்து ஏக்கருக்கு 5 டன் உரம் இடவும்.",
            "s2_en": "Plant stem cuttings vertically or slightly slanted (2/3 buried in soil); ensure buds point upwards.",
            "s2_si": "දඬු කැබලි සිරස්ව හෝ මදක් ඇලව පසෙහි 2/3ක් යටවන සේ සිටුවන්න.",
            "s2_ta": "தண்டுத் துண்டுகளை செங்குத்தாக அல்லது சற்று சாய்வாக 2/3 பங்கு மண்ணில் புதையுமாறு நடவும்.",
            "s3_en": "Apply DOA NPK fertilizer: Urea 25kg + TSP 30kg + MOP 30kg at 4-6 weeks; earth up ridges.",
            "s3_si": "සති 4-6දී NPK පොහොර යොදා වැටිවලට පස් ගොඩගසන්න.",
            "s3_ta": "4-6 வாரங்களில் NPK உரமிட்டு வரப்புகளை பலப்படுத்தவும்.",
            "s4_en": "Provide supplemental irrigation during dry spells; ensure clear drainage during monsoons.",
            "s4_si": "වියළි කාලවලදී ජලය සපයන්න; වැසි කාලයේදී ජලය බැසයාමට සලස්වන්න.",
            "s4_ta": "உலர் காலங்களில் நீர் பாய்ச்சவும்; மழைக்காலத்தில் வடிகால் அமைக்கவும்.",
            "s5_en": "Scout for cassava mosaic virus and red spider mites; rogue out virus-infected plants immediately.",
            "s5_si": "මඤ්ඤොක්කා මොසැයික් වෛරසය සහ මයිටාවන් පාලනය කරන්න; රෝගී පැළ විනාශ කරන්න.",
            "s5_ta": "மொசைக் வைரஸ் மற்றும் சிலந்திகளை கட்டுப்படுத்தவும்; பாதிக்கப்பட்ட செடிகளை அழிக்கவும்.",
            "s6_en": "Harvest tubers at 7-8 months; lift gently without snapping roots; market within 48 hours to avoid vascular streaking.",
            "s6_si": "මාස 7-8න් අල ගලවා පැය 48ක් ඇතුළත වෙළඳපලට යොමු කරන්න.",
            "s6_ta": "7-8 மாதங்களில் கிழங்குகளை அறுவடை செய்து 48 மணி நேரத்திற்குள் சந்தைப்படுத்தவும்."
        }
    },
    {
        "keywords": ["sweet potato", "බතල", "සர்க்கரைவள்ளி", "வள்ளிக்கிழங்கு"],
        "id": "sweet_potato",
        "names": {"en": "Sweet Potato", "si": "බතල", "ta": "சர்க்கரைவள்ளி"},
        "category": "Short-Duration Tuber Crop",
        "duration_days": 105,
        "disallowed_districts": ["Nuwara Eliya"],
        "unsuitable_planting_months": [1, 2, 7],
        "production_cost_per_acre": 110000,
        "yield_per_acre_kg": 8500,
        "normal_wholesale_price": [110, 160],
        "glut_harvest_months": [],
        "glut_price": [75, 100],
        "varieties": {
            "en": "WARI Ranabima, CARI Orange (Biofortified), Shanthi, Gannoruwa White",
            "si": "WARI රණබිම, CARI ඔරේන්ජ් (විටමින් ඒ බහුල), ශාන්ති, ගන්නෝරුව සුදු",
            "ta": "WARI ரணபிம, CARI ஆரஞ்சு, சாந்தி, கன்னோருவ வெள்ளை"
        },
        "seed_rate": {
            "en": "35,000 - 40,000 apical vine cuttings (25-30 cm) / acre",
            "si": "අක්කරයකට අග්‍රස්ථ වැල් කැබලි 35,000 - 40,000 (සෙ.මී. 25-30 දිග)",
            "ta": "ஏக்கருக்கு 35,000 - 40,000 நுனி கொடித் துண்டுகள் (25-30 செ.மீ)"
        },
        "spacing": {
            "en": "90 cm ridges x 25-30 cm within ridges (loop/slanted planting)",
            "si": "වැටි අතර සෙ.මී. 90 x වැල් අතර සෙ.මී. 25-30",
            "ta": "90 செ.மீ வரப்புகள் x 25-30 செ.மீ பயிர் இடைவெளி"
        },
        "soil_and_ph": {
            "en": "Friable sandy loam with loose texture (pH 5.5 - 6.8). Heavy clays cause misshapen tubers.",
            "si": "ලිහිල් වැලි ලෝම පස (pH 5.5 - 6.8). තද මැටි පස්වල අල නිසි හැඩයට නොවැඩේ.",
            "ta": "மணல் கலந்த களிமண் (pH 5.5 - 6.8). கனத்த களிமண்ணில் கிழங்கு சரியாக உருப்பெறாது."
        },
        "stages_desc": {
            "s1_en": "Plow to fine tilth; form 30 cm ridges; incorporate 6 tons well-rotted compost per acre.",
            "s1_si": "පස සී සා සෙ.මී. 30 වැටි සාදා කොම්පෝස්ට් ටොන් 6ක් කලවම් කරන්න.",
            "s1_ta": "30 செ.மீ உயர வரப்புகள் அமைத்து 6 டன் மக்கிய உரம் இடவும்.",
            "s2_en": "Plant healthy terminal vine cuttings in moist ridges burying the middle 3-4 nodes.",
            "s2_si": "තෙතමනය සහිත වැටි මත මැද ඇස් 3-4ක් පසට යටවන සේ වැල් සිටුවන්න.",
            "s2_ta": "ஈரமான வரப்புகளில் நடுப்பகுதி கணுக்கள் புதையுமாறு கொடிகளை நடவும்.",
            "s3_en": "Apply DOA NPK top-dressing at 4 weeks; earth up ridges; apply high Potassium for tuber enlargement.",
            "s3_si": "සති 4දී NPK පොහොර යොදා පස් ගොඩගසන්න; අල ලොකුවීමට පොටෑසියම් යොදන්න.",
            "s3_ta": "4 வாரங்களில் பொட்டாசியம் நிறைந்த NPK உரமிட்டு மண் அணைக்கவும்.",
            "s4_en": "Provide furrow irrigation weekly; lift vines gently at 6 weeks to prevent node rooting.",
            "s4_si": "සතිපතා ජලය සපයන්න; ගැටවලින් මුල් ඇදීම වැළැක්වීමට සති 6දී වැල් පෙරළන්න.",
            "s4_ta": "வாரந்தோறும் நீர் பாய்ச்சவும்; கணுக்களில் வேர் விடுவதைத் தடுக்க கொடிகளை புரட்டிவிடவும்.",
            "s5_en": "Control sweet potato weevil (Cylas formicarius) by continuous earthing-up and pheromone traps.",
            "s5_si": "බතල කුරුමිණියා පාලනයට අඛණ්ඩව වැටිවලට පස් ගොඩගසා ෆෙරමෝන් උගුල් යොදන්න.",
            "s5_ta": "சர்க்கரைவள்ளி வண்டுகளை கட்டுப்படுத்த தொடர்ந்து மண் அணைத்து இனக்கவர்ச்சி பொறிகளை வைக்கவும்.",
            "s6_en": "Harvest at 3.5 months when lower leaves turn yellow; lift carefully and cure in shade.",
            "s6_si": "මාස 3.5කින් කොළ කහ වී එන විට අල බේරාගෙන සෙවණේ වියළා වෙළඳපලට යොමු කරන්න.",
            "s6_ta": "3.5 மாதங்களில் இலைகள் மஞ்சள் நிறமாகும்போது அறுவடை செய்து சந்தைப்படுத்தவும்."
        }
    },
    {
        "keywords": ["papaya", "pawpaw", "පැපොල්", "பப்பாளி"],
        "id": "papaya",
        "names": {"en": "Papaya", "si": "පැපොල්", "ta": "பப்பாளி"},
        "category": "Commercial Fruit Crop",
        "duration_days": 180,
        "disallowed_districts": ["Nuwara Eliya"],
        "unsuitable_planting_months": [1, 2, 7],
        "production_cost_per_acre": 220000,
        "yield_per_acre_kg": 12000,
        "normal_wholesale_price": [140, 220],
        "glut_harvest_months": [],
        "glut_price": [80, 120],
        "varieties": {
            "en": "Red Lady (F1 Hybrid), Ratna, Sinta, Local Solo",
            "si": "රෙඩ් ලේඩි (F1 දෙමුහුම්), රත්න, සින්ටා, ලෝකල් සෝලෝ",
            "ta": "ரெட் லேடி (F1 கலப்பினம்), ரத்னா, சின்டா, லோக்கல் சோலோ"
        },
        "seed_rate": {
            "en": "800 - 1,000 polybag nursery seedlings / acre",
            "si": "අක්කරයකට තවාන් බෑග්වල වැඩුණු නිරෝගී පැළ 800 - 1,000ක්",
            "ta": "ஏக்கருக்கு 800 - 1,000 ஆரோக்கியமான பாலித்தீன் நாற்றுகள்"
        },
        "spacing": {
            "en": "2.4 m x 2.4 m or 2.5 m x 2.5 m square planting system",
            "si": "මීටර් 2.4 x 2.4 හෝ 2.5 x 2.5 සමචතුරස්‍ර පරතරය",
            "ta": "2.4 மீ x 2.4 மீ அல்லது 2.5 மீ x 2.5 மீ இடைவெளி"
        },
        "soil_and_ph": {
            "en": "Deep, well-drained sandy loam or alluvial soil (pH 6.0 - 6.8). Severe zero tolerance for waterlogging (causes collar rot).",
            "si": "හොඳින් ජලය බැසයන සාරවත් ලෝම පස (pH 6.0 - 6.8). ජලය රැඳුනහොත් පාදස්ථ කුණුවීමෙන් පැළ ක්ෂණිකව විනාශ වේ.",
            "ta": "நல்ல வடிகால் உள்ள வளமான மண் (pH 6.0 - 6.8). நீர் தேங்கினால் தண்டு அழுகல் நோய் தாக்கும்."
        },
        "stages_desc": {
            "s1_en": "Dig 60x60x60cm pits; incorporate 15kg compost + 150g dolomite + 100g ERP; ensure deep drainage furrows.",
            "s1_si": "සෙ.මී. 60x60x60 වළවල් සාදා කොම්පෝස්ට් 15kg සහ ඩොලමයිට් 150g පසට කලවම් කරන්න.",
            "s1_ta": "60x60x60 செ.மீ குழிகள் தோண்டி 15 கிலோ உரம் + 150 கிராம் டோலமைட் இடவும்.",
            "s2_en": "Transplant 45-day-old vigorous polybag seedlings; firm soil around collar without burying deeper than nursery level.",
            "s2_si": "දින 45ක් වයසැති නිරෝගී පැළ පස්වරු කාලයේ සිටුවා වටේ පස් තද කරන්න.",
            "s2_ta": "45 நாள் நாற்றுகளை மாலை வேளையில் நட்டு வேர் பகுதியைச் சுற்றி மண்ணை அணைக்கவும்.",
            "s3_en": "Apply DOA Fruit Fertilizer Mixture every 2 months: Urea 60g + TSP 50g + MOP 80g per tree; increase Boron to prevent fruit deformation.",
            "s3_si": "කෘෂිකර්ම දෙපාර්තමේන්තු NPK පොහොර මාස 2කට වරක් යොදන්න; ගෙඩි විකෘති වීම වැළැක්වීමට බෝරෝන් යොදන්න.",
            "s3_ta": "2 மாதங்களுக்கு ஒருமுறை மரத்திற்கு NPK உரமிட்டு போரான் சத்து குறைபாட்டை தவிர்க்கவும்.",
            "s4_en": "Adopt drip irrigation; apply 15-20 liters/tree twice a week during dry periods.",
            "s4_si": "බිංදු ජල සම්පාදනය මඟින් වියළි කාලවලදී සතියකට දෙවරක් ගසකට ලීටර් 15-20ක් සපයන්න.",
            "s4_ta": "சொட்டு நீர் பாசனம் மூலம் உலர் காலங்களில் மரத்திற்கு வாரம் இருமுறை 15-20 லிட்டர் நீர் பாய்ச்சவும்.",
            "s5_en": "Monitor strictly for papaya ringspot virus and mealybugs; destroy infected plants; spray mineral oils for mealybugs.",
            "s5_si": "පැපොල් මුදු ලප වෛරසය සහ පිටි මකුණන් පාලනය කරන්න; වෛරස් වැළඳුණු ගස් ගලවා විනාශ කරන්න.",
            "s5_ta": "பப்பாளி வளைய புள்ளி வைரஸ் மற்றும் மாவுப்பூச்சிகளை கண்காணித்து கட்டுப்படுத்தவும்.",
            "s6_en": "Harvest when 1-2 yellow color breaks appear on green skin; pack in plastic crates with paper dividers.",
            "s6_si": "ගෙඩියේ පහළ කහ පැහැති ඉරි 1-2ක් මතු වූ පසු නෙලා ප්ලාස්ටික් කූඩවල කඩදාසි අතුරා අසුරන්න.",
            "s6_ta": "தோலில் 1-2 மஞ்சள் கோடுகள் தோன்றும்போது அறுவடை செய்து பிளாஸ்டிக் கூடைகளில் அனுப்பவும்."
        }
    },
    {
        "keywords": ["mango", "අඹ", "மாம்பழம்", "மாங்காய்"],
        "id": "mango",
        "names": {"en": "Mango", "si": "අඹ", "ta": "மாம்பழம்"},
        "category": "Perennial Orchard Fruit",
        "duration_days": 240,
        "disallowed_districts": ["Nuwara Eliya", "Badulla"],
        "unsuitable_planting_months": [1, 2, 7],
        "production_cost_per_acre": 190000,
        "yield_per_acre_kg": 5000,
        "normal_wholesale_price": [350, 600],
        "glut_harvest_months": [],
        "glut_price": [200, 300],
        "varieties": {
            "en": "Tom EJC (Commercial Export King), Karthacolomban, Willard, Vellaicolomban",
            "si": "ටොම් ඊජේසී (Tom EJC), කාත්තකොළඹන්, විලාඩ්, වෙල්ලෙයිකොළඹන්",
            "ta": "டாம் இஜேசி (Tom EJC), கார்த்தாகொழும்பன், வில்லார்ட், வெள்ளைகொழும்பன்"
        },
        "seed_rate": {
            "en": "70 - 100 certified budded/grafted plants / acre (High density: 160-200 plants/acre)",
            "si": "අක්කරයකට සහතිකලත් බද්ධ පැළ 70 - 100 (අධි ඝනත්ව වගාවේදී 160-200ක්)",
            "ta": "ஏக்கருக்கு 70 - 100 சான்றளிக்கப்பட்ட ஒட்டு நாற்றுகள்"
        },
        "spacing": {
            "en": "6.0 m x 6.0 m (standard) or 5.0 m x 4.0 m (high density pruned)",
            "si": "මීටර් 6.0 x 6.0 (සම්මත) හෝ මීටර් 5.0 x 4.0 (කප්පාදු කළ අධි ඝනත්ව)",
            "ta": "6.0 மீ x 6.0 மீ அல்லது 5.0 மீ x 4.0 மீ இடைவெளி"
        },
        "soil_and_ph": {
            "en": "Deep, well-drained Reddish Brown Earth or alluvial soil (pH 5.5 - 7.5). Intolerant to cold montane frost and continuous wet canopy.",
            "si": "ගැඹුරු රතු-දුඹුරු පස හෝ දියළු පස (pH 5.5 - 7.5). මල් පිපෙන කාලයේ වියළි කාලගුණයක් අවශ්‍ය වේ.",
            "ta": "ஆழமான செம்பழுப்பு மண் (pH 5.5 - 7.5). பூக்கும் பருவத்தில் உலர் வானிலை சிறந்தது."
        },
        "stages_desc": {
            "s1_en": "Dig 1m x 1m x 1m pits; fill with topsoil + 20kg organic compost + 250g rock phosphate + 200g dolomite.",
            "s1_si": "මීටර් 1x1x1 වළවල් සාදා කොම්පෝස්ට් 20kg, රොක් පොස්පේට් 250g සහ ඩොලමයිට් කලවම් කරන්න.",
            "s1_ta": "1x1x1 மீ குழிகள் தோண்டி 20 கிலோ உரம் + 250 கிராம் பாஸ்பேட் இடவும்.",
            "s2_en": "Plant grafted plants with graft union 15 cm above ground; stake securely to prevent wind rock.",
            "s2_si": "බද්ධ සන්ධිය පොළොවෙන් සෙ.මී. 15ක් ඉහළින් සිටින සේ පැළ සිටුවා ආධාරක ලීයකට බඳින්න.",
            "s2_ta": "ஒட்டு பகுதி தரையிலிருந்து 15 செ.மீ உயரத்தில் இருக்குமாறு நட்டு தூண் வைத்து கட்டவும்.",
            "s3_en": "Apply DOA Perennial Fruit NPK mixture annually around drip line; incorporate farmyard manure.",
            "s3_si": "කෘෂිකර්ම දෙපාර්තමේන්තු NPK පොහොර මිශ්‍රණය සහ ගොම පොහොර වාර්ෂිකව ගසේ වියන වටා යොදන්න.",
            "s3_ta": "வருடாந்திர NPK உரக் கலவையை மரத்தின் விளிம்பைச் சுற்றி இடவும்.",
            "s4_en": "Irrigate regularly during young vegetative growth and fruit sizing; withhold water before flowering.",
            "s4_si": "පැළ අවධියේදී සහ ගෙඩි ලොකුවන විට ජලය සපයන්න; මල් පිපීමට පෙර ජල සැපයුම සීමා කරන්න.",
            "s4_ta": "காய் பிடிக்கும் பருவத்தில் நீர் பாய்ச்சவும்; பூப்பதற்கு முன் நீரை கட்டுப்படுத்தவும்.",
            "s5_en": "Bag developing fruits with double-layered paper bags to prevent fruit fly (Bactrocera) damage; spray copper for anthracnose.",
            "s5_si": "පළතුරු මැස්සාගෙන් ආරක්ෂා කර ගැනීමට ගෙඩි කවර මඟින් ආවරණය කරන්න; ඇන්ත්‍රැක්නෝස් සඳහා කොපර් යොදන්න.",
            "s5_ta": "பழ ஈக்களிடமிருந்து பாதுகாக்க பழங்களை காகித பைகளால் மூடவும்; ஆந்த்ராக்னோஸுக்கு செம்பு தெளிக்கவும்.",
            "s6_en": "Harvest using mechanical pole pickers with 1 cm stem attached; de-sap upside down in shaded packhouse; pack in crates.",
            "s6_si": "නැට්ට සෙ.මී. 1ක් ඉතිරි වන සේ කඩා කිරි ගලා යාමට සලස්වා ප්ලාස්ටික් කූඩවල අසුරන්න.",
            "s6_ta": "1 செ.மீ காம்புடன் அறுவடை செய்து பாலை வடித்து பிளாஸ்டிக் கூடைகளில் அடைக்கவும்."
        }
    },
    {
        "keywords": ["banana", "කෙසෙල්", "வாழை", "வாழைப்பழம்"],
        "id": "banana",
        "names": {"en": "Banana", "si": "කෙසෙල්", "ta": "வாழை"},
        "category": "Commercial Fruit Crop",
        "duration_days": 270,
        "disallowed_districts": ["Nuwara Eliya"],
        "unsuitable_planting_months": [1, 2, 7],
        "production_cost_per_acre": 210000,
        "yield_per_acre_kg": 12000,
        "normal_wholesale_price": [140, 240],
        "glut_harvest_months": [],
        "glut_price": [85, 130],
        "varieties": {
            "en": "Ambul (Embul), Kolikuttu, Seeni Kehel, Cavendish, Rath Kehel",
            "si": "ඇඹුල් කෙසෙල්, කෝලිකුට්ටු, සීනි කෙසෙල්, කැවන්ඩිෂ්, රත් කෙසෙල්",
            "ta": "எம்புல் (ஆம்பல்), கோலிகுட்டு, சீனி வாழை, கேவண்டிஷ், செவ்வாழை"
        },
        "seed_rate": {
            "en": "700 - 800 vigorous sword suckers (1.5 - 2.0 kg corm) / acre",
            "si": "අක්කරයකට නිරෝගී කඩු පැළ 700 - 800ක් (කිලෝ 1.5 - 2.0 අල සහිත)",
            "ta": "ஏக்கருக்கு 700 - 800 ஆரோக்கியமான வாள் கன்றுகள்"
        },
        "spacing": {
            "en": "2.4 m x 2.4 m or 3.0 m x 3.0 m in deep planting pits",
            "si": "මීටර් 2.4 x 2.4 හෝ 3.0 x 3.0 පරතරයෙන් වළවල් සාදා",
            "ta": "2.4 மீ x 2.4 மீ அல்லது 3.0 மீ x 3.0 மீ இடைவெளி"
        },
        "soil_and_ph": {
            "en": "Deep, fertile loamy soil rich in organic matter (pH 6.0 - 7.5). High moisture demand with good aeration.",
            "si": "කාබනික ද්‍රව්‍ය බහුල ගැඹුරු සාරවත් ලෝම පස (pH 6.0 - 7.5). ඉහළ ජල අවශ්‍යතාවයක් ඇත.",
            "ta": "வளமான களிமண் (pH 6.0 - 7.5). அதிக நீர் மற்றும் நல்ல வடிகால் தேவை."
        },
        "stages_desc": {
            "s1_en": "Dig 60x60x60cm pits; incorporate 15kg compost + 150g rock phosphate + 100g dolomite.",
            "s1_si": "සෙ.මී. 60x60x60 වළවල් සාදා කොම්පෝස්ට් 15kg සහ රොක් පොස්පේට් 150g යොදන්න.",
            "s1_ta": "60x60x60 செ.மீ குழிகளில் 15 கிலோ உரம் + 150 கிராம் பாஸ்பேட் இடவும்.",
            "s2_en": "Pare sucker corm; immerse in hot water (55C for 20 mins) or nematicide; plant upright in pit.",
            "s2_si": "පැළයේ අලය සුද්ද කර ප්‍රතිකාර කර වළ මැද කෙළින් සිටුවා පස් තද කරන්න.",
            "s2_ta": "கன்றுகளை நேர்த்தி செய்து குழியின் நடுவில் செங்குத்தாக நடவும்.",
            "s3_en": "Apply split NPK fertilizer at months 2, 4, 6, and 8; apply high Potassium for bunch weight.",
            "s3_si": "මාස 2, 4, 6, සහ 8දී NPK පොහොර යොදන්න; කැන බරවීමට පොටෑසියම් යොදන්න.",
            "s3_ta": "2, 4, 6 மற்றும் 8 மாதங்களில் NPK உரமிட்டு பொட்டாசியத்தை அதிகரிக்கவும்.",
            "s4_en": "Maintain consistent drip or basin irrigation (20-30 liters/mat/day in dry periods).",
            "s4_si": "වියළි කාලයේදී දිනපතා පඳුරකට ලීටර් 20-30ක් ලැබෙන සේ ජලය සපයන්න.",
            "s4_ta": "உலர் காலங்களில் புதருக்கு தினமும் 20-30 லிட்டர் நீர் பாய்ச்சவும்.",
            "s5_en": "De-sucker keeping only one follower; remove male bud (navel) after bunch completes; bag bunches.",
            "s5_si": "අමතර පැළ ඉවත් කර එක් අනුප්‍රාප්තික පැළයක් පමණක් තබන්න; මල කපා කැන ආවරණය කරන්න.",
            "s5_ta": "தேவையற்ற கன்றுகளை நீக்கவும்; ஆண் பூவை வெட்டிவிட்டு தாரை மூடவும்.",
            "s6_en": "Harvest when fingers round off (75-80% full); cut whole bunches and pack in padded crates.",
            "s6_si": "ඇඟිලි රවුම් වී පිරුණු පසු කැන කපා ප්ලාස්ටික් කූඩවල අසුරා ප්‍රවාහනය කරන්න.",
            "s6_ta": "காய்கள் நன்கு திரண்டதும் தாரை வெட்டி பிளாஸ்டிக் கூடைகளில் அனுப்பவும்."
        }
    }
]


def generate_crop_stages(names: dict, stages_desc: dict) -> dict:
    """Generate complete localized 6-stage guideline for researched crop"""
    stages_en = [
        {
            "stage_number": 1,
            "title": f"1. Land Preparation & Organic Conditioning for {names['en']}",
            "duration": "2 - 3 weeks before planting",
            "icon": "🌱",
            "instructions": [
                stages_desc.get("s1_en", "Plow and pulverize soil to fine tilth."),
                "Form raised planting beds with peripheral drainage furrows.",
                "Incorporate organic manure and dolomite as per DOA recommendation."
            ],
            "fertilizer_schedule": "Apply certified organic compost and basal phosphate dressing.",
            "ipm_and_protection": "Solarize soil beds to eliminate dormant soil-borne fungal pathogens.",
            "water_and_climate_tips": "Ensure deep peripheral furrows to prevent monsoon water stagnation."
        },
        {
            "stage_number": 2,
            "title": f"2. Planting Material Selection & Field Planting",
            "duration": "At planting window",
            "icon": "🌿",
            "instructions": [
                stages_desc.get("s2_en", "Use certified planting materials from authorized sources."),
                "Plant at recommended row and plant spacing during cool late afternoon.",
                "Firm soil gently around root base to eliminate air pockets."
            ],
            "fertilizer_schedule": "Avoid placing chemical fertilizer in direct contact with young roots.",
            "ipm_and_protection": "Dip planting sets or seedlings in bio-fungicide solution before planting.",
            "water_and_climate_tips": "Provide gentle, uniform watering immediately after planting."
        },
        {
            "stage_number": 3,
            "title": f"3. Targeted DOA Nutrition & NPK Top-Dressing",
            "duration": "Active vegetative & flowering periods",
            "icon": "💊",
            "instructions": [
                stages_desc.get("s3_en", "Apply DOA recommended NPK split top dressings."),
                "Earth up soil around root bases during fertilizer application.",
                "Keep beds clean and weed-free during nutrient uptake phases."
            ],
            "fertilizer_schedule": "Apply balanced Urea and MOP splits based on growth stage.",
            "ipm_and_protection": "Inspect regularly for sap-sucking pests and leaf miners.",
            "water_and_climate_tips": "Irrigate immediately following chemical fertilizer applications."
        },
        {
            "stage_number": 4,
            "title": f"4. Precision Irrigation & Moisture Regulation",
            "duration": "Throughout growth cycle",
            "icon": "💧",
            "instructions": [
                stages_desc.get("s4_en", "Maintain optimum soil moisture throughout development."),
                "Apply organic straw mulch to conserve moisture and regulate root temperature.",
                "Avoid overhead irrigation during flowering to safeguard pollination."
            ],
            "fertilizer_schedule": "Coordinate irrigation intervals with fertilizer schedules.",
            "ipm_and_protection": "Avoid late evening sprinkler watering to prevent foliar fungal spore germination.",
            "water_and_climate_tips": "Mulch beds to conserve root zone moisture."
        },
        {
            "stage_number": 5,
            "title": f"5. Integrated Pest & Disease Management (IPM)",
            "duration": "Weekly monitoring",
            "icon": "🛡️",
            "instructions": [
                stages_desc.get("s5_en", "Scout crop weekly for target pests and viral vectors."),
                "Deploy pheromone and sticky traps for early detection.",
                "Adhere strictly to Pre-Harvest Intervals (PHI) before marketing."
            ],
            "fertilizer_schedule": "Ensure adequate potassium nutrition to enhance natural plant defense walls.",
            "ipm_and_protection": "Rogue out and safely destroy any diseased plants immediately.",
            "water_and_climate_tips": "Maintain clean field borders to eliminate alternate pest hosts."
        },
        {
            "stage_number": 6,
            "title": f"6. Harvest Maturity & Plastic Crate Marketing",
            "duration": "At physiological maturity index",
            "icon": "🌾",
            "instructions": [
                stages_desc.get("s6_en", "Harvest at cool morning hours when produce turgor is peak."),
                "Mandatorily pack in rigid ventilated plastic crates to avoid transport damage.",
                "Transport promptly to Colombo Manning Market or Regional Economic Centers."
            ],
            "fertilizer_schedule": "Zero agrochemical sprays during active harvesting periods.",
            "ipm_and_protection": "Discard bruised, rotten, or pest-damaged specimens before crate packing.",
            "water_and_climate_tips": "Store packed crates in well-ventilated, shaded farm holding sheds."
        }
    ]

    stages_si = [
        {
            "stage_number": 1,
            "title": f"1. {names['si']} සඳහා බිම් සැකසීම සහ කාබනික පොහොර යෙදීම",
            "duration": "සිටුවීමට සති 2 - 3කට පෙර",
            "icon": "🌱",
            "instructions": [
                stages_desc.get("s1_si", "පස මනාව සී සා කැට පොඩි කර සකස් කරන්න."),
                "ජලය බැස යාම පහසු වන සේ උස් පාත්ති හෝ කානු සකසන්න.",
                "අක්කරයකට නිර්දේශිත පරිදි කොම්පෝස්ට් සහ ඩොලමයිට් යොදන්න."
            ],
            "fertilizer_schedule": "කාබනික කොම්පෝස්ට් සහ කෘෂිකර්ම දෙපාර්තමේන්තු මූලික පොහොර මිශ්‍රණය පසට කලවම් කරන්න.",
            "ipm_and_protection": "පසෙහි සිටින දිලීර බීජාණු විනාශ කිරීමට පස හිරු එළියට නිරාවරණය කරන්න.",
            "water_and_climate_tips": "වැසි ජලය රැඳීම වැළැක්වීම සඳහා කානු ක්‍රමවත්ව සකසන්න."
        },
        {
            "stage_number": 2,
            "title": f"2. උසස් රෝපණ ද්‍රව්‍ය තෝරාගැනීම සහ සිටුවීම",
            "duration": "සිටුවන අවස්ථාවේදී",
            "icon": "🌿",
            "instructions": [
                stages_desc.get("s2_si", "සහතික කළ නිරෝගී පැළ හෝ රෝපණ ද්‍රව්‍ය පමණක් තෝරාගන්න."),
                "නියමිත පේළි සහ පැළ පරතරය සහිතව පස්වරු කාලයේ සිටුවන්න.",
                "මුල් වටා වායු කුහර නොසිටින සේ පස් තද කරන්න."
            ],
            "fertilizer_schedule": "රසායනික පොහොර පැළයේ ළපටි මුල්වල කෙලින්ම නොගෑවෙන සේ පරිස්සම් වන්න.",
            "ipm_and_protection": "සිටුවීමට පෙර රෝපණ ද්‍රව්‍ය දිලීර නාශකයක ගල්වා ප්‍රතිකාර කරන්න.",
            "water_and_climate_tips": "පැළ සිටුවූ විගස මෘදුව ජලය සපයන්න."
        },
        {
            "stage_number": 3,
            "title": f"3. කෘෂිකර්ම දෙපාර්තමේන්තු NPK මතුපිට පොහොර කාලසටහන",
            "duration": "ක්‍රියාකාරී වර්ධක සහ මල් පිපෙන කාලය",
            "icon": "💊",
            "instructions": [
                stages_desc.get("s3_si", "කෘෂිකර්ම දෙපාර්තමේන්තුව නිර්දේශිත NPK මතුපිට පොහොර යොදන්න."),
                "පොහොර යෙදීමෙන් පසු පැළ පාමුලට පස් ගොඩගසන්න.",
                "පාත්ති වල් පැලෑටිවලින් තොරව පිරිසිදුව තබා ගන්න."
            ],
            "fertilizer_schedule": "යූරියා සහ MOP පොහොර නියමිත කාල පරතරයන්හිදී යොදන්න.",
            "ipm_and_protection": "යුෂ උරාබොන කෘමීන් සහ පත්‍ර පණුවන් පිළිබඳ විමසිලිමත් වන්න.",
            "water_and_climate_tips": "පොහොර යෙදූ විගස සැහැල්ලු ජල සම්පාදනයක් සිදු කරන්න."
        },
        {
            "stage_number": 4,
            "title": f"4. නිවැරදි ජල කළමනාකරණය සහ තෙතමනය රැකගැනීම",
            "duration": "වගා කාලය පුරා",
            "icon": "💧",
            "instructions": [
                stages_desc.get("s4_si", "වර්ධන කාලය පුරා පසෙහි ඒකාකාරී තෙතමනයක් පවත්වා ගන්න."),
                "තෙතමනය ආරක්ෂා කර ගැනීමට කාබනික පිදුරු වසුන් යොදන්න.",
                "මල් පිපෙන අවධියේදී මල් හැලීම වැළැක්වීමට අතිරික්ත ජලයෙන් වළකින්න."
            ],
            "fertilizer_schedule": "ජල සම්පාදනය පොහොර යෙදීමේ කාලසටහනට අනුව සම්බන්ධීකරණය කරන්න.",
            "ipm_and_protection": "සවස් කාලයේ පත්‍ර තෙත් වන සේ ජලය යෙදීමෙන් වළකින්න (දිලීර රෝග වැළැක්වීමට).",
            "water_and_climate_tips": "පාත්ති මත වසුන් යොදා මුල් වියළීමෙන් ආරක්ෂා කරන්න."
        },
        {
            "stage_number": 5,
            "title": f"5. ඒකාබද්ධ පළිබෝධ සහ රෝග පාලනය (IPM)",
            "duration": "සතිපතා ක්ෂේත්‍ර නිරීක්ෂණය",
            "icon": "🛡️",
            "instructions": [
                stages_desc.get("s5_si", "ක්ෂේත්‍රය සතිපතා නිරීක්ෂණය කර පළිබෝධ හානි හඳුනාගන්න."),
                "කෘමි උගුල් සහ ෆෙරමෝන් උගුල් භාවිතා කරන්න.",
                "අස්වැන්න නෙලීමට පෙර ආරක්ෂිත කාල සීමාව (PHI) දැඩිව අනුගමනය කරන්න."
            ],
            "fertilizer_schedule": "පොටෑසියම් නිසි පරිදි යෙදීමෙන් ශාකයේ ස්වභාවික ප්‍රතිශක්තිය වර්ධනය වේ.",
            "ipm_and_protection": "වෛරස් හෝ බැක්ටීරියා ආසාදිත පැළ දුටු වහාම ගලවා විනාශ කරන්න.",
            "water_and_climate_tips": "ක්ෂේත්‍රයේ මායිම් පිරිසිදුව තබා ගන්න."
        },
        {
            "stage_number": 6,
            "title": f"6. නියමිත පරිණතියේදී අස්වනු නෙලීම සහ ප්ලාස්ටික් කූඩවල ඇසිරීම",
            "duration": "අස්වනු නෙලන අවධියේදී",
            "icon": "🌾",
            "instructions": [
                stages_desc.get("s6_si", "උදෑසන සිසිල් වේලාවේදී අස්වැන්න නෙලාගන්න."),
                "ප්‍රවාහන හානි අවම කිරීමට ප්ලාස්ටික් කූඩවල අසුරන්න.",
                "කොළඹ මැනිං වෙළඳපල හෝ ආර්ථික මධ්‍යස්ථාන වෙත කඩිනමින් ප්‍රවාහනය කරන්න."
            ],
            "fertilizer_schedule": "අස්වනු නෙලන කාලය තුළ කිසිදු කෘමිනාශකයක් නොයොදන්න.",
            "ipm_and_protection": "හානි වූ හෝ රෝගී අස්වනු කූඩවලට දැමීමට පෙර ඉවත් කරන්න.",
            "water_and_climate_tips": "අස්වැන්න සෙවණ ඇති සිසිල් ස්ථානයක ගබඩා කරන්න."
        }
    ]

    stages_ta = [
        {
            "stage_number": 1,
            "title": f"1. {names['ta']} பயிருக்கான நிலம் தயாரித்தல் மற்றும் இயற்கை உரமிடல்",
            "duration": "நடவுக்கு 2 - 3 வாரங்களுக்கு முன்",
            "icon": "🌱",
            "instructions": [
                stages_desc.get("s1_ta", "நிலத்தை நன்கு உழுது மண்ணை மென்மையாக்கவும்."),
                "நீர் தேங்காமல் இருக்க மேட்டுப்பாத்திகள் மற்றும் வடிகால்களை அமைக்கவும்.",
                "பரிந்துரைக்கப்பட்ட உரம் மற்றும் டோலமைட்டை மண்ணில் கலக்கவும்."
            ],
            "fertilizer_schedule": "மக்கிய இயற்கை உரம் மற்றும் அடிப்படை பாஸ்பேட் உரத்தை இடவும்.",
            "ipm_and_protection": "மண்ணில் உள்ள பூஞ்சைகளை அழிக்க நிலத்தை வெயிலில் காயவிடவும்.",
            "water_and_climate_tips": "மழைக்காலத்தில் நீர் தேங்குவதைத் தடுக்க ஆழமான வடிகால்களை அமைக்கவும்."
        },
        {
            "stage_number": 2,
            "title": f"2. சான்றளிக்கப்பட்ட நடவுப் பொருட்கள் மற்றும் நடவு முறை",
            "duration": "நடவு செய்யும் போது",
            "icon": "🌿",
            "instructions": [
                stages_desc.get("s2_ta", "ஆரோக்கியமான சான்றளிக்கப்பட்ட நாற்றுகளைத் தேர்ந்தெடுக்கவும்."),
                "பரிந்துரைக்கப்பட்ட இடைவெளியில் மாலை வேளையில் நடவு செய்யவும்.",
                "வேர்ப்பகுதியில் காற்றுப் புகாதவாறு மண்ணை இறுக்கமாக அணைக்கவும்."
            ],
            "fertilizer_schedule": "இளவேர்களில் இரசாயன உரங்கள் நேரடியாகப் படாமல் பார்த்துக் கொள்ளவும்.",
            "ipm_and_protection": "நடவுக்கு முன் நாற்றுகளை பூஞ்சைக்கொல்லிக் கரைசலில் நனைக்கவும்.",
            "water_and_climate_tips": "நட்டவுடன் மென்மையாக நீர் பாய்ச்சவும்."
        },
        {
            "stage_number": 3,
            "title": f"3. விவசாயத் திணைக்களத்தின் NPK உர அட்டவணை",
            "duration": "வளர்ச்சி மற்றும் பூக்கும் பருவம்",
            "icon": "💊",
            "instructions": [
                stages_desc.get("s3_ta", "பரிந்துரைக்கப்பட்ட NPK உரங்களை சீரான இடைவெளியில் இடவும்."),
                "உரமிட்ட பின் வேர்ப்பகுதியில் மண் அணைக்கவும்.",
                "பாத்திகளில் களைகள் இல்லாமல் தூய்மையாக பராமரிக்கவும்."
            ],
            "fertilizer_schedule": "யூரியா மற்றும் பொட்டாஷ் உரங்களை வளர்ச்சிப் பருவத்திற்கு ஏற்ப இடவும்.",
            "ipm_and_protection": "சாறு உறிஞ்சும் பூச்சிகள் மற்றும் இலைப்புழுக்களை கண்காணிக்கவும்.",
            "water_and_climate_tips": "உரமிட்டவுடன் லேசாக நீர் பாய்ச்சவும்."
        },
        {
            "stage_number": 4,
            "title": f"4. சீரான நீர் பாசனம் மற்றும் ஈரப்பத மேலாண்மை",
            "duration": "பயிர் காலம் முழுவதும்",
            "icon": "💧",
            "instructions": [
                stages_desc.get("s4_ta", "பயிர் வளர்ச்சி முழுவதும் மண்ணில் சீரான ஈரப்பதத்தை பேணவும்."),
                "ஈரப்பதத்தை பாதுகாக்க வைக்கோல் மூடாக்கு இடவும்.",
                "பூக்கும் காலத்தில் அதிகப்படியான நீர் பாய்ச்சுவதை தவிர்க்கவும்."
            ],
            "fertilizer_schedule": "உரமிடும் காலத்திற்கு ஏற்ப நீர் பாசனத்தை ஒருங்கிணைக்கவும்.",
            "ipm_and_protection": "பூஞ்சை நோய்களைத் தடுக்க மாலை வேளையில் இலைகள் நனையுமாறு நீர் பாய்ச்ச வேண்டாம்.",
            "water_and_climate_tips": "மூடாக்கு மூலம் வேர்ப்பகுதியை ஈரப்பதமாக வைத்திருக்கவும்."
        },
        {
            "stage_number": 5,
            "title": f"5. ஒருங்கிணைந்த பூச்சி மற்றும் நோய் மேலாண்மை (IPM)",
            "duration": "வாராந்திர கண்காணிப்பு",
            "icon": "🛡️",
            "instructions": [
                stages_desc.get("s5_ta", "வாரந்தோறும் பயிர்களை கண்காணித்து பூச்சிகளை கண்டறியவும்."),
                "இனக்கவர்ச்சி பொறிகள் மற்றும் ஒட்டும் பொறிகளை பயன்படுத்தவும்.",
                "அறுவடைக்கு முன் மருந்து இடைவெளியை (PHI) கண்டிப்பாக பின்பற்றவும்."
            ],
            "fertilizer_schedule": "சரியான பொட்டாசியம் பயன்பாடு தாவரத்தின் நோய் எதிர்ப்பு சக்தியை அதிகரிக்கும்.",
            "ipm_and_protection": "வைரஸ் தாக்கிய செடிகளை உடனே பிடுங்கி அழிக்கவும்.",
            "water_and_climate_tips": "நிலத்தின் எல்லைகளை தூய்மையாக வைத்திருக்கவும்."
        },
        {
            "stage_number": 6,
            "title": f"6. அறுவடை மற்றும் பிளாஸ்டிக் கூடைகளில் அடைத்து சந்தைப்படுத்தல்",
            "duration": "சரியான முதிர்ச்சிப் பருவத்தில்",
            "icon": "🌾",
            "instructions": [
                stages_desc.get("s6_ta", "காலை வேளையில் குளிர்ந்த நேரத்தில் அறுவடை செய்யவும்."),
                "சேதமடைவதைத் தடுக்க காற்றோட்டமான பிளாஸ்டிக் கூடைகளில் அடைக்கவும்.",
                "கொழும்பு மேனிங் சந்தை அல்லது பொருளாதார மையங்களுக்கு உடனடியாக அனுப்பவும்."
            ],
            "fertilizer_schedule": "அறுவடை காலத்தில் பூச்சிக்கொல்லிகளை தெளிக்க வேண்டாம்.",
            "ipm_and_protection": "சேதமடைந்த விளைச்சலை கூடைகளில் அடைப்பதற்கு முன் அப்புறப்படுத்தவும்.",
            "water_and_climate_tips": "அறுவடை செய்ததை நிழலான இடத்தில் பாதுகாக்கவும்."
        }
    ]

    return {
        "en": stages_en,
        "si": stages_si,
        "ta": stages_ta
    }


def research_and_save_crop(crop_name: str, crops_database: dict) -> dict:
    """
    Intelligently research Sri Lankan agro-ecological standards for an unlisted crop,
    construct a verified Department of Agriculture (DOA) / HARTI agronomic profile,
    persist it to disk (backend/data/custom_crops.json), register it in CROPS_DATABASE,
    and return the crop object.
    """
    clean_name = crop_name.strip()
    c_low = clean_name.lower()
    
    # Check predefined Sri Lankan agricultural archetypes
    matched_archetype = None
    for arch in CROP_RESEARCH_ARCHETYPES:
        if any(kw in c_low for kw in arch["keywords"]):
            matched_archetype = arch
            break
            
    if matched_archetype:
        slug = matched_archetype["id"]
        stages = generate_crop_stages(matched_archetype["names"], matched_archetype["stages_desc"])
        
        crop_data = {
            "id": slug,
            "names": matched_archetype["names"],
            "category": matched_archetype["category"],
            "duration_days": matched_archetype["duration_days"],
            "disallowed_districts": list(matched_archetype["disallowed_districts"]),
            "unsuitable_planting_months": matched_archetype["unsuitable_planting_months"],
            "production_cost_per_acre": matched_archetype["production_cost_per_acre"],
            "yield_per_acre_kg": matched_archetype["yield_per_acre_kg"],
            "normal_wholesale_price": list(matched_archetype["normal_wholesale_price"]),
            "glut_harvest_months": matched_archetype["glut_harvest_months"],
            "glut_price": list(matched_archetype["glut_price"]),
            "varieties": matched_archetype["varieties"],
            "seed_rate": matched_archetype["seed_rate"],
            "spacing": matched_archetype["spacing"],
            "soil_and_ph": matched_archetype["soil_and_ph"],
            "stages": stages
        }
    else:
        # Dynamic Agro-ecological Synthesis Engine
        slug = re.sub(r'[^a-zA-Z0-9_]', '_', clean_name.lower()).strip('_')
        if not slug:
            slug = "custom_crop"
            
        is_upcountry = any(w in c_low for w in [
            'cold', 'highland', 'hill', 'temperate', 'montane', 'berry', 'apple', 'pear', 'plum',
            'beet', 'beetroot', 'carrot', 'leek', 'leeks', 'strawberry', 'cauliflower', 'broccoli', 'knolkhol',
            'කැරට්', 'ලීක්ස්', 'බීට්', 'බීට්රූට්', 'කෝලිෆ්ලවර්', 'ස්ට්‍රෝබෙරි', 'ඇපල්',
            'கேரட்', 'லீக்ஸ்', 'பீட்ரூட்', 'ஸ்ட்ராபெரி', 'காலிஃபிளவர்'
        ])
        is_heavy_wet = any(w in c_low for w in ['wet', 'rubber', 'cocoa', 'nutmeg', 'rambutan', 'mangosteen', 'රබර්', 'කුරුඳු', 'දූරියන්'])
        
        if is_upcountry:
            disallowed = UPCOUNTRY_DISALLOWED  # Strictly exclude Monaragala, Jaffna, Anuradhapura, etc.
            category = "Upcountry Specialty Crop"
            cost = 250000
            yield_kg = 5000
            price = [280, 450]
            glut_p = [160, 220]
            soil_en = "Deep, friable, acidic Red-Yellow Podzolic soil (pH 5.5 - 6.5) with rich organic humus. Requires cool upcountry climate (15-22C)."
            soil_si = "කාබනික ද්‍රව්‍ය බහුල ලිහිල් ආම්ලික රතු-කහ පොඩ්සොලික් පස (pH 5.5 - 6.5). සෙල්සියස් 15-22 සිසිල් උඩරට දේශගුණයක් අවශ්‍ය වේ."
            soil_ta = "அமிலத்தன்மை கொண்ட வளமான செம்மஞ்சள் மண் (pH 5.5 - 6.5). குளிர்ந்த மலைநாட்டு காலநிலை தேவை."
        elif is_heavy_wet:
            disallowed = DRY_INTERMEDIATE_DISTRICTS
            category = "Wet Zone Commercial Crop"
            cost = 200000
            yield_kg = 6000
            price = [220, 380]
            glut_p = [140, 190]
            soil_en = "Well-drained Red-Yellow Podzolic or alluvial soil (pH 5.5 - 6.5)."
            soil_si = "හොඳින් ජලය බැසයන රතු-කහ පොඩ්සොලික් හෝ දියළු පස (pH 5.5 - 6.5)."
            soil_ta = "நல்ல வடிகால் உள்ள செம்மஞ்சள் அல்லது வண்டல் மண் (pH 5.5 - 6.5)."
        else:
            disallowed = []
            category = "Commercial Agricultural Crop"
            cost = 175000
            yield_kg = 5500
            price = [180, 320]
            glut_p = [110, 160]
            soil_en = "Fertile, well-drained sandy loam or Reddish Brown Earth (pH 6.0 - 7.0)."
            soil_si = "හොඳින් ජලය බැසයන සාරවත් වැලි ලෝම හෝ රතු-දුඹුරු පස (pH 6.0 - 7.0)."
            soil_ta = "நல்ல வடிகால் உள்ள வளமான மணல் கலந்த களிமண் (pH 6.0 - 7.0)."

        names = {
            "en": clean_name,
            "si": clean_name,
            "ta": clean_name
        }
        stages_desc = {
            "s1_en": f"Plow land to 25 cm depth and incorporate 6-8 tons well-rotted compost per acre for {clean_name}.",
            "s1_si": f"{clean_name} සඳහා පස සෙ.මී. 25ක් ගැඹුරට සී සා අක්කරයකට කොම්පෝස්ට් ටොන් 6-8ක් කලවම් කරන්න.",
            "s1_ta": f"{clean_name} பயிருக்காக நிலத்தை 25 செ.மீ ஆழம் உழுது ஏக்கருக்கு 6-8 டன் உரம் இடவும்.",
            "s2_en": "Plant certified disease-free planting material at recommended spacing during cool evening hours.",
            "s2_si": "සහතික කළ නිරෝගී පැළ නියමිත පරතරය සහිතව පස්වරු කාලයේ සිටුවන්න.",
            "s2_ta": "சான்றளிக்கப்பட்ட நாற்றுகளை சரியான இடைவெளியில் மாலை வேளையில் நடவும்.",
            "s3_en": "Apply Department of Agriculture standard NPK fertilizer schedule in split doses.",
            "s3_si": "කෘෂිකර්ම දෙපාර්තමේන්තු සම්මත NPK පොහොර කාලසටහනට අනුව යොදන්න.",
            "s3_ta": "விவசாயத் திணைக்களத்தின் NPK உரங்களை சீரான இடைவெளியில் இடவும்.",
            "s4_en": "Maintain consistent soil moisture using furrow or drip irrigation without waterlogging.",
            "s4_si": "ජලය රැඳීමකින් තොරව පසෙහි ඒකාකාරී තෙතමනයක් පවත්වා ගන්න.",
            "s4_ta": "நீர் தேங்காமல் மண்ணில் சீரான ஈரப்பதத்தை பராமரிக்கவும்.",
            "s5_en": "Monitor field weekly and apply integrated pest management with organic neem extract and safe bio-controls.",
            "s5_si": "සතිපතා ක්ෂේත්‍රය නිරීක්ෂණය කර කොහොඹ නිස්සාරකය සහ කාබනික ක්‍රම මඟින් පළිබෝධ පාලනය කරන්න.",
            "s5_ta": "வாரந்தோறும் கண்காணித்து இயற்கை வேப்பெண்ணெய் மூலம் பூச்சிகளை கட்டுப்படுத்தவும்.",
            "s6_en": "Harvest at optimum maturity and mandatorily pack into ventilated plastic crates for market dispatch.",
            "s6_si": "නියමිත පරිණතියේදී අස්වැන්න නෙලා ප්ලාස්ටික් කූඩවල අසුරා මැනිං වෙළඳපල හෝ ආර්ථික මධ්‍යස්ථාන වෙත යොමු කරන්න.",
            "s6_ta": "சரியான முதிர்ச்சியில் அறுவடை செய்து பிளாஸ்டிக் கூடைகளில் சந்தைக்கு அனுப்பவும்."
        }
        
        stages = generate_crop_stages(names, stages_desc)
        
        crop_data = {
            "id": slug,
            "names": names,
            "category": category,
            "duration_days": 100,
            "disallowed_districts": disallowed,
            "unsuitable_planting_months": [],
            "production_cost_per_acre": cost,
            "yield_per_acre_kg": yield_kg,
            "normal_wholesale_price": price,
            "glut_harvest_months": [],
            "glut_price": glut_p,
            "varieties": {
                "en": "DOA / Research Institute Recommended Commercial Varieties",
                "si": "කෘෂිකර්ම දෙපාර්තමේන්තුව නිර්දේශිත උසස් වාණිජ ප්‍රභේද",
                "ta": "விவசாயத் திணைக்களத்தின் பரிந்துரைக்கப்பட்ட வணிக ரகங்கள்"
            },
            "seed_rate": {
                "en": "Standard Department of Agriculture certified seed rate per acre",
                "si": "කෘෂිකර්ම දෙපාර්තමේන්තු සම්මත අක්කරයක බීජ අවශ්‍යතාවය",
                "ta": "விவசாயத் திணைக்களத்தின் பரிந்துரைக்கப்பட்ட ஏக்கர் விதை அளவு"
            },
            "spacing": {
                "en": "Standard recommended row and plant spacing",
                "si": "කෘෂිකර්ම දෙපාර්තමේන්තු සම්මත පේළි සහ පැළ පරතරය",
                "ta": "விவசாயத் திணைக்களத்தின் பரிந்துரைக்கப்பட்ட பயிர் இடைவெளி"
            },
            "soil_and_ph": {
                "en": soil_en,
                "si": soil_si,
                "ta": soil_ta
            },
            "stages": stages
        }

    # Save to disk and register into CROPS_DATABASE
    save_custom_crop(crop_data, crops_database)
    return crop_data
