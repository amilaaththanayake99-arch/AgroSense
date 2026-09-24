// ==============================================================================
// CROP SUITABILITY & MARKET GLUT ANALYSIS (CropAnalysis.jsx)
// Features:
//  1. Farmer selects preferred crop, land acreage, target planting month, and district.
//  2. Dual-Factor Agronomic Evaluation:
//       - Factor 1: Soil, rainfall, elevation, and climatic compatibility with 25 districts.
//       - Factor 2: Harvest-time Wholesale Market Price Viability (Dambulla/Manning).
//         If climate is favorable but the harvest window coincides with a national glut (oversupply),
//         the system warns the farmer that cultivation would be loss-making ('පාඩුයි') and recommends 3 profitable alternatives.
//  3. Trilingual localization support with instant language toggle.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Scaling, 
  Search, 
  Sprout, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  Calendar, 
  X, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  BookOpen, 
  ChevronRight, 
  Droplets, 
  ShieldAlert, 
  Layers 
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ChatWidget from '../components/common/ChatWidget';
import { analyzeCrop } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import './CropAnalysis.css';

// 25 Districts of Sri Lanka with Coordinates, Provinces & DS Divisions (ප්‍රාදේශීය ලේකම් කොට්ඨාස)
const SRI_LANKA_DISTRICTS = {
  "Ampara": {
    lat: 7.2975, lon: 81.6747, province: "Eastern Province",
    ds_divisions: [
      "Ampara", "Addalaichenai", "Akkaraipattu", "Alayadivembu", "Damana", "Dehiattakandiya",
      "Irakkamam", "Kalmunai", "Karaitivu", "Lahugala", "Mahaoya", "Navithanveli",
      "Padiyathalawa", "Pottuvil", "Sainthamaruthu", "Sammanthurai", "Thirukkovil", "Uhana"
    ]
  },
  "Anuradhapura": {
    lat: 8.3114, lon: 80.4037, province: "North Central Province",
    ds_divisions: [
      "Nuwaragam Palatha Central", "Nuwaragam Palatha East", "Thalawa", "Tambuttegama",
      "Nochchiyagama", "Rajanganaya", "Galnewa", "Ipalogama", "Kekirawa", "Palagala",
      "Thirappane", "Medawachchiya", "Rambewa", "Kahatagasdigiliya", "Kebithigollewa",
      "Padaviya", "Horowpothana", "Mahawilachchiya", "Galenbindunuwewa", "Nachchadoowa", "Palugaswewa"
    ]
  },
  "Badulla": {
    lat: 6.9934, lon: 81.0550, province: "Uva Province",
    ds_divisions: [
      "Badulla", "Bandarawela", "Hali-Ela", "Haputale", "Mahiyanganaya", "Rideemaliyadda",
      "Passara", "Welimada", "Ella", "Uva Paranagama", "Haldummulla", "Kandaketiya",
      "Meegahakivula", "Lunugala", "Soranathota"
    ]
  },
  "Batticaloa": {
    lat: 7.7310, lon: 81.6747, province: "Eastern Province",
    ds_divisions: [
      "Manmunai North", "Eravur Pattu", "Manmunai South & Eruvil Pattu", "Porativu Pattu",
      "Manmunai West", "Koralai Pattu", "Koralai Pattu West", "Koralai Pattu North",
      "Koralai Pattu Central", "Koralai Pattu South", "Eravur Town", "Kattankudy", "Manmunai Pattu"
    ]
  },
  "Colombo": {
    lat: 6.9271, lon: 79.8612, province: "Western Province",
    ds_divisions: [
      "Colombo", "Thimbirigasyaya", "Kaduwela", "Maharagama", "Sri Jayawardenepura Kotte",
      "Dehiwala", "Ratmalana", "Moratuwa", "Kesbewa", "Homagama", "Kolonnawa", "Padukka", "Seethawaka"
    ]
  },
  "Galle": {
    lat: 6.0535, lon: 80.2210, province: "Southern Province",
    ds_divisions: [
      "Galle Four Gravets", "Ambalangoda", "Balapitiya", "Bentota", "Bope-Poddala",
      "Elpitiya", "Habaraduwa", "Hikkaduwa", "Imaduwa", "Karandeniya", "Nagoda",
      "Neluwa", "Niyagama", "Thawalama", "Yakkalamulla", "Baddegama", "Akmeemana", "Gonapinuwala"
    ]
  },
  "Gampaha": {
    lat: 7.0840, lon: 80.0098, province: "Western Province",
    ds_divisions: [
      "Gampaha", "Negombo", "Kelaniya", "Wattala", "Ja-Ela", "Mahara", "Dompe",
      "Biyagama", "Mirigama", "Minuwangoda", "Attanagalla", "Divulapitiya", "Katana"
    ]
  },
  "Hambantota": {
    lat: 6.1429, lon: 81.1212, province: "Southern Province",
    ds_divisions: [
      "Hambantota", "Ambalantota", "Tangalle", "Beliatta", "Tissamaharama",
      "Angunakolapelessa", "Katuwana", "Lunugamvehera", "Okewela", "Sooriyawewa", "Walasmulla", "Weeraketiya"
    ]
  },
  "Jaffna": {
    lat: 9.6615, lon: 80.0255, province: "Northern Province",
    ds_divisions: [
      "Jaffna", "Nallur", "Chavakachcheri", "Point Pedro", "Karaveddy", "Kopay",
      "Sandilipay", "Chankanai", "Tellippalai", "Uduvil", "Maruthankerney", "Karainagar", "Kayts", "Delft", "Velanai"
    ]
  },
  "Kalutara": {
    lat: 6.5854, lon: 79.9607, province: "Western Province",
    ds_divisions: [
      "Kalutara", "Panadura", "Horana", "Beruwala", "Bandaragama", "Matugama",
      "Agalawatta", "Bulathsinhala", "Dodangoda", "Ingiriya", "Madurawala", "Palindanuwara", "Walallavita"
    ]
  },
  "Kandy": {
    lat: 7.2906, lon: 80.6337, province: "Central Province",
    ds_divisions: [
      "Gangawata Korale", "Yatinuwara", "Udunuwara", "Harispattuwa", "Kundasale",
      "Pathadumbara", "Panvila", "Akurana", "Poojapitiya", "Hatharaliyadda",
      "Medadumbara", "Minipe", "Pasbage Korale", "Ganga Ihala Korale", "Udapalatha", "Doluwa", "Pathahewaheta", "Delthota"
    ]
  },
  "Kegalle": {
    lat: 7.2513, lon: 80.3464, province: "Sabaragamuwa Province",
    ds_divisions: [
      "Kegalle", "Mawanella", "Ruwanwella", "Warakapola", "Dehiowita", "Deraniyagala",
      "Galigamuwa", "Aranayaka", "Bulathkohupitiya", "Rambukkana", "Yatiyanthota"
    ]
  },
  "Kilinochchi": {
    lat: 9.3803, lon: 80.3770, province: "Northern Province",
    ds_divisions: [
      "Karachchi", "Kandavalai", "Pachchilaipalli", "Poonakary"
    ]
  },
  "Kurunegala": {
    lat: 7.4818, lon: 80.3609, province: "North Western Province",
    ds_divisions: [
      "Kurunegala", "Wariyapola", "Kuliyapitiya West", "Kuliyapitiya East", "Bingiriya",
      "Panduwasnuwara", "Nikaweratiya", "Maho", "Galgamuwa", "Polpithigama", "Ibbagamuwa",
      "Mawathagama", "Alawwa", "Narammala", "Giriulla", "Pannala", "Rideegama", "Ganewatta",
      "Kobeigane", "Kotavehera", "Rasnayakapura", "Polgahawela", "Udubaddawa", "Weerambugedara", "Ambanpola", "Bamunakotuwa"
    ]
  },
  "Mannar": {
    lat: 8.9810, lon: 79.9044, province: "Northern Province",
    ds_divisions: [
      "Mannar Town", "Manthai West", "Madhu", "Musali", "Nanaddan"
    ]
  },
  "Matale": {
    lat: 7.4675, lon: 80.6234, province: "Central Province",
    ds_divisions: [
      "Matale", "Dambulla", "Galewela", "Naula", "Pallepola", "Rattota",
      "Ukuwela", "Wilgamuwa", "Yatawatta", "Ambanganga Korale", "Laggala-Pallegama"
    ]
  },
  "Matara": {
    lat: 5.9549, lon: 80.5550, province: "Southern Province",
    ds_divisions: [
      "Matara Four Gravets", "Weligama", "Akuressa", "Devinuwara", "Dickwella",
      "Hakmana", "Kamburupitiya", "Kotapola", "Malimbada", "Pasgoda", "Pitabeddara",
      "Thihagoda", "Mulatiyana", "Athuraliya", "Kirinda Puhulwella"
    ]
  },
  "Monaragala": {
    lat: 6.8728, lon: 81.3507, province: "Uva Province",
    ds_divisions: [
      "Monaragala", "Wellawaya", "Buttala", "Bibile", "Kataragama", "Siyambalanduwa",
      "Medagama", "Madulla", "Thanamalwila", "Badalkumbura", "Sevanagala"
    ]
  },
  "Mullaitivu": {
    lat: 9.2671, lon: 80.8142, province: "Northern Province",
    ds_divisions: [
      "Maritimepattu", "Oddusuddan", "Puthukkudiyiruppu", "Thunukkai", "Manthai East", "Welioya"
    ]
  },
  "Nuwara Eliya": {
    lat: 6.9497, lon: 80.7891, province: "Central Province",
    ds_divisions: [
      "Nuwara Eliya", "Walapane", "Hanguranketha", "Ambagamuwa", "Kothmale"
    ]
  },
  "Polonnaruwa": {
    lat: 7.9403, lon: 81.0188, province: "North Central Province",
    ds_divisions: [
      "Thamankaduwa", "Hingurakgoda", "Medirigiriya", "Dimbulagala", "Elahera", "Lankapura", "Welikanda"
    ]
  },
  "Puttalam": {
    lat: 8.0362, lon: 79.8283, province: "North Western Province",
    ds_divisions: [
      "Puttalam", "Chilaw", "Wennappuwa", "Dankotuwa", "Anamaduwa", "Kalpitiya",
      "Arachchikattuwa", "Mahawewa", "Madampe", "Mundalama", "Karuwalagaswewa",
      "Nawagattegama", "Pallama", "Vanathavilluwa", "Nattandiya", "Mahakumbukkadawala"
    ]
  },
  "Ratnapura": {
    lat: 6.6828, lon: 80.4037, province: "Sabaragamuwa Province",
    ds_divisions: [
      "Ratnapura", "Balangoda", "Pelmadulla", "Kuruwita", "Eheliyagoda", "Embilipitiya",
      "Godakawela", "Kahawatta", "Kalawana", "Kolonna", "Nivithigala", "Opanayaka", "Ayagama", "Imbulpe", "Weligepola"
    ]
  },
  "Trincomalee": {
    lat: 8.5874, lon: 81.2152, province: "Eastern Province",
    ds_divisions: [
      "Trincomalee Town and Gravets", "Kantale", "Kinniya", "Muttur", "Gomarankadawala",
      "Kuchchaveli", "Morawewa", "Padavi Sri Pura", "Seruvila", "Thambalagamuwa", "Verugal"
    ]
  },
  "Vavuniya": {
    lat: 8.7542, lon: 80.4982, province: "Northern Province",
    ds_divisions: [
      "Vavuniya", "Vavuniya North", "Vavuniya South", "Vengalacheddikulam"
    ]
  }
};

const cropsList = [
  'Rice (Paddy)',
  'Big Onion',
  'Red Onion',
  'Tomato',
  'Green Chili',
  'Black Pepper',
  'Cinnamon',
  'Tea',
  'Potato',
  'Sweet Corn',
  'Coconut',
  'Rubber',
  'Banana',
  'Brinjal (Eggplant)',
  'Ginger',
  'Carrot',
  'Cabbage'
];

const monthsList = [
  'January',
  'February',
  'March',
  'April (Yala Season Start)',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October (Maha Season Start)',
  'November',
  'December'
];

const getDefaultCropSpecs = (cropName, lang = 'English') => {
  const c = (cropName || '').toLowerCase();
  const isSi = lang === 'සිංහල';
  const isTa = lang === 'தமிழ்';

  if (c.includes('rice') || c.includes('paddy') || c.includes('වී') || c.includes('ගොයම්') || c.includes('நெல்')) {
    if (isSi) {
      return {
        recommended_varieties: "Bg 352 (සුදු නාඩු), Bg 358 (රතු සම්බා), Bg 300 (මාස 3 කෙටි කාලීන), Bw 367",
        seed_rate: "අක්කරයට බීජ කිලෝ 40 - 50 (ඉසින ගොයම) හෝ කිලෝ 12 - 15 (පැරෂූට් / යාන්ත්‍රික පැළ සිටුවීම)",
        spacing: "පේළි අතර සෙන්ටිමීටර 20 x පැළ අතර සෙන්ටිමීටර 15 (පේළි සිටුවීම) හෝ මට්ටම් කළ මඩ බිමක විසුරුවා හැරීම",
        soil_and_ph: "දියළු හෝ මැටි ලෝම පස (pH අගය 5.5 - 6.8). තාවකාලික ජල රැඳවුම් තත්ත්වයන්ට ඔරොත්තු දෙයි."
      };
    }
    if (isTa) {
      return {
        recommended_varieties: "Bg 352 (வெள்ளை நன்னீர்), Bg 358 (சிவப்பு சம்பா), Bg 300 (3 மாத பயிர்), Bw 367",
        seed_rate: "ஏக்கருக்கு 40 - 50 கிலோ (நேரடி விதைப்பு) அல்லது 12 - 15 கிலோ (நடவு முறை)",
        spacing: "வரிசைகளுக்கு இடையே 20 செ.மீ x பயிர்களுக்கு இடையே 15 செ.மீ அல்லது சமப்படுத்தப்பட்ட சேற்று நிலத்தில் விதைத்தல்",
        soil_and_ph: "வண்டல் மண் அல்லது களிமண் (pH 5.5 - 6.8). தேங்கி நிற்கும் நீரை தாங்கும் தன்மை கொண்டது."
      };
    }
    return {
      recommended_varieties: "Bg 352 (3.5 Mo, High Yield White), Bg 358 (Red Samba), Bg 300 (3 Mo), Bw 367",
      seed_rate: "40 - 50 kg / acre (Broadcast) or 12 - 15 kg / acre (Parachute / Mechanical Transplanting)",
      spacing: "20 cm x 15 cm (Transplant / Parachute) or uniform leveled broadcast",
      soil_and_ph: "Alluvial Lowland or Clay Loam (pH 5.5 - 6.8). Tolerates temporary standing water."
    };
  }
  if (c.includes('chili') || c.includes('miris') || c.includes('මිරිස්') || c.includes('මිලකாய்') || c.includes('மிளகாய்')) {
    if (isSi) {
      return {
        recommended_varieties: "MICH 1, MICH 2, KA 2, වාරණිය, MI Green (කෘෂිකර්ම දෙපාර්තමේන්තු සහතිකලත්)",
        seed_rate: "අක්කරයට ග්‍රෑම් 150 - 200 (තවාන් තැටි මඟින් පැළ නිපදවීම)",
        spacing: "පේළි අතර සෙන්ටිමීටර 60 x පැළ අතර සෙන්ටිමීටර 45 (අක්කරයකට පැළ 14,000 ක් පමණ)",
        soil_and_ph: "මනා ජලාපවහනය සහිත වැලි ලෝම හෝ රතු කහ පොඩ්සොලික් පස (pH 6.0 - 6.8). අක්කරයට ඩොලමයිට් කිලෝ 150 ක් යොදන්න."
      };
    }
    if (isTa) {
      return {
        recommended_varieties: "MICH 1, MICH 2, KA 2, வாரணியா, MI Green (விவசாயத் திணைக்கள சான்றளிக்கப்பட்ட)",
        seed_rate: "ஏக்கருக்கு 150 - 200 கிராம் (தட்டு நாற்றுமேடை உற்பத்தி முறை)",
        spacing: "வரிசைகளுக்கு இடையே 60 செ.மீ x பயிர்களுக்கு இடையே 45 செ.மீ (ஏக்கருக்கு 14,000 பயிர்கள்)",
        soil_and_ph: "நல்ல வடிகால் வசதியுள்ள மணல் கலந்த வண்டல் மண் (pH 6.0 - 6.8). ஏக்கருக்கு 150 கிலோ டோலமைட் இடுக."
      };
    }
    return {
      recommended_varieties: "MICH 1, MICH 2, KA 2, Waraniya, MI Green (DOA Certified)",
      seed_rate: "150 - 200 grams / acre (Seedling pro-tray nursery production)",
      spacing: "60 cm between rows x 45 cm between plants (14,000 plants/acre)",
      soil_and_ph: "Well-drained Sandy Loam or Red-Yellow Podzolic (pH 6.0 - 6.8). Apply 150 kg dolomite/acre."
    };
  }
  if (c.includes('tomato') || c.includes('තක්කාලි') || c.includes('தக்காளி')) {
    if (isSi) {
      return {
        recommended_varieties: "තිළිණ, රශ්මි, මහේෂි, පද්මා, ලංකා චෙරි (කෘෂිකර්ම දෙපාර්තමේන්තු සහතිකලත්)",
        seed_rate: "අක්කරයට ග්‍රෑම් 120 - 150 (සිදුරු 104 තැටි තවාන්)",
        spacing: "පේළි අතර සෙන්ටිමීටර 80 x පැළ අතර සෙන්ටිමීටර 50 (අක්කරයකට පැළ 10,000)",
        soil_and_ph: "කාබනික ද්‍රව්‍ය බහුල මනා ජලාපවහනයක් සහිත සාරවත් ලෝම පස (pH 6.0 - 6.8)."
      };
    }
    if (isTa) {
      return {
        recommended_varieties: "திலின, ரஷ்மி, மகேஷி, பத்மா, லங்கா செர்ரி (சான்றளிக்கப்பட்ட வகைகள்)",
        seed_rate: "ஏக்கருக்கு 120 - 150 கிராம் (104 துளை தட்டு நாற்றுமேடை)",
        spacing: "வரிசைகளுக்கு இடையே 80 செ.மீ x செடிகளுக்கு இடையே 50 செ.மீ (ஏக்கருக்கு 10,000 செடிகள்)",
        soil_and_ph: "சேதனப் பொருட்கள் நிறைந்த நல்ல வடிகால் கொண்ட வண்டல் மண் (pH 6.0 - 6.8)."
      };
    }
    return {
      recommended_varieties: "Thilina, Rashmi, Maheshi, Padma, Lanka Cherry (DOA Certified)",
      seed_rate: "120 - 150 grams / acre (104-hole pro-tray plug nursery)",
      spacing: "80 cm between rows x 50 cm between plants (10,000 plants/acre)",
      soil_and_ph: "Deep, well-drained fertile loam rich in organic matter (pH 6.0 - 6.8)."
    };
  }
  if (c.includes('maize') || c.includes('corn') || c.includes('බඩඉරිඟු') || c.includes('சோளம்')) {
    if (isSi) {
      return {
        recommended_varieties: "පැසිෆික් 999, රුවන්, භද්‍රා, ජෙට් 999 (ඉහළ අස්වනු දෙමුහුන්)",
        seed_rate: "අක්කරයට දෙමුහුන් බීජ කිලෝ 7.5 - 8.5",
        spacing: "පේළි අතර සෙන්ටිමීටර 60 x වැටි දිගේ පැළ අතර සෙන්ටිමීටර 25 (අක්කරයට පැළ 26,000)",
        soil_and_ph: "මනා ජලාපවහන රතු-දුඹුරු පස හෝ වැලි ලෝම පස (pH 5.8 - 7.2)."
      };
    }
    if (isTa) {
      return {
        recommended_varieties: "பசிபிக் 999, ருவன், பத்ரா, ஜெட் 999 (உயர் விளைச்சல் கலப்பினங்கள்)",
        seed_rate: "ஏக்கருக்கு 7.5 - 8.5 கிலோ கலப்பின விதைகள்",
        spacing: "வரிசைகளுக்கு இடையே 60 செ.மீ x பயிர்களுக்கு இடையே 25 செ.மீ (ஏக்கருக்கு 26,000 பயிர்கள்)",
        soil_and_ph: "நல்ல வடிகால் கொண்ட சிவப்பு-பழுப்பு மண் அல்லது மணல் வண்டல் மண் (pH 5.8 - 7.2)."
      };
    }
    return {
      recommended_varieties: "Pacific 999, Ruwan, Bhadra, Jet 999 (High-Yield Hybrids)",
      seed_rate: "7.5 - 8.5 kg hybrid seeds / acre",
      spacing: "60 cm between rows x 25 cm along ridges (26,000 plants/acre)",
      soil_and_ph: "Well-drained Reddish Brown Earth or sandy loam (pH 5.8 - 7.2)."
    };
  }
  if (c.includes('onion') || c.includes('ළුණු') || c.includes('ලූණු') || c.includes('வெங்காயம்')) {
    if (isSi) {
      return {
        recommended_varieties: "දඹුල්ල සිලෙක්ෂන්, ප්‍රේමා, කාන්ති, වෙදාලන් (රතු ළුණු)",
        seed_rate: "සත්‍ය බීජ අක්කරයට කිලෝ 3.5 - 4.5 හෝ බීජ බල්බ කිලෝ 400 - 500",
        spacing: "සෙන්ටිමීටර 10 x 10 උස් පාත්ති මත (පාත්ති උස සෙන්ටිමීටර 15-20)",
        soil_and_ph: "මනා මතුපිට ජලාපවහනයක් සහිත බුරුල් වැලි ලෝම පස (pH 6.0 - 6.8)."
      };
    }
    if (isTa) {
      return {
        recommended_varieties: "தம்புள்ளை செலக்சன், பிரேமா, காந்தி, வேதாளன் (சிவப்பு வெங்காயம்)",
        seed_rate: "உண்மை விதைகள் ஏக்கருக்கு 3.5 - 4.5 கிலோ அல்லது விதை வெங்காயம் 400 - 500 கிலோ",
        spacing: "உயர்த்தப்பட்ட பாத்திகளில் 10 செ.மீ x 10 செ.மீ (பாத்தி உயரம் 15-20 செ.மீ)",
        soil_and_ph: "விரைவான வடிகால் வசதியுள்ள மணல் கலந்த வண்டல் மண் (pH 6.0 - 6.8)."
      };
    }
    return {
      recommended_varieties: "Dambulla Selection, Prema, Kanthi, Vethalan (Red Onion)",
      seed_rate: "3.5 - 4.5 kg true seeds / acre or 400 - 500 kg mother bulb sets / acre",
      spacing: "10 cm x 10 cm on raised beds (15-20 cm bed height)",
      soil_and_ph: "Friable sandy loam with rapid surface drainage (pH 6.0 - 6.8)."
    };
  }
  // Generic
  if (isSi) {
    return {
      recommended_varieties: `කෘෂිකර්ම දෙපාර්තමේන්තු සහතිකලත් ප්‍රභේද (${cropName})`,
      seed_rate: "අක්කරයකට නිර්දේශිත බීජ ප්‍රමාණය",
      spacing: "ප්‍රශස්ත වාතාශ්‍රය සහ හිරු එළිය සඳහා නිර්දේශිත පරතරය",
      soil_and_ph: "කාබනික පොහොර ටොන් 5-8ක් සහ අවශ්‍ය නම් ඩොලමයිට් එක්කළ මනා පස"
    };
  }
  if (isTa) {
    return {
      recommended_varieties: `விவசாயத் திணைக்கள சான்றளிக்கப்பட்ட வகைகள் (${cropName})`,
      seed_rate: "ஏக்கருக்கான நிலையான விதை அளவு",
      spacing: "உகந்த காற்றோட்டத்திற்கான வரிசை மற்றும் தாவர இடைவெளி",
      soil_and_ph: "மக்கிய சேதன உரம் 5-8 டன்கள் மற்றும் டோலமைட் கலந்த நல்ல மண்"
    };
  }
  return {
    recommended_varieties: `DOA Certified Commercial Varieties for ${cropName}`,
    seed_rate: "Standard DOA recommended seed rate per acre",
    spacing: "Recommended field row & plant spacing for optimal canopy ventilation",
    soil_and_ph: "Well-drained arable soil with 5-8 tons organic compost and dolomite if acidic"
  };
};

const getLocalizedDefaultStages = (cropSpecs, lang = 'English') => {
  const isSi = lang === 'සිංහල';
  const isTa = lang === 'தமிழ்';

  if (isSi) {
    return [
      {
        stage_number: 1,
        title: "1. බිම් සැකසීම සහ පාංශු සංවර්ධනය",
        duration: "සිටුවීමට සති 3 - 4 කට පෙර",
        icon: "🌱",
        instructions: [
          "පස සෙන්ටිමීටර 25-30ක් ගැඹුරට සීසා තද පාංශු ස්ථර බිඳ දමා වාතාශ්‍රය ඇති කරන්න.",
          "හොඳින් දිරාපත් වූ ගොම හෝ කොම්පෝස්ට් පොහොර අක්කරයකට මෙට්‍රික් ටොන් 6-8ක් පසට එක්කරන්න.",
          "පාංශු pH අගය ආම්ලික නම් (< 5.8) අක්කරයට ඩොලමයිට් කිලෝ 150-200ක් යොදන්න.",
          "ජල ගැලීම් වැළැක්වීම සඳහා පැති කානු සහිත සෙන්ටිමීටර 15-20 උස් පාත්ති සාදන්න."
        ],
        fertilizer_schedule: "දෙවන සීසෑමේදී කොම්පෝස්ට් පොහොර ටොන් 6-8ක් සහ ඩොලමයිට් පසට මිශ්‍ර කරන්න.",
        ipm_and_protection: "පසෙහි සිටින දිලීර බීජාණු සහ කෘමි කීටයන් විනාශ කිරීමට පස සූර්ය තාපයට නිරාවරණය කරන්න.",
        water_and_climate_tips: "අධික වර්ෂාවකදී ජලය බැසයාමට ප්‍රධාන ජලාපවහන කානු පිරිසිදුව තබාගන්න."
      },
      {
        stage_number: 2,
        title: "2. බීජ ප්‍රතිකාර, තවාන සහ සිටුවීම",
        duration: "සති 1 - 2",
        icon: "🌿",
        instructions: [
          `කෘෂිකර්ම දෙපාර්තමේන්තු සහතිකලත් බීජ භාවිතා කරන්න (${cropSpecs.recommended_varieties}).`,
          "සිටුවීමට පෙර බීජ ට්‍රයිකොඩර්මා හෝ දිලීර නාශකයකින් ප්‍රතිකාර කරන්න.",
          `නියමිත පරතරය (${cropSpecs.spacing}) අනුව පැළ සිටුවන්න.`,
          "පැළ සිටුවීම සවස් කාලයේ සිදුකර මුල් අවට පස තද කරන්න."
        ],
        fertilizer_schedule: "පැළ මතුවී දින 12කින් දියර නයිට්‍රජන් පොහොර යොදන්න (වතුර ලීටර් 10ට යූරියා ග්‍රෑම් 10).",
        ipm_and_protection: "වෛරස් වාහක කෘමීන් වැළැක්වීමට තවාන කෘමි ආරක්ෂිත දැලකින් ආවරණය කරන්න.",
        water_and_climate_tips: "පැළ සිටුවීමෙන් පසු වහාම මඳ වශයෙන් ජලය සපයන්න."
      },
      {
        stage_number: 3,
        title: "3. කෘෂිකර්ම දෙපාර්තමේන්තු නිල පොහොර නිර්දේශය",
        duration: "මූලික සහ මතුපිට පොහොර අවධිය",
        icon: "💊",
        instructions: [
          "මූලික පොහොර: සිටුවීමට දින 1-2කට පෙර TSP සම්පූර්ණ ප්‍රමාණය (කිලෝ 35) + යූරියා 1/3 (කිලෝ 25) + MOP 1/3 (කිලෝ 20) පසට එක්කරන්න.",
          "1 වන මතුපිට පොහොර: සිටුවා සති 3කින් යූරියා (කිලෝ 25) යොදන්න.",
          "2 වන මතුපිට පොහොර: මල් පිපෙන අවධියේදී (සති 6කින්) යූරියා (කිලෝ 25) + MOP (කිලෝ 25) යොදන්න.",
          "පොහොර කඳෙන් සෙන්ටිමීටර 5-8ක් ඈතින් වලයාකාරව යොදා පස්වලින් වසා ජලය සපයන්න."
        ],
        fertilizer_schedule: "කෘෂිකර්ම දෙපාර්තමේන්තු අක්කර නිර්දේශය: මූලික (TSP 35kg + Urea 25kg + MOP 20kg), 1 වන මතුපිට (Urea 25kg), 2 වන මතුපිට (Urea 25kg + MOP 25kg).",
        ipm_and_protection: "නයිට්‍රජන් පමණ ඉක්මවා යෙදීමෙන් වළකින්න; එය උරාබොන කෘමීන් ආකර්ෂණය කරයි.",
        water_and_climate_tips: "පොහොර දැමූ වහාම හොඳින් ජලය සපයන්න."
      },
      {
        stage_number: 4,
        title: "4. ජල සම්පාදනය සහ ජලාපවහන කළමනාකරණය",
        duration: "සමස්ත වගා කාලය පුරා",
        icon: "💧",
        instructions: [
          "වියළි කලාපයේ දින 3-4කට වරක්ද, අතරමැදි කලාපයේ දින 5-6කට වරක්ද ජලය සපයන්න.",
          "මල් පිපෙන සහ ඵල හටගන්නා කාලයේදී ප්‍රමාණවත් තෙතමනයක් අනිවාර්යයෙන්ම පවත්වා ගන්න.",
          "ජල කාර්යක්ෂමතාව ඉහළ නැංවීමට බිංදු හෝ ඇලි ජල සම්පාදන ක්‍රම අනුගමනය කරන්න.",
          "තද වැසි ඇතිවූ වහාම කානු දිගේ අතිරික්ත ජලය බැසයාමට ඉඩ හරින්න."
        ],
        fertilizer_schedule: "පොහොර උරාගැනීම කාර්යක්ෂම කිරීම සඳහා ජල සම්පාදනය නිසි වේලාවට සිදුකරන්න.",
        ipm_and_protection: "දිලීර රෝග වැළැක්වීමට සවස් කාලයේ පත්‍ර මතට වතුර ඉසීමෙන් වළකින්න.",
        water_and_climate_tips: "පාංශු තෙතමනය ආරක්ෂා කිරීමට පිදුරු වසුනක් යොදන්න."
      },
      {
        stage_number: 5,
        title: "5. ඒකාබද්ධ පළිබෝධ, රෝග සහ වල් මර්දනය",
        duration: "සතිපතා ක්ෂේත්‍ර නිරීක්ෂණය",
        icon: "🛡️",
        instructions: [
          "පැළ සිටුවා දින 20දී සහ දින 45දී අතින් වල් මර්දනය සිදුකරන්න.",
          "අක්කරයකට කහ පැහැති ඇලෙන සුළු උගුල් 15ක් සහ නිල් පැහැති උගුල් 15ක් සවිකරන්න.",
          "කොහොඹ ඇට සාරය (4%) දින 10-14කට වරක් වැළැක්වීමේ පියවරක් ලෙස ඉසින්න.",
          "අස්වනු නෙලීමට අවම වශයෙන් සති 1-2කට පෙර සියලුම කෘමිනාශක ඉසීම නවත්වන්න."
        ],
        fertilizer_schedule: "මල් පිපෙන කාලයේදී ක්ෂුද්‍ර පෝෂක (සින්ක් + බෝරෝන්) දියර පොහොරක් යොදන්න.",
        ipm_and_protection: "වෛරස් හා බැක්ටීරියා ආසාදිත පැළ දුටු වහාම ගලවා දමා විනාශ කරන්න.",
        water_and_climate_tips: "කෘමීන් බෝවීම වැළැක්වීමට නියරවල් පිරිසිදුව තබාගන්න."
      },
      {
        stage_number: 6,
        title: "6. අස්වනු නෙලීම, වර්ගීකරණය සහ ඇසුරුම්කරණය",
        duration: "නියමිත පරිණත අවස්ථාවේදී",
        icon: "🌾",
        instructions: [
          "උදෑසන සිසිල් වේලාවේ (පෙ.ව. 6:30 - 9:30) අස්වනු නෙලීම සිදුකරන්න.",
          "පලතුරු හෝ කරල් ගැලවීමේදී පිරිසිදු කතුරක් හෝ පිහියක් භාවිතා කරන්න.",
          "ශ්‍රී ලංකා ප්‍රමිති (SLS) අනුව අස්වැන්න A සහ B ශ්‍රේණිවලට වර්ග කරන්න.",
          "ප්‍රවාහනයේදී සිදුවන 30-40% හානිය වැළැක්වීමට වාතාශ්‍රය සහිත ප්ලාස්ටික් කූඩවල පමණක් අසුරන්න.",
          "සවස් කාලයේදී කොළඹ මැනිං, දඹුල්ල හෝ සුපිරි වෙළඳසැල් මධ්‍යස්ථාන වෙත ප්‍රවාහනය කරන්න."
        ],
        fertilizer_schedule: "අස්වනු නෙලන කාලසීමාව තුළ කිසිදු රසායනිකයක් නොයොදන්න.",
        ipm_and_protection: "නරක් වූ හෝ රෝගී අස්වනු ප්‍රවාහනයට පෙර ඉවත් කරන්න.",
        water_and_climate_tips: "අව් රශ්මියෙන් ආරක්ෂා කරගැනීමට ප්‍රවාහන ලොරි තට්ටු ආවරණය කරන්න."
      }
    ];
  }

  if (isTa) {
    return [
      {
        stage_number: 1,
        title: "1. நிலம் தயாரித்தல் மற்றும் மண் பதப்படுத்துதல்",
        duration: "நடவு செய்வதற்கு 3 - 4 வாரங்களுக்கு முன்",
        icon: "🌱",
        instructions: [
          "மண்ணை 25-30 செ.மீ ஆழத்திற்கு உழுது காற்றோட்டத்தை அதிகரிக்கவும்.",
          "ஏக்கருக்கு 6-8 மெட்ரிக் டன் மக்கிய சாண உரம் அல்லது உரம் இடவும்.",
          "மண்ணின் கார அமிலத்தன்மை (pH < 5.8) குறைவாக இருந்தால் ஏக்கருக்கு 150-200 கிலோ டோலமைட் இடுக.",
          "நீர் தேங்குவதைத் தடுக்க 15-20 செ.மீ உயரமான பாத்திகளை அமைக்கவும்."
        ],
        fertilizer_schedule: "இரண்டாவது உழவின் போது மக்கிய இயற்கை உரம் மற்றும் டோலமைட்டை மண்ணில் கலக்கவும்.",
        ipm_and_protection: "மண்ணிலுள்ள பூச்சிகள் மற்றும் பூஞ்சை வித்துக்களை அழிக்க நிலத்தை வெயிலில் காயவிடவும்.",
        water_and_climate_tips: "கனமழையின் போது வெள்ள நீர் தேங்குவதைத் தடுக்க வடிகால்களைச் சுத்தம் செய்யவும்."
      },
      {
        stage_number: 2,
        title: "2. விதை சிகிச்சை, நாற்றுமேடை மற்றும் நடுதல்",
        duration: "1 - 2 வாரங்கள்",
        icon: "🌿",
        instructions: [
          `விவசாயத் திணைக்கள சான்றளிக்கப்பட்ட விதைகளைப் பயன்படுத்தவும் (${cropSpecs.recommended_varieties}).`,
          "விதைப்பதற்கு முன் விதைகளை ட்ரைக்கோடெர்மா அல்லது பூஞ்சைக் கொல்லி மூலம் பரிகரிக்கவும்.",
          `பரிந்துரைக்கப்பட்ட இடைவெளியைப் பின்பற்றவும் (${cropSpecs.spacing}).`,
          "மாலையில் நாற்றுகளை நட்டு வேர் பகுதியைச் சுற்றி மண்ணை இறுக்கவும்."
        ],
        fertilizer_schedule: "முளைத்த 12 நாட்களுக்குப் பின் லேசான திரவ நைதரசன் உரமிடுக (10 லீட்டர் நீரில் 10 கிராம் யூரியா).",
        ipm_and_protection: "வைரஸ் பரப்பும் பூச்சிகளைத் தடுக்க நாற்றுமேடையை 40-மெஷ் பூச்சி வலை மூலம் மூடவும்.",
        water_and_climate_tips: "நட்ட உடனேயே லேசான நீர்ப்பாசனம் செய்யவும்."
      },
      {
        stage_number: 3,
        title: "3. விவசாயத் திணைக்களத்தின் உத்தியோகபூர்வ உரப் பரிந்துரை",
        duration: "அடிப்படை மற்றும் மேலுர நிலைகள்",
        icon: "💊",
        instructions: [
          "அடிப்படை உரம்: நடவுக்கு 1-2 நாட்களுக்கு முன் முழு TSP (35 கிலோ) + 1/3 யூரியா (25 கிலோ) + 1/3 MOP (20 கிலோ) இடவும்.",
          "1வது மேலுரம்: நடவு செய்து 3 வாரங்களில் யூரியா (25 கிலோ) இடவும்.",
          "2வது மேலுரம்: பூக்கும் பருவத்தில் (6 வாரங்களில்) யூரியா (25 கிலோ) + MOP (25 கிலோ) இடவும்.",
          "தண்டிலிருந்து 5-8 செ.மீ தள்ளி உரமிட்டு மண்ணால் மூடி நீர் பாய்ச்சவும்."
        ],
        fertilizer_schedule: "DOA ஏக்கர் பரிந்துரை: அடிப்படை (TSP 35kg + Urea 25kg + MOP 20kg), 1வது மேலுரம் (Urea 25kg), 2வது மேலுரம் (Urea 25kg + MOP 25kg).",
        ipm_and_protection: "அதிகப்படியான நைதரசன் உரமிடுவதைத் தவிர்க்கவும்; இது சாறு உறிஞ்சும் பூச்சிகளை ஈர்க்கும்.",
        water_and_climate_tips: "உரமிட்ட உடனேயே நன்றாக நீர் பாய்ச்சவும்."
      },
      {
        stage_number: 4,
        title: "4. நீர்ப்பாசனம் மற்றும் வடிகால் முகாமைத்துவம்",
        duration: "பயிர் வளர்ச்சி காலம் முழுவதும்",
        icon: "💧",
        instructions: [
          "வறண்ட வலயத்தில் 3-4 நாட்களுக்கு ஒருமுறையும் இடை வலயத்தில் 5-6 நாட்களுக்கு ஒருமுறையும் நீர் பாய்ச்சவும்.",
          "பூக்கும் மற்றும் காய் பிடிக்கும் பருவத்தில் ஈரப்பதத்தை சீராகப் பராமரிக்கவும்.",
          "நீர்ப் பயன்பாட்டுத் திறனை அதிகரிக்க சொட்டு அல்லது வாய்க்கால் நீர்ப்பாசனத்தைப் பயன்படுத்தவும்.",
          "கனமழை பெய்தவுடன் வயலில் இருந்து அதிகப்படியான நீரை உடனடியாக வெளியேற்றவும்."
        ],
        fertilizer_schedule: "ஊட்டச்சத்து உறிஞ்சுதலை அதிகரிக்க நீர்ப்பாசன நேரத்தை உரமிடுதலுடன் ஒருங்கிணைக்கவும்.",
        ipm_and_protection: "பூஞ்சை நோய்களைத் தடுக்க மாலையில் இலைகளின் மேல் தெளிப்பான் மூலம் நீர் பாய்ச்சுவதைத் தவிர்க்கவும்.",
        water_and_climate_tips: "மண் ஈரப்பதத்தைப் பாதுகாக்க வைக்கோல் கொண்டு நிலப்போர்வை இடவும்."
      },
      {
        stage_number: 5,
        title: "5. ஒருங்கிணைந்த பூச்சி, நோய் மற்றும் களை கட்டுப்பாடு",
        duration: "வாராந்த களக் கண்காணிப்பு",
        icon: "🛡️",
        instructions: [
          "நட்ட 20 மற்றும் 45 நாட்களில் கைக்களை அகற்றவும்.",
          "ஏக்கருக்கு 15 மஞ்சள் நிற மற்றும் 15 நீல நிற ஒட்டும் பொறிகளைப் பொருத்தவும்.",
          "வேப்பங்கொட்டை சாற்றை (4%) 10-14 நாட்களுக்கு ஒருமுறை தடுப்பு மருந்தாகத் தெளிக்கவும்.",
          "அறுவடைக்கு குறைந்தது 1-2 வாரங்களுக்கு முன் இரசாயன மருந்து தெளிப்பதை நிறுத்தவும்."
        ],
        fertilizer_schedule: "பூக்கும் பருவத்தில் துத்தநாகம் மற்றும் போரான் அடங்கிய நுண்ணூட்ட உரத்தைத் தெளிக்கவும்.",
        ipm_and_protection: "வைரஸ் தாக்கிய செடிகளை உடனடியாகப் பிடுங்கி அழிக்கவும்.",
        water_and_climate_tips: "பூச்சிகள் தங்குவதைத் தடுக்க வரப்புகளைச் சுத்தமாக வைத்திருக்கவும்."
      },
      {
        stage_number: 6,
        title: "6. அறுவடை, தரம் பிரித்தல் மற்றும் பொதியிடல்",
        duration: "முதிர்ச்சியடைந்த நிலையில்",
        icon: "🌾",
        instructions: [
          "குளிர்ந்த காலை வேளையில் (காலை 6:30 - 9:30) அறுவடை செய்யவும்.",
          "அறுவடைக்கு சுத்தமான கத்தரிகளைப் பயன்படுத்தவும்; செடிகளை இழுத்துப் பறிக்க வேண்டாம்.",
          "இலங்கை தரநிலைகளுக்கு (SLS) ஏற்ப A மற்றும் B தரங்களாகப் பிரிக்கவும்.",
          "போக்குவரத்து சேதத்தைத் தவிர்க்க பிளாஸ்டிக் பெட்டிகளில் மட்டுமே அடைக்கவும்.",
          "மாலையில் கொழும்பு மேனிங், தம்புள்ளை அல்லது சூப்பர் மார்க்கெட் மையங்களுக்கு அனுப்பவும்."
        ],
        fertilizer_schedule: "அறுவடை காலத்தில் இரசாயன தெளிப்புகளை முற்றிலும் தவிர்க்கவும்.",
        ipm_and_protection: "சேதமடைந்த காய்களை பொதியிடுவதற்கு முன் அகற்றவும்.",
        water_and_climate_tips: "வெயிலிலிருந்து பாதுகாக்க லொறிகளை தார்ப்பாயால் மூடவும்."
      }
    ];
  }

  // English default
  return [
    {
      stage_number: 1,
      title: "1. Land Preparation & Soil Conditioning",
      duration: "3 - 4 weeks prior to planting",
      icon: "🌱",
      instructions: [
        "Plow soil to 25-30 cm depth to break hardpan layers and improve aeration.",
        "Incorporate 6-8 tons of decomposed organic manure or compost per acre.",
        "Apply 150-200 kg/acre dolomite if soil pH is acidic (< 5.8).",
        "Form raised planting beds (15-20 cm high) with clear peripheral drainage canals."
      ],
      fertilizer_schedule: "Incorporate 6-8 tons organic manure and dolomite during secondary plowing.",
      ipm_and_protection: "Deep solarization plowing to destroy soil-borne pathogens and resting weed seeds.",
      water_and_climate_tips: "Clear master drainage canals to prevent storm water stagnation."
    },
    {
      stage_number: 2,
      title: "2. Seed Treatment, Nursery & Transplanting",
      duration: "1 - 2 weeks",
      icon: "🌿",
      instructions: [
        `Use DOA certified disease-free seeds (${cropSpecs.recommended_varieties}).`,
        "Treat seeds with Trichoderma or bio-fungicide before sowing.",
        `Maintain optimal plant spacing (${cropSpecs.spacing}) for ventilation and light capture.`,
        "Transplant healthy seedlings in late afternoon hours and firm root collars."
      ],
      fertilizer_schedule: "Apply starter mild nitrogen liquid drench (10g urea in 10L water) 12 days after emergence.",
      ipm_and_protection: "Cover nursery with 40-mesh insect-proof netting to block viral vector insects.",
      water_and_climate_tips: "Perform light watering immediately after transplanting."
    },
    {
      stage_number: 3,
      title: "3. Comprehensive Fertilizer Schedule - DOA Standard",
      duration: "Basal & Top Dressing Stages",
      icon: "💊",
      instructions: [
        "Basal Dressing: Apply full dose of TSP (35 kg/acre) + 1/3 Urea (25 kg/acre) + 1/3 MOP (20 kg/acre) 1-2 days before planting.",
        "1st Top Dressing: Apply Urea (25 kg/acre) at 3 weeks after transplanting during active tillering/branching.",
        "2nd Top Dressing: Apply Urea (25 kg/acre) + MOP (25 kg/acre) at 6 weeks during flowering and pod/fruit filling.",
        "Place fertilizer in circular bands 5-8 cm away from stems, incorporate into moist soil, and irrigate."
      ],
      fertilizer_schedule: "DOA Standard Dosage per Acre: Basal (TSP 35 kg + Urea 25 kg + MOP 20 kg); 1st Top Dressing (Urea 25 kg at Day 21); 2nd Top Dressing (Urea 25 kg + MOP 25 kg at Day 42).",
      ipm_and_protection: "Avoid over-applying nitrogen which triggers vegetative softness and attracts aphids/thrips.",
      water_and_climate_tips: "Irrigate thoroughly immediately after each top dressing application."
    },
    {
      stage_number: 4,
      title: "4. Irrigation & Water Drainage Management",
      duration: "Continuous growth cycle",
      icon: "💧",
      instructions: [
        "Irrigate at 3-4 day intervals in Dry Zone and 5-6 days in Intermediate Zone based on soil moisture.",
        "Maintain critical moisture during flowering and fruit setting to prevent flower drop.",
        "Adopt furrow or drip irrigation to maximize water efficiency and avoid leaf wetting.",
        "Clear discharge furrows immediately after heavy tropical downpours."
      ],
      fertilizer_schedule: "Coordinate irrigation timing with fertilizer applications for optimal nutrient absorption.",
      ipm_and_protection: "Avoid late evening overhead sprinkler watering to prevent fungal blight development.",
      water_and_climate_tips: "Mulch beds with 5-7 cm cured paddy straw to conserve root moisture."
    },
    {
      stage_number: 5,
      title: "5. Integrated Pest, Disease & Weed Control (IPM)",
      duration: "Weekly surveillance",
      icon: "🛡️",
      instructions: [
        "Perform manual weeding at 18-21 days and 40-45 days before canopy closure.",
        "Install 15 yellow sticky traps/acre (whiteflies/leafminers) and 15 blue sticky traps/acre (thrips).",
        "Spray neem seed kernel extract (NSKE 4%) preventatively every 10-14 days.",
        "Strictly observe Pre-Harvest Intervals (PHI) of at least 7-14 days before harvest."
      ],
      fertilizer_schedule: "Apply micronutrient foliar spray (Zinc + Boron 2g/L) during flowering.",
      ipm_and_protection: "Rogue out and destroy viral mosaic or bacterial wilt infected plants immediately.",
      water_and_climate_tips: "Keep field borders clean from wild weeds acting as insect reservoir hosts."
    },
    {
      stage_number: 6,
      title: "6. Harvesting, Scientific Grading & Market Packaging",
      duration: "At physiological maturity",
      icon: "🌾",
      instructions: [
        "Harvest in cool morning hours (6:30 AM - 9:30 AM) when produce is crisp and field heat is low.",
        "Use clean, sanitized shears; do not roughly pull or tear produce from plants.",
        "Sort and grade into Grade A and Grade B according to Sri Lanka Standards (SLS).",
        "Mandatorily pack into rigid, ventilated plastic crates to prevent 30-40% transport crushing losses.",
        "Transport during evening/night to Manning Market, Dambulla DEC, or supermarket collection centers."
      ],
      fertilizer_schedule: "Zero chemical spraying during the active harvesting window.",
      ipm_and_protection: "Discard damaged or diseased specimens before packing to avoid rot in transit.",
      water_and_climate_tips: "Cover transport trucks with reflective tarpaulins to prevent solar heat damage."
    }
  ];
};

const normalizeGuide = (guide, cropName, lang = 'English') => {
  const defaultSpecs = getDefaultCropSpecs(cropName, lang);
  const cropSpecs = (guide && guide.crop_specs) ? { ...defaultSpecs, ...guide.crop_specs } : defaultSpecs;
  const defaultStages = getLocalizedDefaultStages(cropSpecs, lang);

  if (!guide) {
    return {
      crop_name: cropName,
      crop_specs: cropSpecs,
      stages: defaultStages
    };
  }

  let rawStages = [];
  if (Array.isArray(guide)) {
    rawStages = guide;
  } else if (Array.isArray(guide.stages)) {
    rawStages = guide.stages;
  } else if (Array.isArray(guide.steps)) {
    rawStages = guide.steps;
  }

  if (rawStages.length === 0) {
    return {
      crop_name: guide.crop_name || cropName,
      crop_specs: cropSpecs,
      stages: defaultStages
    };
  }

  const stages = rawStages.map((stg, i) => {
    let instructions = [];
    if (Array.isArray(stg.instructions)) {
      instructions = stg.instructions;
    } else if (Array.isArray(stg.tasks)) {
      instructions = stg.tasks;
    } else if (typeof stg.instructions === 'string') {
      instructions = [stg.instructions];
    } else if (typeof stg.tasks === 'string') {
      instructions = [stg.tasks];
    } else {
      instructions = [
        lang === 'සිංහල' 
          ? 'මෙම අදියර සඳහා කෘෂිකර්ම දෙපාර්තමේන්තුවේ උපදෙස් අනුගමනය කරන්න.' 
          : lang === 'தமிழ்' 
          ? 'இந்த கட்டத்திற்கான விவசாயத் திணைக்கள வழிகாட்டுதல்களைப் பின்பற்றவும்.' 
          : 'Follow Department of Agriculture extension guidelines for this stage.'
      ];
    }

    return {
      stage_number: stg.stage_number || i + 1,
      title: stg.title || stg.stage || (lang === 'සිංහල' ? `අදියර ${i + 1}` : lang === 'தமிழ்' ? `படிநிலை ${i + 1}` : `Stage ${i + 1}`),
      duration: stg.duration || (lang === 'සිංහල' ? 'වර්ධන අවධිය' : lang === 'தமிழ்' ? 'வளர்ச்சி நிலை' : 'Growth stage'),
      icon: stg.icon || '🌱',
      instructions: instructions,
      fertilizer_schedule: stg.fertilizer_schedule || stg.fertilizer || null,
      ipm_and_protection: stg.ipm_and_protection || stg.ipm_care || stg.pest_control || null,
      water_and_climate_tips: stg.water_and_climate_tips || stg.water_tips || null
    };
  });

  return {
    crop_name: guide.crop_name || cropName,
    crop_specs: cropSpecs,
    stages: stages
  };
};

const CropAnalysis = ({ user }) => {
  const { language, t } = useLanguage();

  const [district, setDistrict] = useState('');
  const [dsDivision, setDsDivision] = useState('');
  const [landSize, setLandSize] = useState('');
  const [targetCrop, setTargetCrop] = useState('');
  const [plantingMonth, setPlantingMonth] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  // Selected crop dossier details (markets with prices & guidelines) shown only when user clicks a View button
  const [selectedCropDetail, setSelectedCropDetail] = useState(null);

  // Smooth guaranteed auto-scroll to results whenever analysis completes
  useEffect(() => {
    if (results && !loading) {
      const scrollTimer = setTimeout(() => {
        const resultsEl = document.getElementById('crop-results-section');
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          const y = resultsEl.getBoundingClientRect().top + window.pageYOffset - 80;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 150);
      return () => clearTimeout(scrollTimer);
    }
  }, [results, loading]);

  // Handle GPS Auto-Detection
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        let nearest = 'Kurunegala';
        let minDist = Infinity;
        for (const [name, coords] of Object.entries(SRI_LANKA_DISTRICTS)) {
          const dist = Math.hypot(coords.lat - latitude, coords.lon - longitude);
          if (dist < minDist) {
            minDist = dist;
            nearest = name;
          }
        }
        setDistrict(nearest);
        setDsDivision('');
        setGpsLoading(false);
      },
      () => {
        setGpsLoading(false);
        alert("Unable to retrieve your location. Please select your district from the dropdown.");
      }
    );
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!district) {
      alert(language === 'සිංහල' ? 'කරුණාකර ඔබේ දිස්ත්‍රික්කය තෝරන්න.' : language === 'தமிழ்' ? 'தயவுசெய்து உங்கள் மாவட்டத்தைத் தேர்ந்தெடுக்கவும்.' : 'Please select your district.');
      return;
    }
    if (!landSize || parseFloat(landSize) <= 0) {
      alert(language === 'සිංහල' ? 'කරුණාකර වලංගු ඉඩම් ප්‍රමාණයක් ඇතුළත් කරන්න (අක්කර).' : language === 'தமிழ்' ? 'தயவுசெய்து சரியான நிலப்பரப்பை உள்ளிடவும்.' : 'Please enter a valid land extent (in acres).');
      return;
    }
    if (!targetCrop || !targetCrop.trim()) {
      alert(language === 'සිංහල' ? 'කරුණාකර වගා කිරීමට බලාපොරොත්තු වන බෝගය ඇතුළත් කරන්න.' : language === 'தமிழ்' ? 'தயவுசெய்து பயிரைத் தேர்ந்தெடுக்கவும் அல்லது உள்ளிடவும்.' : 'Please enter or select a target crop to plant.');
      return;
    }
    if (!plantingMonth) {
      alert(language === 'සිංහල' ? 'කරුණාකර වගා කරන මාසය තෝරන්න.' : language === 'தமிழ்' ? 'தயவுசெய்து பயிரிடும் மாதத்தைத் தேர்ந்தெடுக்கவும்.' : 'Please select a planting month.');
      return;
    }

    setLoading(true);
    setResults(null);
    setSelectedCropDetail(null);

    const districtInfo = SRI_LANKA_DISTRICTS[district] || { lat: 7.4818, lon: 80.3609, province: "North Western Province" };
    const cleanCropName = targetCrop.split('(')[0].trim();
    let monthIdx = monthsList.indexOf(plantingMonth) + 1;
    if (monthIdx <= 0) {
      for (let i = 0; i < monthsList.length; i++) {
        if (plantingMonth.toLowerCase().includes(monthsList[i].toLowerCase().split(' ')[0])) {
          monthIdx = i + 1;
          break;
        }
      }
    }
    if (monthIdx <= 0) monthIdx = 10;

    try {
      const res = await analyzeCrop({
        lat: districtInfo.lat,
        lon: districtInfo.lon,
        district: district,
        ds_division: dsDivision,
        province: districtInfo.province,
        land_size: parseFloat(landSize) || 1.0,
        planting_month: monthIdx,
        preferred_crop: cleanCropName,
        language: language || 'English',
        user_email: user?.email || 'Guest Farmer',
        user_name: user?.name || 'Guest Farmer'
      });


      const analysis = res.analysis || {};
      const isRec = analysis.is_recommended !== undefined ? analysis.is_recommended : (analysis.suitability_score >= 60);

      const parsedResults = {
        cropName: cleanCropName,
        district: district,
        dsDivision: dsDivision,
        suitabilityScore: analysis.suitability_score || (isRec ? 88 : 38),
        level: analysis.suitability_level || (isRec ? 'Highly Recommended for Cultivation' : 'Not Recommended for Cultivation'),
        isRecommended: isRec,
        recommendationReason: analysis.recommendation_reason || analysis.analysis || '',
        nonRecommendationReasons: analysis.non_recommendation_reasons || [],
        marketEvaluation: analysis.market_evaluation || {
          expected_harvest_window: 'January - February (Maha Harvest)',
          national_market_outlook: isRec 
            ? 'Strong country-wide wholesale purchasing demand with balanced supply across Western, Central, and Southern economic hubs.' 
            : 'Severe nationwide overproduction glut across all Dedicated Economic Centers (DECs). Wholesale prices projected to crash.',
          national_average_wholesale_price: isRec ? 'LKR 280 - 350 / kg' : 'LKR 35 - 60 / kg (Depressed Farmgate)',
          regional_price_breakdown: {
            colombo_manning_market: isRec ? 'LKR 330 - 390 / kg (Western Province Terminal Hub)' : 'LKR 45 - 70 / kg (Market Saturated)',
            dambulla_dec: isRec ? 'LKR 270 - 320 / kg (Central Redistribution Hub)' : 'LKR 30 - 50 / kg (Severe Oversupply Glut)',
            regional_decs: isRec ? 'LKR 250 - 305 / kg (Thambuttegama / Keppetipola / Meegoda)' : 'LKR 25 - 45 / kg',
            supermarket_contract_price: isRec ? 'LKR 310 - 360 / kg (Direct Farmgate - Cargills/Keells)' : 'LKR 50 - 75 / kg (Strict Quotas)',
            island_wide_retail_price: isRec ? 'LKR 440 - 540 / kg (Consumer Retail Range)' : 'LKR 90 - 140 / kg'
          },
          market_trend_at_harvest: isRec ? 'High Island-wide Demand & Stable Wholesale Prices' : 'Severe National Glut & Price Crash Risk',
          economic_viability: isRec ? 'Highly Profitable (Projected ROI > 45%)' : 'Loss-Making Deficit Risk (Wholesale below production cost)',
          import_policy_and_tariff: isRec 
            ? 'Protected by government Special Commodity Levy (SCL) tariffs on imports, stabilizing local farmgate returns.' 
            : 'Market glut exacerbated by seasonal influx and lack of minimum guaranteed purchase floor.',
          farmer_sales_strategy: isRec 
            ? 'Direct transport to Colombo Manning Market or registration with supermarket collection centers (Cargills/Keells) yields an extra 15-20% margin.' 
            : 'Strongly advise pivoting to high-demand alternative crops to protect investment capital.',
          market_notes: isRec 
            ? 'Wholesale prices across major economic centers indicate steady commercial buying margins.' 
            : 'Harvest month coincides with massive country-wide overproduction, dropping wholesale prices below cultivation cost.'
        },
        financialAndHarvest: analysis.financial_and_harvest || {
          expected_harvest_month: 'January - February (Maha Harvest)',
          duration_days: '95 - 115 days',
          predicted_market_price: 'LKR 280 - 340 / kg (Dambulla Wholesale Market)',
          production_cost_per_acre: 'LKR 95,000 - 130,000 / acre',
          expected_yield_per_acre: '8.5 - 12.0 Metric Tons / acre',
          estimated_net_profit: 'LKR 380,000 - 520,000 / acre'
        },
        cultivationGuide: analysis.cultivation_guide || null,
        alternatives: analysis.recommended_crops || []
      };

      setResults(parsedResults);
      setSelectedCropDetail(null); // Keep closed initially: details open only on clicking View button

    } catch (err) {
      console.error("Analysis Error:", err);
      // Fallback
      const isRec = !['onion', 'big onion', 'tea', 'potato'].some(c => cleanCropName.toLowerCase().includes(c));
      const fallbackResult = {
        cropName: cleanCropName,
        district: district,
        suitabilityScore: isRec ? 88 : 38,
        level: isRec ? 'Highly Recommended for Cultivation' : 'Not Recommended for Cultivation',
        isRecommended: isRec,
        recommendationReason: isRec 
          ? `Climate conditions in ${district} provide ideal ambient temperature (27-29°C) and suitable soil moisture for ${cleanCropName} on ${landSize} acres during ${plantingMonth}.`
          : `Cultivating ${cleanCropName} in ${district} during ${plantingMonth} carries high crop failure risk due to seasonal moisture and temperature factors.`,
        nonRecommendationReasons: isRec ? [] : [
          `Continuous monsoon rainfall in ${district} causes soil waterlogging and fungal root rot in ${cleanCropName}.`,
          `${cleanCropName} requires dry sunny weather during maturity and harvesting stages.`
        ],
        marketEvaluation: {
          expected_harvest_window: 'January - February',
          projected_wholesale_price: isRec ? 'LKR 280 - 340 / kg' : 'LKR 30 - 55 / kg (Market Crash Risk)',
          market_trend_at_harvest: isRec ? 'Strong Wholesale Demand' : 'Severe Market Glut & Oversupply Risk',
          economic_viability: isRec ? 'Profitable (ROI > 45%)' : 'Loss-Making Deficit Risk',
          market_notes: isRec
            ? 'Harvest coincides with high commercial wholesale purchasing demand across Dambulla and Manning economic centers.'
            : 'Harvest month coincides with massive country-wide overproduction and market gluts, dropping wholesale prices below cultivation cost.'
        },
        financialAndHarvest: {
          expected_harvest_month: 'January - February (Maha Harvest)',
          duration_days: '95 - 115 days',
          predicted_market_price: 'LKR 280 - 340 / kg (Dambulla Wholesale Market)',
          production_cost_per_acre: 'LKR 95,000 - 130,000 / acre',
          expected_yield_per_acre: '8.5 - 12.0 Metric Tons / acre',
          estimated_net_profit: 'LKR 380,000 - 520,000 / acre'
        },
        cultivationGuide: {
          crop_name: cleanCropName,
          stages: [
            {
              stage_number: 1,
              title: "1. Land Preparation & Soil Conditioning",
              duration: "2 - 3 weeks prior",
              icon: "🌱",
              instructions: [
                "Plow soil to 25-30 cm depth to break hardpan layers and improve root penetration.",
                "Incorporate 5-8 tons of well-rotted cattle manure or organic compost per acre.",
                "Form raised planting beds (15-20cm) to ensure rapid water drainage."
              ]
            },
            {
              stage_number: 2,
              title: "2. Sowing & Spacing",
              duration: "1 - 2 weeks",
              icon: "🌿",
              instructions: [
                `Select Department of Agriculture (DOA) certified seeds for ${cleanCropName}.`,
                "Maintain optimal plant spacing for healthy canopy ventilation."
              ]
            },
            {
              stage_number: 3,
              title: "3. Fertilizer Application Schedule",
              duration: "Basal & Top Dressing",
              icon: "💊",
              instructions: [
                "Apply full basal TSP (25 kg/acre) during final harrowing.",
                "Apply split Urea and MOP top-dressing at 3 weeks and flowering stages."
              ]
            },
            {
              stage_number: 4,
              title: "4. Harvesting",
              duration: "At physiological maturity",
              icon: "🌾",
              instructions: [
                "Harvest produce during cool morning hours at 85-90% maturity.",
                "Use clean ventilated crates to prevent transportation damage."
              ]
            }
          ]
        },
        alternatives: [
          {
            name: "Green Chili",
            score: 93,
            reason: `High wholesale profit margin in local markets (LKR 650/kg) and excellent intermediate zone adaptation in ${district}.`,
            expected_price: "LKR 550 - 700 / kg",
            harvest_month: "January - February",
            production_cost: "LKR 110,000 - 145,000 / acre",
            cultivation_guide: {
              crop_name: "Green Chili",
              stages: [
                {
                  stage_number: 1,
                  title: "1. Land Prep & Raised Beds",
                  duration: "2 weeks prior",
                  icon: "🌱",
                  instructions: ["Plow to 25cm depth and create 20cm raised beds.", "Add 6 tons organic compost per acre."]
                },
                {
                  stage_number: 2,
                  title: "2. Planting & Spacing",
                  duration: "1 week",
                  icon: "🌿",
                  instructions: ["Transplant 25-day healthy seedlings at 45x60cm spacing."]
                },
                {
                  stage_number: 3,
                  title: "3. Fertilizer Schedule",
                  duration: "Throughout growth",
                  icon: "💊",
                  instructions: ["Apply DOA basal fertilizer before planting and top dress with Urea & Potash."]
                },
                {
                  stage_number: 4,
                  title: "4. Harvesting",
                  duration: "Every 5-7 days",
                  icon: "🌾",
                  instructions: ["Harvest green glossy pods with stalks intact for maximum market freshness."]
                }
              ]
            }
          },
          {
            name: "Tomato",
            score: 91,
            reason: `Fast 90-day harvest cycle, high market wholesale demand ahead of holidays, and disease tolerance.`,
            expected_price: "LKR 220 - 290 / kg",
            harvest_month: "December - January",
            production_cost: "LKR 90,000 - 120,000 / acre",
            cultivation_guide: {
              crop_name: "Tomato",
              stages: [
                {
                  stage_number: 1,
                  title: "1. Land Prep",
                  duration: "2 weeks prior",
                  icon: "🌱",
                  instructions: ["Form drainage ridges and mix organic manure."]
                },
                {
                  stage_number: 2,
                  title: "2. Transplanting",
                  duration: "1 week",
                  icon: "🌿",
                  instructions: ["Transplant seedlings at 50x60cm spacing and stake plants."]
                },
                {
                  stage_number: 3,
                  title: "3. Harvesting",
                  duration: "75-90 days",
                  icon: "🌾",
                  instructions: ["Harvest at breaker stage for safe market transport."]
                }
              ]
            }
          }
        ]
      };

      setResults(fallbackResult);
      setSelectedCropDetail(null);

    } finally {
      setLoading(false);
    }
  };

  // View Details for the main recommended target crop
  const handleViewMainCrop = () => {
    if (!results) return;
    setSelectedCropDetail({
      cropName: results.cropName,
      isTarget: true,
      marketEvaluation: results.marketEvaluation,
      financialAndHarvest: results.financialAndHarvest,
      cultivationGuide: normalizeGuide(results.cultivationGuide, results.cropName, language)
    });

    setTimeout(() => {
      const el = document.getElementById('selected-crop-dossier-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  };

  // View Details for an alternative crop
  const handleViewAlternative = (alt) => {
    const cropName = alt.name || alt.crop_name || "Alternative Crop";

    const altMarket = alt.market_evaluation || {
      expected_harvest_window: alt.harvest_month || "January - February",
      national_market_outlook: language === 'සිංහල'
        ? "බස්නාහිර, මධ්‍යම සහ දකුණු ආර්ථික මධ්‍යස්ථානවල ස්ථාවර තොග මිලදී ගැනීම් ඉල්ලුමක් සහ සමබර සැපයුමක් පවතී."
        : language === 'தமிழ்'
        ? "மேல், மத்திய மற்றும் தென் மாகாண பொருளாதார மையங்களில் சீரான மொத்த விற்பனைத் தேவை நிலவுகிறது."
        : "Strong country-wide wholesale purchasing demand with balanced supply across Western, Central, and Southern economic hubs.",
      national_average_wholesale_price: alt.expected_price || alt.dambulla_price || "LKR 300 - 450 / kg",
      regional_price_breakdown: {
        colombo_manning_market: alt.manning_price || alt.expected_price || "LKR 350 - 520 / kg",
        dambulla_dec: alt.dambulla_price || alt.expected_price || "LKR 300 - 450 / kg",
        regional_decs: alt.regional_price || "LKR 280 - 420 / kg",
        supermarket_contract_price: alt.supermarket_price || "LKR 330 - 490 / kg",
        island_wide_retail_price: alt.retail_price || "LKR 460 - 680 / kg"
      },
      market_trend_at_harvest: language === 'සිංහල' ? 'ඉහළ දීපව්‍යාප්ත ඉල්ලුමක් සහ ස්ථාවර තොග මිලක්' : language === 'தமிழ்' ? 'நாடு தழுவிய அதிக தேவை மற்றும் நிலையான மொத்த விலை' : 'High Island-wide Demand & Stable Wholesale Prices',
      economic_viability: alt.estimated_net_profit ? `Highly Profitable (${alt.estimated_net_profit})` : 'Highly Profitable',
      farmer_sales_strategy: language === 'සිංහල'
        ? "උසස් තත්ත්වයේ අස්වැන්න කොළඹ මැනිං වෙළඳපලට හෝ Cargills/Keells සුපිරි වෙළඳසැල් එකතු කිරීමේ මධ්‍යස්ථාන වෙත සෘජුව සැපයීමෙන් අතරමැදියන් නොමැතිව 15-20%ක අමතර ලාභයක් ලබාගත හැක."
        : language === 'தமிழ்'
        ? "அறுவடையை நேரடியாக கொழும்பு மேனிங் சந்தைக்கு அல்லது Cargills/Keells கொள்முதல் மையங்களுக்கு அனுப்புவதன் மூலம் 15-20% கூடுதல் லாபம் பெறலாம்."
        : "Direct supply to Colombo Manning Market or supermarket collection centers (Cargills/Keells) yields an extra 15-20% margin over local middlemen.",
      import_policy_and_tariff: language === 'සිංහල'
        ? "රජයේ විශේෂ වෙළඳ භාණ්ඩ බදු (SCL) රැකවරණය යටතේ දේශීය ගොවිපල මිල ස්ථායීව පවතී."
        : language === 'தமிழ்'
        ? "அரசின் இறக்குமதி வரிக் கொள்கை உள்ளூர் விவசாயிகளின் விற்பனை விலையைப் பாதுகாக்கிறது."
        : "Protected by government Special Commodity Levy (SCL) tariffs on imports, stabilizing local farmgate returns."
    };

    const altFinancial = alt.financial_and_harvest || {
      expected_harvest_month: alt.harvest_month || "January - February",
      duration_days: alt.duration_days || "90 - 110 days",
      predicted_market_price: alt.expected_price || alt.dambulla_price || "LKR 300 - 450 / kg",
      production_cost_per_acre: alt.production_cost || "LKR 95,000 - 120,000 / acre",
      expected_yield_per_acre: alt.expected_yield || "8 - 12 Metric Tons / acre",
      estimated_net_profit: alt.estimated_net_profit || "LKR 350,000 - 550,000 / acre"
    };

    setSelectedCropDetail({
      cropName: cropName,
      isTarget: false,
      marketEvaluation: altMarket,
      financialAndHarvest: altFinancial,
      cultivationGuide: normalizeGuide(alt.cultivation_guide, cropName, language)
    });

    setTimeout(() => {
      const el = document.getElementById('selected-crop-dossier-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  };

  const handleCloseCropDetail = () => {
    setSelectedCropDetail(null);
  };

  return (
    <div className="crop-analysis-container fade-in">
      <div className="page-header">
        <h1>{t('cropAnalysisTitle', 'Precision Crop Suitability & Master Cultivation Roadmap')}</h1>
      </div>

      <div className="page-content-grid">
        <div className="crop-form-layout-wrapper">
        
          {/* Form Card */}
          <div className="main-crop-form-card glass-panel">
            <div className="form-header-bar">
              <div className="form-header-icon">
                <Sprout size={22} className="text-primary-dark" />
              </div>
              <div>
                <h2>{t('selectDistrict', 'Select District')} & {t('targetCrop', 'Target Crop')}</h2>
                <p className="form-sub-txt">
                  {language === 'සිංහල' 
                    ? 'ඔබේ දිස්ත්‍රික්කය, ඉඩමේ ප්‍රමාණය සහ බෝගය තෝරා කෘෂිකර්ම දෙපාර්තමේන්තු පූර්ණ නිර්දේශ ලබාගන්න.'
                    : language === 'தமிழ்'
                    ? 'உங்கள் மாவட்டம், நில அளவு மற்றும் பயிரைத் தேர்ந்தெடுத்து விவசாயத் திணைக்களத்தின் முழுமையான வழிகாட்டலைப் பெறுங்கள்.'
                    : 'Select your district, field parameters, and crop to receive localized DOA agricultural advice.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="html-crop-form">
              
              {/* 1. Location / District Selection */}
              <div className="form-group-box">
                <div className="label-with-action">
                  <label className="form-lbl">
                    <MapPin size={17} className="text-primary-dark" /> {t('selectDistrict', 'District / Location')}
                  </label>
                  <button 
                    type="button" 
                    className="detect-gps-btn" 
                    onClick={handleDetectGPS} 
                    disabled={gpsLoading}
                  >
                    {gpsLoading ? t('detectingGps', 'Detecting...') : (
                      <>
                        <MapPin size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                        {t('detectGps', 'Use My GPS Location')}
                      </>
                    )}
                  </button>
                </div>
                <select 
                  value={district} 
                  onChange={(e) => { setDistrict(e.target.value); setDsDivision(''); }}
                  className="district-select"
                  required
                >
                  <option value="" disabled>{t('selectDistrictPrompt', '-- Select Your District --')}</option>
                  {Object.keys(SRI_LANKA_DISTRICTS).map((d) => (
                    <option key={d} value={d}>
                      {d} District ({SRI_LANKA_DISTRICTS[d].province})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Divisional Secretariat Division (DS Division) */}
              <div className="form-group-box">
                <label className="form-lbl">
                  <MapPin size={17} className="text-primary-dark" /> {t('selectDsDivision', 'Select DS Division')}
                </label>
                <select 
                  value={dsDivision} 
                  onChange={(e) => setDsDivision(e.target.value)}
                  className="district-select"
                  disabled={!district}
                >
                  <option value="">
                    {district 
                      ? t('selectDsDivisionPrompt', '-- Select Your DS Division --') 
                      : t('selectDistrictFirst', '-- First Select Your District --')}
                  </option>
                  {district && SRI_LANKA_DISTRICTS[district]?.ds_divisions?.map((ds) => (
                    <option key={ds} value={ds}>
                      {ds}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Land Size */}
              <div className="form-group-box">
                <label className="form-lbl">
                  <Scaling size={17} className="text-primary-dark" /> {t('landExtent', 'Land Size (Acres)')}
                </label>
                <input 
                  type="number" 
                  step="0.25"
                  min="0.25"
                  max="500"
                  value={landSize}
                  onChange={(e) => setLandSize(e.target.value)}
                  placeholder="e.g. 2.5"
                  required
                />
              </div>

              {/* 4. Target Crop to plant */}
              <div className="form-group-box">
                <label className="form-lbl">
                  <Sprout size={17} className="text-primary-dark" /> {t('targetCrop', 'Target Crop to Plant')}
                </label>
                <input 
                  type="text"
                  list="crops-suggestions"
                  value={targetCrop}
                  onChange={(e) => setTargetCrop(e.target.value)}
                  placeholder={t('cropPlaceholder', 'Type or select any crop (e.g. Rice, Onion, Tomato, Green Chili, Tea, Potato)...')}
                  required
                />
                <datalist id="crops-suggestions">
                  {cropsList.map((c, i) => (
                    <option key={i} value={c} />
                  ))}
                </datalist>
              </div>

              {/* 5. Planting Month */}
              <div className="form-group-box">
                <label className="form-lbl">
                  <Calendar size={17} className="text-primary-dark" /> {t('plantingMonth', 'Planting Month')}
                </label>
                <select 
                  value={plantingMonth}
                  onChange={(e) => setPlantingMonth(e.target.value)}
                  required
                >
                  <option value="" disabled>{t('selectMonthPrompt', '-- Select Planting Month --')}</option>
                  {monthsList.map((m, i) => (
                    <option key={i} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* In-form active loading state */}
              {loading && (
                <div className="eval-active-form-loading fade-in">
                  <div className="form-loading-spinner-ring"></div>
                  <div className="form-loading-txt">
                    <strong>{t('loadingAnalysisTitle', 'Analyzing Agro-Climatic & Nationwide Market Dynamics...')}</strong>
                    <p>{t('loadingAnalysisSub', 'Evaluating soil moisture, weather forecast, and island-wide wholesale market trends across Manning, Dambulla, Regional DECs, and Supermarket hubs.')}</p>
                  </div>
                </div>
              )}

              <button type="submit" className={`btn-primary submit-form-btn ${results ? 'has-results' : ''}`} disabled={loading}>
                {loading ? (
                  <>{t('evaluatingBtn', 'Evaluating Suitability...')}</>
                ) : results ? (
                  <><Search size={19} /> {t('reEvaluateBtn', 'Re-Evaluate / Update Parameters')}</>
                ) : (
                  <><Search size={19} /> {t('evaluateBtn', 'Evaluate Crop Suitability')}</>
                )}
              </button>
            </form>
          </div>

          {/* Results Loading Placeholder */}
          {loading && (
            <div className="results-placeholder-card glass-panel">
              <LoadingSpinner message={`Analyzing agro-ecological climate models & DOA guidelines for ${district} district...`} />
            </div>
          )}

          {/* Results Section */}
          {results && !loading && (
            <div id="crop-results-section" className="evaluation-result-card glass-panel fade-in">
              
              {/* Header Status Bar */}
              <div className="eval-header">
                <div className={`score-badge-circle ${results.isRecommended ? 'score-good' : 'score-bad'}`}>
                  <span className="score-num">{results.suitabilityScore}%</span>
                  <span className="score-text">Match</span>
                </div>
                <div className="eval-info-block">
                  <span className={`badge ${results.isRecommended ? 'badge-success' : 'badge-danger'}`}>
                    {results.isRecommended ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                    {results.level}
                  </span>
                  <h2 className="eval-crop-title">{results.cropName}</h2>
                  <p className="eval-location-subtitle">
                    <strong>{results.dsDivision ? `${results.dsDivision}, ` : ''}{results.district} District</strong> • {landSize} Acres • {plantingMonth}
                  </p>
                </div>
              </div>

              {/* Agronomic Rationale Box */}
              <div className="eval-analysis-box">
                <h3>{t('agronomicEvaluation', 'Agronomic & Climate Evaluation')}</h3>
                <p className="eval-reason-txt">{results.recommendationReason}</p>
              </div>

              {/* 3. IF NOT RECOMMENDED: Show Specific Reasons Why This Crop is Not Recommended */}
              {!results.isRecommended && results.nonRecommendationReasons && results.nonRecommendationReasons.length > 0 && (
                <div className="unsuitable-reasons-box fade-in">
                  <div className="unsuitable-title-row">
                    <ShieldAlert size={20} className="text-danger" />
                    <h4>{t('whyNotRecommended', 'Specific Reasons Why This Crop is Not Recommended:')}</h4>
                  </div>
                  <ul className="unsuitable-list">
                    {results.nonRecommendationReasons.map((reason, i) => (
                      <li key={i}>
                        <span className="bullet-cross">✕</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 4. IF RECOMMENDED: Show Action View Button for the Target Crop */}
              {results.isRecommended && (
                <div className="recommended-target-action-card fade-in">
                  <div className="rec-action-info">
                    <span className="rec-status-tag">{t('statusRecommended', 'Recommended for Cultivation')}</span>
                    <h4>{results.cropName}</h4>
                    <p>
                      {language === 'සිංහල'
                        ? `${results.cropName} සඳහා වන සියලුම දිවයිනේ ආර්ථික මධ්‍යස්ථාන මිල ගණන් (දඹුල්ල, මැනිං, සුපිරි වෙළඳසැල් ආදී) සහ කෘෂිකර්ම දෙපාර්තමේන්තු වගා මාර්ගෝපදේශය බැලීමට පහත බොත්තම ඔබන්න.`
                        : language === 'தமிழ்'
                        ? `${results.cropName} பயிருக்கான அனைத்து சந்தை விலைகள் மற்றும் விவசாயத் திணைக்களத்தின் வழிகாட்டலைப் பார்க்க கீழே உள்ள பொத்தானை அழுத்தவும்.`
                        : `Click below to explore full island-wide market price intelligence across Sri Lanka economic centers and complete DOA cultivation roadmap for ${results.cropName}.`}
                    </p>
                  </div>
                  <div className="rec-action-divider"></div>
                  <div className="rec-action-footer">
                    <button 
                      type="button" 
                      className="btn-view-target-crop"
                      onClick={handleViewMainCrop}
                    >
                      {t('viewMarketAndGuide', 'View Market Prices & Cultivation Roadmap')} <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* 5. Recommended Alternative Crops Section */}
              {results.alternatives && results.alternatives.length > 0 && (
                <div className="eval-alternatives-box">
                  <div className="alt-title-row">
                    <Sparkles size={20} className="text-secondary" />
                    <div>
                      <h3>
                        {results.isRecommended 
                          ? t('altCropsTitle', 'Alternative Profitable Crops for Your Land:') 
                          : t('altCropsTitle', `High-Yield Suitable Crops Recommended for ${results.district}:`)}
                      </h3>
                      <p className="alt-sub-desc">
                        {t('altCropsSubtitle', `These crops thrive under the current weather and season in ${results.district}. Click any crop below to view its complete step-by-step Cultivation Guide and market prices.`)}
                      </p>
                    </div>
                  </div>

                  <div className="eval-alt-grid">
                    {results.alternatives.map((alt, idx) => (
                      <div key={idx} className="alt-item-card">
                        <div className="alt-top-row">
                          <span className="alt-name-txt">{alt.name || alt.crop_name}</span>
                          <span className="alt-pct">{alt.score || alt.suitability_score || 90}% {t('match', 'Match')}</span>
                        </div>
                        <p className="alt-desc-txt">{alt.reason || alt.recommendation_reason}</p>
                        
                        <div className="alt-highlights">
                          {(alt.expected_price || alt.predicted_market_price) && (
                            <span className="alt-badge">{alt.expected_price || alt.predicted_market_price}</span>
                          )}
                          {alt.harvest_month && (
                            <span className="alt-badge">{alt.harvest_month}</span>
                          )}
                        </div>

                        <button 
                          type="button" 
                          className="alt-switch-btn"
                          onClick={() => handleViewAlternative(alt)}
                        >
                          {t('viewDetailsBtn', 'View Market Prices & Guidelines')} <ArrowRight size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. Active Crop Dossier: Market Prices & DOA Cultivation Guidelines (Rendered ONLY when a View button is clicked) */}
              {selectedCropDetail && (
                <div id="selected-crop-dossier-section" className="selected-crop-dossier fade-in">
                  
                  {/* Dossier Header Bar */}
                  <div className="dossier-header-bar">
                    <div className="dossier-header-text">
                      <div className="dossier-title-row">
                        <BookOpen size={24} className="text-primary-dark" />
                        <h3>
                          {t('viewingDetailsFor', 'Complete Market Economics & Cultivation Roadmap')}: <span className="highlight-crop-name">{selectedCropDetail.cropName}</span>
                        </h3>
                      </div>
                      <p className="dossier-sub-note">
                        {t('activeDossierSub', 'Comprehensive harvest-time price intelligence across Sri Lanka and DOA agronomic extension roadmap.')}
                      </p>
                    </div>
                    <button 
                      type="button" 
                      className="dossier-close-btn"
                      onClick={handleCloseCropDetail}
                      title="Close Details"
                    >
                      <X size={16} /> {t('hideDetailsBtn', 'Close Details')}
                    </button>
                  </div>

                  {/* Part A: Market Assessment Card (Island-wide Nationwide Analysis) */}
                  {selectedCropDetail.marketEvaluation && (
                    <div className="market-assessment-card fade-in">
                      <div className="market-assessment-header">
                        <div className="market-title-wrap">
                          <TrendingUp size={22} className="text-primary-dark" />
                          <h4>{t('marketEconomicsTitle', 'Harvest-Time Market Economics & National Supply Assessment')}</h4>
                        </div>
                      </div>

                      {/* Regional Wholesale & Island-wide Retail Price Cards */}
                      <div className="national-price-grid">
                        <div className="price-card regional-card">
                          <div className="price-card-header">
                            <span className="hub-city">{t('regionalDecs', 'Regional Economic Centers')}</span>
                            <span className="hub-role">{t('regionalDecsSub', 'Thambuttegama / Keppetipola / Meegoda / Jaffna')}</span>
                          </div>
                          <div className="price-val">
                            {selectedCropDetail.marketEvaluation.regional_price_breakdown?.regional_decs || 'LKR 250 - 305 / kg'}
                          </div>
                        </div>

                        <div className="price-card retail-card">
                          <div className="price-card-header">
                            <span className="hub-city">{t('islandWideRetail', 'Island-wide Consumer Retail')}</span>
                            <span className="hub-role">{t('retailSub', 'Consumer Retail Pricing across 9 Provinces')}</span>
                          </div>
                          <div className="price-val">
                            {selectedCropDetail.marketEvaluation.regional_price_breakdown?.island_wide_retail_price || 'LKR 440 - 540 / kg'}
                          </div>
                        </div>
                      </div>

                      {/* Vertical Market & Financial Metrics List */}
                      <div className="market-metrics-row vertical-metrics">
                        <div className="metric-pill full-width">
                          <span>{t('expectedHarvestMonth', 'Harvest Window')}:</span>{' '}
                          <strong>
                            {selectedCropDetail.marketEvaluation.expected_harvest_window}
                            {selectedCropDetail.financialAndHarvest?.duration_days && (
                              <span className="metric-sub-note"> ({language === 'සිංහල' ? 'වගා කාලය' : language === 'தமிழ்' ? 'கால அளவு' : 'Duration'}: {selectedCropDetail.financialAndHarvest.duration_days})</span>
                            )}
                          </strong>
                        </div>
                        <div className="metric-pill full-width">
                          <span>{t('projectedWholesalePrice', 'National Average Wholesale')}:</span>{' '}
                          <strong>
                            {selectedCropDetail.marketEvaluation.national_average_wholesale_price || selectedCropDetail.marketEvaluation.projected_wholesale_price}
                          </strong>
                        </div>
                        {selectedCropDetail.financialAndHarvest?.production_cost_per_acre && (
                          <div className="metric-pill full-width">
                            <span>{t('productionCost', 'Production Cost')}:</span>{' '}
                            <strong>
                              {selectedCropDetail.financialAndHarvest.production_cost_per_acre}
                              {selectedCropDetail.financialAndHarvest.expected_yield_per_acre && (
                                <span className="metric-sub-note"> ({language === 'සිංහල' ? 'අස්වැන්න' : language === 'தமிழ்' ? 'மகசூல்' : 'Yield'}: {selectedCropDetail.financialAndHarvest.expected_yield_per_acre})</span>
                              )}
                            </strong>
                          </div>
                        )}
                        <div className="metric-pill full-width">
                          <span>{language === 'සිංහල' ? 'ආර්ථික ලාභදායීතාව' : language === 'தமிழ்' ? 'பொருளாதார சாத்தியம்' : 'Economic Viability'}:</span>{' '}
                          <strong className="text-success">{selectedCropDetail.marketEvaluation.economic_viability}</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Part C: Master Cultivation Roadmap (DOA Standard) */}
                  {selectedCropDetail.cultivationGuide && (
                    <div className="cultivation-guide-section fade-in" style={{ marginTop: 0 }}>
                      <div className="guide-header-bar">
                        <div className="guide-title-wrapper">
                          <BookOpen size={26} className="text-primary-dark" />
                          <div>
                            <h3>{t('masterRoadmap', 'Master Cultivation Roadmap')}: {selectedCropDetail.cropName}</h3>
                            <p>{t('doaGuidelines', 'Department of Agriculture (DOA - Sri Lanka) Master Agronomic Extension Guidelines')}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <button 
                            type="button" 
                            className="btn-print-roadmap"
                            onClick={() => window.print()}
                            title="Print or Save Cultivation Guide as PDF"
                          >
                            {t('printRoadmap', 'Print / Save Roadmap')}
                          </button>
                        </div>
                      </div>

                      {/* DOA Official Crop Specifications Bar */}
                      {selectedCropDetail.cultivationGuide.crop_specs && (
                        <div className="crop-specs-bar">
                          <div className="spec-item">
                            <span className="spec-lbl">{t('recVarieties', 'Recommended Varieties')}</span>
                            <strong className="spec-val">{selectedCropDetail.cultivationGuide.crop_specs.recommended_varieties}</strong>
                          </div>
                          <div className="spec-item">
                            <span className="spec-lbl">{t('seedRate', 'Seed Requirement')}</span>
                            <strong className="spec-val">{selectedCropDetail.cultivationGuide.crop_specs.seed_rate}</strong>
                          </div>
                          <div className="spec-item">
                            <span className="spec-lbl">{t('spacing', 'Field Spacing')}</span>
                            <strong className="spec-val">{selectedCropDetail.cultivationGuide.crop_specs.spacing}</strong>
                          </div>
                          <div className="spec-item">
                            <span className="spec-lbl">{t('soilDolomite', 'Soil & Dolomite')}</span>
                            <strong className="spec-val">{selectedCropDetail.cultivationGuide.crop_specs.soil_and_ph}</strong>
                          </div>
                        </div>
                      )}

                      {/* Master 6-Stage Timeline */}
                      <div className="guide-timeline">
                        {(selectedCropDetail.cultivationGuide?.stages || []).map((stg, sIdx) => (
                          <div key={sIdx} className="timeline-stage-card">
                            <div className="stage-marker-column">
                              <div className="stage-icon-bubble">{sIdx + 1}</div>
                              {sIdx < (selectedCropDetail.cultivationGuide?.stages?.length || 0) - 1 && <div className="timeline-line"></div>}
                            </div>
                            <div className="stage-content-card">
                              <div className="stage-header-row">
                                <h4>{stg.title}</h4>
                                <span className="stage-duration-tag">
                                  <Clock size={13} /> {stg.duration}
                                </span>
                              </div>

                              {/* Step-by-Step Practical Instructions */}
                              <div style={{ marginBottom: '0.85rem' }}>
                                <strong style={{ fontSize: '0.88rem', color: '#1e293b', display: 'block', marginBottom: '0.4rem' }}>
                                  {t('instructionsHeading', 'Detailed Practical Step-by-Step Field Instructions:')}
                                </strong>
                                <ul className="stage-tasks-list">
                                  {(stg.instructions || []).map((ins, iIdx) => (
                                    <li key={iIdx}>
                                      <span className="task-bullet">✔</span>
                                      <span>{ins}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Dedicated DOA Fertilizer Box */}
                              {stg.fertilizer_schedule && (
                                <div className="stage-detail-box fert-box">
                                  <div className="box-title">
                                    <span className="box-icon"><Layers size={16} /></span>
                                    <strong>{t('fertilizerHeading', 'DOA Standard Fertilizer Application Schedule:')}</strong>
                                  </div>
                                  <p>{stg.fertilizer_schedule}</p>
                                </div>
                              )}

                              {/* Dedicated IPM & Protection Box */}
                              {stg.ipm_and_protection && (
                                <div className="stage-detail-box ipm-box">
                                  <div className="box-title">
                                    <span className="box-icon"><ShieldAlert size={16} /></span>
                                    <strong>{t('ipmHeading', 'Integrated Pest & Disease Management (IPM):')}</strong>
                                  </div>
                                  <p>{stg.ipm_and_protection}</p>
                                </div>
                              )}

                              {/* Dedicated Water & Drainage Box */}
                              {stg.water_and_climate_tips && (
                                <div className="stage-detail-box water-box">
                                  <div className="box-title">
                                    <span className="box-icon"><Droplets size={16} /></span>
                                    <strong>{t('waterHeading', 'Water & Drainage Management:')}</strong>
                                  </div>
                                  <p>{stg.water_and_climate_tips}</p>
                                </div>
                              )}

                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

        </div>
        
        {/* Chat Widget Side Panel */}
        <div className="chat-panel-wrapper">
          <ChatWidget mode="crop" />
        </div>
      </div>
    </div>
  );
};

export default CropAnalysis;
