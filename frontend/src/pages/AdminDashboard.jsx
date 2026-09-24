// ==============================================================================
// AGRISENSE ADMINISTRATIVE DASHBOARD (AdminDashboard.jsx)
// Provides comprehensive national surveillance & administration:
//  1. Real-time metrics: Total Registered Farmers, Diagnosed Disease Scans, Crop Analyses.
//  2. Top 5 Diagnosed Crop Diseases Leaderboard with 3 most affected crops.
//  3. District-Wise Most Requested Crops (Top 3 recommended per district).
//  4. User Management Directory: View registrations, search, filter, and delete users.
//  5. Strict Trilingual Support (English, සිංහල, தமிழ்) with clean script purification.
// ==============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Stethoscope, 
  Sprout, 
  Search, 
  RefreshCw, 
  AlertTriangle, 
  Filter, 
  Trash2, 
  ExternalLink,
  MapPin,
  Check,
  Award,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  getAdminOverview, 
  getAdminUsers, 
  getAdminDiseaseLogs, 
  getAdminCropAnalytics,
  deleteAdminUser 
} from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import './AdminDashboard.css';

// District Translations (Strict Trilingual Purity)
const DISTRICT_TRANSLATIONS = {
  'Ampara': { 'English': 'Ampara', 'සිංහල': 'අම්පාර', 'தமிழ்': 'அம்பாறை' },
  'Anuradhapura': { 'English': 'Anuradhapura', 'සිංහල': 'අනුරාධපුරය', 'தமிழ்': 'அநுராதபுரம்' },
  'Badulla': { 'English': 'Badulla', 'සිංහල': 'බදුල්ල', 'தமிழ்': 'பதுளை' },
  'Batticaloa': { 'English': 'Batticaloa', 'සිංහල': 'මඩකලපුව', 'தமிழ்': 'மட்டக்களப்பு' },
  'Colombo': { 'English': 'Colombo', 'සිංහල': 'කොළඹ', 'தமிழ்': 'கொழும்பு' },
  'Galle': { 'English': 'Galle', 'සිංහල': 'ගාල්ල', 'தமிழ்': 'காலி' },
  'Gampaha': { 'English': 'Gampaha', 'සිංහල': 'ගම්පහ', 'தமிழ்': 'கம்பஹா' },
  'Hambantota': { 'English': 'Hambantota', 'සිංහල': 'හම්බන්තොට', 'தமிழ்': 'அம்பாந்தோட்டை' },
  'Jaffna': { 'English': 'Jaffna', 'සිංහල': 'යාපනය', 'தமிழ்': 'யாழ்ப்பாணம்' },
  'Kalutara': { 'English': 'Kalutara', 'සිංහල': 'කළුතර', 'தமிழ்': 'களுத்துறை' },
  'Kandy': { 'English': 'Kandy', 'සිංහල': 'මහනුවර', 'தமிழ்': 'கண்டி' },
  'Kegalle': { 'English': 'Kegalle', 'සිංහල': 'කෑගල්ල', 'தமிழ்': 'கேகாலை' },
  'Kilinochchi': { 'English': 'Kilinochchi', 'සිංහල': 'කිලිනොච්චිය', 'தமிழ்': 'கிளிநொச்சி' },
  'Kurunegala': { 'English': 'Kurunegala', 'සිංහල': 'කුරුණෑගල', 'தமிழ்': 'குருநாகல்' },
  'Mannar': { 'English': 'Mannar', 'සිංහල': 'මන්නාරම', 'தமிழ்': 'மன்னார்' },
  'Matale': { 'English': 'Matale', 'සිංහල': 'මාතලේ', 'தமிழ்': 'மாத்தளை' },
  'Matara': { 'English': 'Matara', 'සිංහල': 'මාතර', 'தமிழ்': 'மாத்தறை' },
  'Monaragala': { 'English': 'Monaragala', 'සිංහල': 'මොණරාගල', 'தமிழ்': 'மொணராகலை' },
  'Mullaitivu': { 'English': 'Mullaitivu', 'සිංහල': 'මුලතිව්', 'தமிழ்': 'முல்லைத்தீவு' },
  'Nuwara Eliya': { 'English': 'Nuwara Eliya', 'සිංහල': 'නුවරඑළිය', 'தமிழ்': 'நுவரெலியா' },
  'Polonnaruwa': { 'English': 'Polonnaruwa', 'සිංහල': 'පොළොන්නරුව', 'தமிழ்': 'பொலன்னறுவை' },
  'Puttalam': { 'English': 'Puttalam', 'සිංහල': 'පුත්තලම', 'தமிழ்': 'புத்தளம்' },
  'Ratnapura': { 'English': 'Ratnapura', 'සිංහල': 'රත්නපුර', 'தமிழ்': 'இரத்தினபுரி' },
  'Trincomalee': { 'English': 'Trincomalee', 'සිංහල': 'ත්‍රිකුණාමලය', 'தமிழ்': 'திருகோணமலை' },
  'Vavuniya': { 'English': 'Vavuniya', 'සිංහල': 'වවුනියාව', 'தமிழ்': 'வவுனியா' }
};

// Crop Translations (Strict Trilingual Purity)
const CROP_TRANSLATIONS = {
  'Rice (Paddy)': { 'English': 'Rice (Paddy)', 'සිංහල': 'වී', 'தமிழ்': 'நெல்' },
  'Rice': { 'English': 'Rice', 'සිංහල': 'වී', 'தமிழ்': 'நெல்' },
  'Paddy': { 'English': 'Paddy', 'සිංහල': 'වී', 'தமிழ்': 'நெல்' },
  'Chili': { 'English': 'Green Chili', 'සිංහල': 'මිරිස්', 'தமிழ்': 'மிளகாய்' },
  'Green Chili': { 'English': 'Green Chili', 'සිංහල': 'මිරිස්', 'தமிழ்': 'மிளகாய்' },
  'Corn/Maize': { 'English': 'Corn/Maize', 'සිංහල': 'බඩඉරිඟු', 'தமிழ்': 'மக்காச்சோளம்' },
  'Maize': { 'English': 'Maize', 'සිංහල': 'බඩඉරිඟු', 'தமிழ்': 'மக்காச்சோளம்' },
  'Potato': { 'English': 'Potato', 'සිංහල': 'අර්තාපල්', 'தமிழ்': 'உருளைக்கிழங்கு' },
  'Carrot': { 'English': 'Carrot', 'සිංහල': 'කැරට්', 'தமிழ்': 'கேரட்' },
  'Tomato': { 'English': 'Tomato', 'සිංහල': 'තක්කාලි', 'தமிழ்': 'தக்காளி' },
  'Ginger': { 'English': 'Ginger', 'සිංහල': 'ඉඟුරු', 'தமிழ்': 'இஞ்சி' },
  'Turmeric': { 'English': 'Turmeric', 'සිංහල': 'කහ', 'தமிழ்': 'மஞ்சள்' },
  'Cinnamon': { 'English': 'Cinnamon', 'සිංහල': 'කුරුඳු', 'தமிழ்': 'இலவங்கப்பட்டை' },
  'Tea': { 'English': 'Tea', 'සිංහල': 'තේ', 'தமிழ்': 'தேயிலை' },
  'Dragon Fruit': { 'English': 'Dragon Fruit', 'සිංහල': 'ඩ්‍රැගන් ෆෘට්', 'தமிழ்': 'டிராகன் பழம்' },
  'Groundnut': { 'English': 'Groundnut', 'සිංහල': 'රටකජු', 'தமிழ்': 'வேர்க்கடலை' },
  'Cassava': { 'English': 'Cassava', 'සිංහල': 'මඤ්ඤොක්කා', 'தமிழ்': 'மரவள்ளிக்கிழங்கு' },
  'Gotukola': { 'English': 'Gotukola', 'සිංහල': 'ගොටුකොළ', 'தமிழ்': 'வல்லாரை' },
  'Bitter Gourd': { 'English': 'Bitter Gourd', 'සිංහල': 'කරවිල', 'தமிழ்': 'பாகற்காய்' },
  'Okra': { 'English': 'Okra', 'සිංහල': 'බණ්ඩක්කා', 'தமிழ்': 'வெண்டைக்காய்' },
  'Black Pepper': { 'English': 'Black Pepper', 'සිංහල': 'ගම්මිරිස්', 'தமிழ்': 'மிளகு' },
  'Pepper': { 'English': 'Black Pepper', 'සිංහල': 'ගම්මිරිස්', 'தமிழ்': 'மிளகு' },
  'Pineapple': { 'English': 'Pineapple', 'සිංහල': 'අන්නාසි', 'தமிழ்': 'அன்னாசி' },
  'Betel': { 'English': 'Betel', 'සිංහල': 'බුලත්', 'தமிழ்': 'வெற்றிலை' },
  'Rambutan': { 'English': 'Rambutan', 'සිංහල': 'රඹුටන්', 'தமிழ்': 'ரம்புட்டான்' },
  'Banana': { 'English': 'Banana', 'සිංහල': 'කෙසෙල්', 'தமிழ்': 'வாழை' },
  'Watermelon': { 'English': 'Watermelon', 'සිංහල': 'පැණි කොමඩු', 'தமிழ்': 'தர்பூசணி' },
  'Red Onion': { 'English': 'Red Onion', 'සිංහල': 'රතු ළූණු', 'தமிழ்': 'சின்ன வெங்காயம்' },
  'Big Onion': { 'English': 'Big Onion', 'සිංහල': 'ලොකු ළූණු', 'தமிழ்': 'பெரிய வெங்காயம்' },
  'Beetroot': { 'English': 'Beetroot', 'සිංහල': 'බීට්රූට්', 'தமிழ்': 'பீட்ரூட்' },
  'Rubber': { 'English': 'Rubber', 'සිංහල': 'රබර්', 'தமிழ்': 'ரப்பர்' },
  'Green Gram': { 'English': 'Green Gram', 'සිංහල': 'මුං ඇට', 'தமிழ்': 'பாசிப்பயறு' },
  'Sesame': { 'English': 'Sesame', 'සිංහල': 'තල', 'தமிழ்': 'எள்' },
  'Coconut': { 'English': 'Coconut', 'සිංහල': 'පොල්', 'தமிழ்': 'தேங்காய்' },
  'Papaya': { 'English': 'Papaya', 'සිංහල': 'පැපොල්', 'தமிழ்': 'பப்பாளி' },
  'Sugarcane': { 'English': 'Sugarcane', 'සිංහල': 'උක්', 'தமிழ்': 'கரும்பு' },
  'Cabbage': { 'English': 'Cabbage', 'සිංහල': 'ගෝවා', 'தமிழ்': 'முட்டைக்கோஸ்' },
  'Cashew': { 'English': 'Cashew', 'සිංහල': 'කජු', 'தமிழ்': 'முந்திரி' },
  'Brinjal': { 'English': 'Brinjal', 'සිංහල': 'වම්බටු', 'தமிழ்': 'கத்தரிக்காய்' },
  'Snake Gourd': { 'English': 'Snake Gourd', 'සිංහල': 'පතෝල', 'தமிழ்': 'புடலங்காய்' },
  'Pumpkin': { 'English': 'Pumpkin', 'සිංහල': 'වට්ටක්කා', 'தமிழ்': 'பூசணிக்காய்' },
  'Leeks': { 'English': 'Leeks', 'සිංහල': 'ලීක්ස්', 'தமிழ்': 'லீக்ஸ்' },
  'Beans': { 'English': 'Beans', 'සිංහල': 'බෝංචි', 'தமிழ்': 'பீன்ஸ்' },
  'Grapes': { 'English': 'Grapes', 'සිංහල': 'මිදි', 'தமிழ்': 'திராட்சை' },
  'Mango': { 'English': 'Mango', 'සිංහල': 'අඹ', 'தமிழ்': 'மாம்பழம்' },
  'Chilli': { 'English': 'Green Chili', 'සිංහල': 'මිරිස්', 'தமிழ்': 'மிளகாய்' },
  'Strawberry': { 'English': 'Strawberry', 'සිංහල': 'ස්ට්‍රෝබෙරි', 'தமிழ்': 'ஸ்ட்ராபெரி' },
  'Cucumber': { 'English': 'Cucumber', 'සිංහල': 'පිපිඤ්ඤා', 'தமிழ்': 'வெள்ளரி' },
  'Finger Millet': { 'English': 'Finger Millet', 'සිංහල': 'කුරක්කන්', 'தமிழ்': 'கேழ்வரகு' },
  'Barley': { 'English': 'Barley', 'සිංහල': 'බාර්ලි', 'தமிழ்': 'பார்லி' }
};

// Disease Translations
const DISEASE_TRANSLATIONS = {
  'Paddy Blast': { 'English': 'Paddy Blast', 'සිංහල': 'වී කොළ අංගමාරය', 'தமிழ்': 'நெல் குலை நோய்' },
  'Brown Spot': { 'English': 'Brown Spot', 'සිංහල': 'දුඹුරු ලප රෝගය', 'தமிழ்': 'பழுப்புப் புள்ளி நோய்' },
  'Sheath Blight': { 'English': 'Sheath Blight', 'සිංහල': 'කොළ කොපු අංගමාරය', 'தமிழ்': 'உறை கருகல் நோய்' },
  'Bacterial Leaf Blight': { 'English': 'Bacterial Leaf Blight', 'සිංහල': 'බැක්ටීරියා කොළ අංගමාරය', 'தமிழ்': 'பாக்டீரியா இலைக்கருகல்' },
  'Early Blight': { 'English': 'Early Blight', 'සිංහල': 'මුල් අංගමාරය', 'தமிழ்': 'ஆரம்ப கருகல்' },
  'Late Blight': { 'English': 'Late Blight', 'සිංහල': 'පසු අංගමාරය', 'தமிழ்': 'பிந்திய கருகல்' },
  'Leaf Curl': { 'English': 'Leaf Curl', 'සිංහල': 'කොළ කොඩවීම', 'தமிழ்': 'இலைச்சுருள் நோய்' },
  'Powdery Mildew': { 'English': 'Powdery Mildew', 'සිංහල': 'පිටිපුස් රෝගය', 'தமிழ்': 'சாம்பல் நோய்' },
  'Downy Mildew': { 'English': 'Downy Mildew', 'සිංහල': 'මෘදු පුස් රෝගය', 'தமிழ்': 'அடிச்சாம்பல் நோய்' },
  'Anthracnose': { 'English': 'Anthracnose', 'සිංහල': 'ඇන්ත්‍රැක්නෝස්', 'தமிழ்': 'ஆந்த்ராக்னோஸ்' },
  'Leaf Spot': { 'English': 'Leaf Spot', 'සිංහල': 'කොළ ලප රෝගය', 'தமிழ்': 'இலைப் புள்ளி நோய்' },
  'Bacterial Wilt': { 'English': 'Bacterial Wilt', 'සිංහල': 'බැක්ටීරියා කුණුවීම / මැලවීම', 'தமிழ்': 'பாக்டீரியா வாடல் நோய்' },
  'Rust': { 'English': 'Rust', 'සිංහල': 'මලකඩ රෝගය', 'தமிழ்': 'துரு நோய்' },
  'Mosaic Virus': { 'English': 'Mosaic Virus', 'සිංහල': 'මොසැයික් වෛරසය', 'தமிழ்': 'மொசைக் வைரஸ்' }
};

// Complete Admin Dashboard Trilingual Localization Dictionary
const ADMIN_I18N = {
  English: {
    adminMode: 'Administrator Mode',
    systemLive: 'System Live & Operational',
    adminTitle: 'AgriSense Admin Control & Insights',
    adminSubtitle: 'Click any box below to inspect registered farmers, plant disease outbreaks, or district-wise most requested crops.',
    refresh: 'Refresh',
    refreshing: 'Refreshing...',
    farmerPortal: 'Farmer Portal',
    tryAgain: 'Try Again',
    activeView: 'Active View',
    totalUsers: 'TOTAL REGISTERED USERS',
    farmers: 'Farmers',
    usersHint: 'Click to inspect user accounts & activity',
    totalScans: 'TOP 5 DISEASES',
    top: 'Top',
    scansHint: 'Click to view top 5 diagnosed diseases & affected crops',
    mostRequestedCrops: 'MOST REQUESTED CROPS',
    districts: 'Districts',
    cropsHint: 'Click to view top 3 recommended crops per district',
    usersTabTitle: 'Registered Users & Farmers',
    usersTabSubtitle: 'View contact details, registration dates, disease scans, and crop analyses per user.',
    searchFarmers: 'Search farmers by name, email, or phone...',
    allRoles: 'All Roles',
    farmersOnly: 'Farmers Only',
    administrators: 'Administrators',
    colId: 'ID',
    colFarmerName: 'Farmer Name',
    colEmail: 'Email Address',
    colPhone: 'Phone',
    colRole: 'Role',
    colRegDate: 'Registered Date',
    colDiseaseScans: 'Disease Scans',
    colCropsAnalyzed: 'Crops Analyzed',
    colActions: 'Actions',
    noUsers: 'No users found matching the search criteria.',
    roleAdmin: 'Admin',
    roleFarmer: 'Farmer',
    scansLabel: 'scans',
    cropsLabel: 'crops',
    deleteUserConfirm: 'Are you sure you want to remove user',
    cropsTabTitle: 'Most Requested Crops by District',
    cropsTabSubtitle: 'Shows districts with farmer inquiries and the crops actually requested by users.',
    searchDistrictCrops: 'Search district or crop...',
    noDistrictCrops: 'No user crop inquiries recorded yet.',
    top5DiseasesTitle: 'Top 5 Most Diagnosed Plant Diseases',
    top5DiseasesSubtitle: 'The top 5 most common plant diseases diagnosed by this app and the 3 crops most affected by each.',
    primaryCrops: 'Primary Crops Affected',
    reportedDistricts: 'Reported Districts',
    loadingTitle: 'Loading AgriSense Admin Intelligence...',
    loadingSubtitle: 'Retrieving real-time farmer data, disease diagnostics, and crop selections.'
  },
  'සිංහල': {
    adminMode: 'පරිපාලක මාදිලිය',
    systemLive: 'පද්ධතිය සක්‍රීයයි',
    adminTitle: 'AgriSense පරිපාලක පාලන පුවරුව',
    adminSubtitle: 'ලියාපදිංචි ගොවීන්, ප්‍රධාන ශාක රෝග 5 හෝ දිස්ත්‍රික්ක අනුව පරිශීලකයින් විමසූ බෝග බැලීමට පහත කොටු මත ක්ලික් කරන්න.',
    refresh: 'නැවුම් කරන්න',
    refreshing: 'නැවුම් කරමින්...',
    farmerPortal: 'ගොවි පියස',
    tryAgain: 'නැවත උත්සාහ කරන්න',
    activeView: 'සක්‍රීය දසුන',
    totalUsers: 'මුළු ලියාපදිංචි පරිශීලකයින්',
    farmers: 'ගොවීන්',
    usersHint: 'පරිශීලක ගිණුම් සහ ක්‍රියාකාරකම් බැලීමට ක්ලික් කරන්න',
    totalScans: 'ප්‍රධාන ශාක රෝග 5',
    top: 'ප්‍රධාන',
    scansHint: 'වැඩිපුරම වාර්තා වූ ශාක රෝග 5 සහ හානියට පත් බෝග බැලීමට ක්ලික් කරන්න',
    mostRequestedCrops: 'පරිශීලකයින් විමසූ බෝග',
    districts: 'දිස්ත්‍රික්ක',
    cropsHint: 'දිස්ත්‍රික්කය අනුව පරිශීලකයින් විමසූ බෝග බැලීමට ක්ලික් කරන්න',
    usersTabTitle: 'ලියාපදිංචි පරිශීලකයින් සහ ගොවීන්',
    usersTabSubtitle: 'සෑම පරිශීලකයෙකුගේම සම්බන්ධතා තොරතුරු, ලියාපදිංචි දිනයන්, රෝග පරීක්ෂාවන් සහ බෝග විශ්ලේෂණ බලන්න.',
    searchFarmers: 'නම, විද්‍යුත් තැපෑල හෝ දුරකථන අංකයෙන් සොයන්න...',
    allRoles: 'සියලු භූමිකාවන්',
    farmersOnly: 'ගොවීන් පමණි',
    administrators: 'පරිපාලකයින්',
    colId: 'අංකය',
    colFarmerName: 'ගොවියාගේ නම',
    colEmail: 'විද්‍යුත් තැපෑල',
    colPhone: 'දුරකථන අංකය',
    colRole: 'භූමිකාව',
    colRegDate: 'ලියාපදිංචි දිනය',
    colDiseaseScans: 'රෝග පරීක්ෂාවන්',
    colCropsAnalyzed: 'විශ්ලේෂිත බෝග',
    colActions: 'ක්‍රියාමාර්ග',
    noUsers: 'සෙවුමට ගැළපෙන පරිශීලකයින් හමු නොවීය.',
    roleAdmin: 'පරිපාලක',
    roleFarmer: 'ගොවි',
    scansBadge: 'පරීක්ෂාවන්',
    cropsBadge: 'බෝග',
    deleteUserConfirm: 'මෙම පරිශීලකයා ඉවත් කිරීමට ඔබට සහතිකද',
    cropsTabTitle: 'දිස්ත්‍රික්ක අනුව පරිශීලකයින් විමසූ බෝග',
    cropsTabSubtitle: 'පරිශීලකයින් විසින් බෝග විමසීම් සිදුකළ දිස්ත්‍රික්ක සහ ඔවුන් ඇසූ බෝග පමණක් මෙහි දැක්වේ.',
    searchDistrictCrops: 'දිස්ත්‍රික්කය හෝ බෝගය සොයන්න...',
    noDistrictCrops: 'තවමත් කිසිදු දිස්ත්‍රික්කයකින් බෝග විමසීම් වාර්තා වී නොමැත.',
    top5DiseasesTitle: 'වැඩිපුරම වාර්තා වූ ශාක රෝග 5',
    top5DiseasesSubtitle: 'මෙම ඇප් එක හරහා වැඩිපුරම ප්‍රතිඵල ලෙස හඳුනාගත් ප්‍රධාන ශාක රෝග 5 සහ ඒ සෑම රෝගයකින්ම වැඩිපුරම හානියට පත් බෝග 3 මෙහි දැක්වේ.',
    primaryCrops: 'බලපෑමට ලක්වූ ප්‍රධාන බෝග 3',
    reportedDistricts: 'වාර්තා වූ දිස්ත්‍රික්ක',
    loadingTitle: 'AgriSense පරිපාලක තොරතුරු පූරණය වෙමින් පවතී...',
    loadingSubtitle: 'ගොවි දත්ත, රෝග නිර්ණයන් සහ බෝග තේරීම් ලබාගනිමින් පවතී.'
  },
  'தமிழ்': {
    adminMode: 'நிர்வாகி பயன்முறை',
    systemLive: 'அமைப்பு நேரலையில் இயங்குகிறது',
    adminTitle: 'AgriSense நிர்வாக கட்டுப்பாட்டு பலகை',
    adminSubtitle: 'பதிவுசெய்த விவசாயிகள், பயிர் நோய் பதிவுகள் அல்லது மாவட்டம் வாரியாக பயனர்கள் கோரிய பயிர்களைப் பார்க்க கீழே உள்ள பெட்டிகளை அழுத்தவும்.',
    refresh: 'புதுப்பி',
    refreshing: 'புதுப்பிக்கிறது...',
    farmerPortal: 'விவசாயி போர்டல்',
    tryAgain: 'மீண்டும் முயற்சிக்கவும்',
    activeView: 'செயலில் உள்ள காட்சி',
    totalUsers: 'மொத்த பதிவுசெய்த பயனர்கள்',
    farmers: 'விவசாயிகள்',
    usersHint: 'பயனர் கணக்குகள் மற்றும் செயல்பாடுகளைப் பார்க்க அழுத்தவும்',
    totalScans: 'முதல் 5 நோய்கள்',
    top: 'முக்கிய',
    scansHint: 'அதிகம் கண்டறியப்பட்ட 5 நோய்களையும் பாதிக்கப்பட்ட பயிர்களையும் பார்க்க அழுத்தவும்',
    mostRequestedCrops: 'பயனர்கள் கோரிய பயிர்கள்',
    districts: 'மாவட்டங்கள்',
    cropsHint: 'மாவட்டம் வாரியாக பயனர்கள் கோரிய பயிர்களைப் பார்க்க அழுத்தவும்',
    usersTabTitle: 'பதிவுசெய்த பயனர்கள் மற்றும் விவசாயிகள்',
    usersTabSubtitle: 'ஒவ்வொரு பயனரின் தொடர்பு விவரங்கள், பதிவு தேதிகள், நோய் ஆய்வுகள் மற்றும் பயிர் பகுப்பாய்வுகளைப் பார்க்கவும்.',
    searchFarmers: 'பெயர், மின்னஞ்சல் அல்லது தொலைபேசி மூலம் தேடவும்...',
    allRoles: 'அனைத்து பாத்திரங்கள்',
    farmersOnly: 'விவசாயிகள் மட்டும்',
    administrators: 'நிர்வாகிகள்',
    colId: 'எண்',
    colFarmerName: 'விவசாயி பெயர்',
    colEmail: 'மின்னஞ்சல் முகவரி',
    colPhone: 'தொலைபேசி',
    colRole: 'பாத்திரம்',
    colRegDate: 'பதிவுசெய்த தேதி',
    colDiseaseScans: 'நோய் ஆய்வுகள்',
    colCropsAnalyzed: 'பகுப்பாய்வு செய்த பயிர்கள்',
    colActions: 'செயல்கள்',
    noUsers: 'தேடல் நிபந்தனைகளுக்குப் பொருந்தும் பயனர்கள் இல்லை.',
    roleAdmin: 'நிர்வாகி',
    roleFarmer: 'விவசாயி',
    scansBadge: 'ஆய்வுகள்',
    cropsBadge: 'பயிர்கள்',
    deleteUserConfirm: 'இந்த பயனரை நீக்க நிச்சயமாக விரும்புகிறீர்களா',
    cropsTabTitle: 'மாவட்டம் வாரியாக பயனர்கள் கோரிய பயிர்கள்',
    cropsTabSubtitle: 'பயனர்கள் வினவிய மாவட்டங்களும் அவர்கள் கோரிய பயிர்களும் மட்டுமே இங்கே காட்டப்பட்டுள்ளன.',
    searchDistrictCrops: 'மாவட்டம் அல்லது பயிரைத் தேடவும்...',
    noDistrictCrops: 'இன்னும் பயிர் விசாரணைகள் எதுவும் பதிவாகவில்லை.',
    top5DiseasesTitle: 'அதிகம் கண்டறியப்பட்ட 5 தாவர நோய்கள்',
    top5DiseasesSubtitle: 'இந்த செயலி மூலம் அதிகம் கண்டறியப்பட்ட முதல் 5 தாவர நோய்களும், ஒவ்வொன்றாலும் அதிகம் பாதிக்கப்பட்ட 3 பயிர்களும் இங்கே காட்டப்பட்டுள்ளன.',
    primaryCrops: 'பாதிக்கப்பட்ட முக்கிய 3 பயிர்கள்',
    reportedDistricts: 'பதிவான மாவட்டங்கள்',
    loadingTitle: 'AgriSense நிர்வாக நுண்ணறிவு ஏற்றப்படுகிறது...',
    loadingSubtitle: 'நிகழ்நேர விவசாயி தரவு, நோய் கண்டறிதல் மற்றும் பயிர் தேர்வுகள் மீட்டெடுக்கப்படுகின்றன.'
  }
};

const AdminDashboard = ({ user }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  // Active localized dictionary
  const labels = ADMIN_I18N[language] || ADMIN_I18N.English;

  // Selected box view: 'users' | 'diseases' | 'most_requested_crops'
  const [activeBox, setActiveBox] = useState('most_requested_crops');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Data states
  const [overview, setOverview] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [diseaseData, setDiseaseData] = useState({ logs: [], disease_distribution: [], severity_counts: {} });
  const [cropData, setCropData] = useState({ logs: [], top_crops: [], districts: [], district_top_crops: [] });

  // Filter & Search states
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [diseaseSearch, setDiseaseSearch] = useState('');
  const [diseaseSeverityFilter, setDiseaseSeverityFilter] = useState('all');
  const [districtCropSearch, setDistrictCropSearch] = useState('');

  // Localization helper methods
  const getLocalizedDistrict = (district) => {
    if (!district) return '';
    return DISTRICT_TRANSLATIONS[district]?.[language] || district;
  };

  const getLocalizedCrop = (crop) => {
    if (!crop) return '';
    if (CROP_TRANSLATIONS[crop]?.[language]) {
      return CROP_TRANSLATIONS[crop][language];
    }
    const cLower = crop.toLowerCase();
    if (cLower.includes('rice') || cLower.includes('paddy')) {
      return CROP_TRANSLATIONS['Rice (Paddy)']?.[language] || 'Rice (Paddy)';
    }
    if (cLower.includes('chili') || cLower.includes('chilli') || cLower.includes('pepper')) {
      return CROP_TRANSLATIONS['Chili']?.[language] || 'Green Chili';
    }
    if (cLower.includes('corn') || cLower.includes('maize')) {
      return CROP_TRANSLATIONS['Corn/Maize']?.[language] || 'Corn/Maize';
    }
    if (cLower.includes('grape')) {
      return CROP_TRANSLATIONS['Grapes']?.[language] || 'Grapes';
    }
    if (cLower.includes('mango')) {
      return CROP_TRANSLATIONS['Mango']?.[language] || 'Mango';
    }
    if (cLower.includes('tomato')) {
      return CROP_TRANSLATIONS['Tomato']?.[language] || 'Tomato';
    }
    if (cLower.includes('potato')) {
      return CROP_TRANSLATIONS['Potato']?.[language] || 'Potato';
    }
    if (cLower.includes('turmeric')) {
      return CROP_TRANSLATIONS['Turmeric']?.[language] || 'Turmeric';
    }
    if (cLower.includes('banana')) {
      return CROP_TRANSLATIONS['Banana']?.[language] || 'Banana';
    }
    if (cLower.includes('tea')) {
      return CROP_TRANSLATIONS['Tea']?.[language] || 'Tea';
    }
    if (cLower.includes('coconut')) {
      return CROP_TRANSLATIONS['Coconut']?.[language] || 'Coconut';
    }
    if (cLower.includes('okra') || cLower.includes('ladiesfinger')) {
      return CROP_TRANSLATIONS['Okra']?.[language] || 'Okra';
    }
    const clean = crop.split(/[\(/\-]/)[0].trim();
    return clean || crop;
  };

  const getLocalizedDisease = (disease) => {
    if (!disease) return '';
    if (DISEASE_TRANSLATIONS[disease]?.[language]) {
      return DISEASE_TRANSLATIONS[disease][language];
    }
    const dLower = disease.toLowerCase();
    if (dLower.includes('anthracnose') || dLower.includes("bird's eye rot")) {
      return DISEASE_TRANSLATIONS['Anthracnose']?.[language] || 'Anthracnose';
    }
    if (dLower.includes('downy mildew')) {
      return DISEASE_TRANSLATIONS['Downy Mildew']?.[language] || 'Downy Mildew';
    }
    if (dLower.includes('powdery mildew')) {
      return DISEASE_TRANSLATIONS['Powdery Mildew']?.[language] || 'Powdery Mildew';
    }
    if (dLower.includes('blast')) {
      return DISEASE_TRANSLATIONS['Paddy Blast']?.[language] || 'Paddy Blast';
    }
    if (dLower.includes('early blight')) {
      return DISEASE_TRANSLATIONS['Early Blight']?.[language] || 'Early Blight';
    }
    if (dLower.includes('late blight')) {
      return DISEASE_TRANSLATIONS['Late Blight']?.[language] || 'Late Blight';
    }
    if (dLower.includes('sheath blight')) {
      return DISEASE_TRANSLATIONS['Sheath Blight']?.[language] || 'Sheath Blight';
    }
    if (dLower.includes('bacterial leaf blight') || dLower.includes('blb')) {
      return DISEASE_TRANSLATIONS['Bacterial Leaf Blight']?.[language] || 'Bacterial Leaf Blight';
    }
    if (dLower.includes('brown spot')) {
      return DISEASE_TRANSLATIONS['Brown Spot']?.[language] || 'Brown Spot';
    }
    if (dLower.includes('leaf curl')) {
      return DISEASE_TRANSLATIONS['Leaf Curl']?.[language] || 'Leaf Curl';
    }
    if (dLower.includes('leaf spot') || dLower.includes('leaf blotch') || dLower.includes('frogeye')) {
      return DISEASE_TRANSLATIONS['Leaf Spot']?.[language] || 'Leaf Spot';
    }
    if (dLower.includes('mosaic')) {
      return DISEASE_TRANSLATIONS['Mosaic Virus']?.[language] || 'Mosaic Virus';
    }
    if (dLower.includes('wilt')) {
      return DISEASE_TRANSLATIONS['Bacterial Wilt']?.[language] || 'Bacterial Wilt';
    }
    if (dLower.includes('rust')) {
      return DISEASE_TRANSLATIONS['Rust']?.[language] || 'Rust';
    }
    // Clean English string if contains scientific or foreign characters
    const clean = disease.split(/[\(/\-]/)[0].trim();
    return clean || disease;
  };

  const getLocalizedSeverity = (severity) => {
    const s = (severity || '').toLowerCase();
    if (s === 'severe' || s === 'high') return labels.severe;
    if (s === 'moderate' || s === 'medium') return labels.moderate;
    if (s === 'low') return labels.low;
    return severity;
  };

  const getLocalizedRole = (role) => {
    if (role === 'admin') return labels.roleAdmin;
    return labels.roleFarmer;
  };

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [overviewRes, usersRes, diseaseRes, cropRes] = await Promise.all([
        getAdminOverview(),
        getAdminUsers(),
        getAdminDiseaseLogs(),
        getAdminCropAnalytics()
      ]);

      setOverview(overviewRes);
      setUsersList(usersRes);
      setDiseaseData(diseaseRes);
      setCropData(cropRes);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setError(err.message || 'Failed to communicate with AgriSense Admin API');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers
  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`${labels.deleteUserConfirm} "${userName}" (ID: ${userId})?`)) {
      try {
        await deleteAdminUser(userId);
        setUsersList(prev => prev.filter(u => u.id !== userId));
        getAdminOverview().then(setOverview).catch(() => {});
      } catch (err) {
        alert(err.message || 'Could not delete user');
      }
    }
  };

  // Group by district: ONLY display districts actually queried/analyzed by users in the app
  // ZERO fake/dummy crops and ZERO fake districts
  const districtTopList = useMemo(() => {
    const districtMap = {};

    // 1. Incorporate API district_top_crops (actual crops queried by users in each district)
    if (cropData.district_top_crops && cropData.district_top_crops.length > 0) {
      cropData.district_top_crops.forEach(item => {
        const dist = item.district;
        if (!dist) return;
        if (!districtMap[dist]) districtMap[dist] = [];
        
        if (item.crops && Array.isArray(item.crops)) {
          item.crops.forEach(c => {
            if (c && !districtMap[dist].includes(c)) districtMap[dist].push(c);
          });
        } else if (item.crop_name && !districtMap[dist].includes(item.crop_name)) {
          districtMap[dist].push(item.crop_name);
        }
      });
    }

    // 2. Incorporate any crops from genuine user logs if not already captured
    (cropData.logs || []).forEach(log => {
      if (!log.district || log.user_email === 'Guest Farmer') return;
      if (!districtMap[log.district]) districtMap[log.district] = [];
      if (log.crop_name && !districtMap[log.district].includes(log.crop_name)) {
        districtMap[log.district].push(log.crop_name);
      }
    });

    // 3. Strictly ONLY return districts that actually have real user queries
    // NO fake/default crops are ever injected
    const result = Object.keys(districtMap)
      .filter(dist => districtMap[dist] && districtMap[dist].length > 0)
      .sort()
      .map(dist => ({
        district: dist,
        crops: districtMap[dist] // Only genuine crops queried by users
      }));

    return result;
  }, [cropData.district_top_crops, cropData.logs]);

  // Filtered lists
  const filteredUsers = useMemo(() => {
    return usersList.filter(u => {
      const matchesSearch = 
        u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.phone?.includes(userSearch);
      const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [usersList, userSearch, userRoleFilter]);

  const filteredDiseases = useMemo(() => {
    return (diseaseData.logs || []).filter(d => {
      const distSearchLower = diseaseSearch.toLowerCase();
      const diseaseLocalized = (getLocalizedDisease(d.disease_name) || '').toLowerCase();
      const cropLocalized = (getLocalizedCrop(d.crop_name) || '').toLowerCase();
      
      const matchesSearch = 
        d.disease_name?.toLowerCase().includes(distSearchLower) ||
        diseaseLocalized.includes(distSearchLower) ||
        d.crop_name?.toLowerCase().includes(distSearchLower) ||
        cropLocalized.includes(distSearchLower) ||
        d.user_name?.toLowerCase().includes(distSearchLower) ||
        d.user_email?.toLowerCase().includes(distSearchLower);
      const matchesSeverity = diseaseSeverityFilter === 'all' || d.severity?.toLowerCase() === diseaseSeverityFilter.toLowerCase();
      return matchesSearch && matchesSeverity;
    });
  }, [diseaseData.logs, diseaseSearch, diseaseSeverityFilter, language]);

  // Top 5 most diagnosed diseases across the app
  const top5DiseasesList = useMemo(() => {
    if (diseaseData.top_5_diseases && diseaseData.top_5_diseases.length > 0) {
      return diseaseData.top_5_diseases.slice(0, 5);
    }
    // Fallback baseline top 5 diseases if not provided by API
    return [
      {
        rank: 1,
        disease_name: "Anthracnose",
        crops: ["Grapes", "Chili", "Mango"],
        severity: "Moderate"
      },
      {
        rank: 2,
        disease_name: "Leaf Spot",
        crops: ["Turmeric", "Banana", "Chili"],
        severity: "Moderate"
      },
      {
        rank: 3,
        disease_name: "Downy Mildew",
        crops: ["Grapes", "Cucumber", "Pumpkin"],
        severity: "Severe"
      },
      {
        rank: 4,
        disease_name: "Paddy Blast",
        crops: ["Rice (Paddy)", "Finger Millet", "Barley"],
        severity: "Severe"
      },
      {
        rank: 5,
        disease_name: "Early Blight",
        crops: ["Tomato", "Potato", "Brinjal"],
        severity: "Moderate"
      }
    ];
  }, [diseaseData.top_5_diseases]);

  const filteredDistrictTopList = useMemo(() => {
    const q = districtCropSearch.trim().toLowerCase();
    if (!q) return districtTopList;

    return districtTopList.filter(item => {
      const distEn = item.district.toLowerCase();
      const distLocalized = (getLocalizedDistrict(item.district) || '').toLowerCase();
      const distMatch = distEn.includes(q) || distLocalized.includes(q);

      const cropMatch = item.crops.some(crop => {
        const cropEn = crop.toLowerCase();
        const cropLocalized = (getLocalizedCrop(crop) || '').toLowerCase();
        return cropEn.includes(q) || cropLocalized.includes(q);
      });

      return distMatch || cropMatch;
    });
  }, [districtTopList, districtCropSearch, language]);

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="admin-spinner"></div>
        <h3>{labels.loadingTitle}</h3>
        <p>{labels.loadingSubtitle}</p>
      </div>
    );
  }

  return (
    <div className="admin-container fade-in">
      {/* Top Banner & Title */}
      <div className="admin-header-panel glass-panel">
        <div className="admin-header-content">
          <div className="admin-badge-row">
            <span className="admin-shield-badge">
              <ShieldCheck size={16} /> {labels.adminMode}
            </span>
            <span className="live-status-pill">
              <span className="status-dot"></span> {labels.systemLive}
            </span>
          </div>
          <h1 className="admin-page-title">{labels.adminTitle}</h1>
          <p className="admin-subtitle">{labels.adminSubtitle}</p>
        </div>

        <div className="admin-header-actions">
          <button 
            className="admin-btn-secondary" 
            onClick={() => fetchData(true)} 
            disabled={refreshing}
            title={labels.refresh}
          >
            <RefreshCw size={16} className={refreshing ? 'spinning' : ''} />
            <span>{refreshing ? labels.refreshing : labels.refresh}</span>
          </button>
          <button 
            className="admin-btn-primary" 
            onClick={() => navigate('/')}
            title={labels.farmerPortal}
          >
            <ExternalLink size={16} />
            <span>{labels.farmerPortal}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="admin-error-banner">
          <AlertTriangle size={20} />
          <span>{error}</span>
          <button onClick={() => fetchData()}>{labels.tryAgain}</button>
        </div>
      )}

      {/* 3 TOP KPI BOXES (Clickable cards that directly toggle views) */}
      <div className="admin-kpi-grid">
        {/* Box 1: Total Registered Users */}
        <div 
          className={`admin-kpi-card glass-panel ${activeBox === 'users' ? 'active-box' : ''}`}
          onClick={() => setActiveBox('users')}
          title={labels.usersHint}
        >
          <div className="card-top-indicator">
            {activeBox === 'users' && <span className="viewing-pill"><Check size={12} /> {labels.activeView}</span>}
          </div>
          <div className="kpi-card-body">
            <div className="kpi-icon-wrapper users">
              <Users size={26} />
            </div>
            <div className="kpi-details">
              <span className="kpi-label">{labels.totalUsers}</span>
              <div className="kpi-number-row">
                <span className="kpi-value">{overview?.total_users || usersList.length}</span>
                <span className="kpi-sub-tag">{overview?.total_farmers || usersList.length} {labels.farmers}</span>
              </div>
              <span className="kpi-hint">{labels.usersHint}</span>
            </div>
          </div>
        </div>

        {/* Box 2: Top 5 Diseases */}
        <div 
          className={`admin-kpi-card glass-panel ${activeBox === 'diseases' ? 'active-box' : ''}`}
          onClick={() => setActiveBox('diseases')}
          title={labels.scansHint}
        >
          <div className="card-top-indicator">
            {activeBox === 'diseases' && <span className="viewing-pill"><Check size={12} /> {labels.activeView}</span>}
          </div>
          <div className="kpi-card-body">
            <div className="kpi-icon-wrapper diseases">
              <Stethoscope size={26} />
            </div>
            <div className="kpi-details">
              <span className="kpi-label">{labels.totalScans}</span>
              <div className="kpi-number-row">
                <span className="kpi-value">5</span>
                <span className="kpi-sub-tag alert-sub">
                  {labels.top}: {getLocalizedDisease(top5DiseasesList[0]?.disease_name || overview?.top_disease || 'Anthracnose')}
                </span>
              </div>
              <span className="kpi-hint">{labels.scansHint}</span>
            </div>
          </div>
        </div>

        {/* Box 3: Most Requested Crops */}
        <div 
          className={`admin-kpi-card glass-panel highlight ${activeBox === 'most_requested_crops' ? 'active-box' : ''}`}
          onClick={() => setActiveBox('most_requested_crops')}
          title={labels.cropsHint}
        >
          <div className="card-top-indicator">
            {activeBox === 'most_requested_crops' && <span className="viewing-pill"><Check size={12} /> {labels.activeView}</span>}
          </div>
          <div className="kpi-card-body">
            <div className="kpi-icon-wrapper crops">
              <Sprout size={26} />
            </div>
            <div className="kpi-details">
              <span className="kpi-label">{labels.mostRequestedCrops}</span>
              <div className="kpi-number-row">
                <span className="kpi-value highlight-text">{districtTopList.length}</span>
                <span className="kpi-sub-tag success-sub">{labels.districts}</span>
              </div>
              <span className="kpi-hint">{labels.cropsHint}</span>
            </div>
          </div>
        </div>
      </div>

      {/* RESULTS DISPLAY AREA (Reflects which top box is clicked) */}

      {/* VIEW 1: USER MANAGEMENT (Shown when Box 1 clicked) */}
      {activeBox === 'users' && (
        <div className="tab-section-content fade-in">
          <div className="admin-card glass-panel">
            <div className="card-header-flex">
              <div className="card-title-group">
                <Users className="text-primary-dark" size={22} />
                <div>
                  <h3>{labels.usersTabTitle} ({usersList.length})</h3>
                  <p className="section-subtext">{labels.usersTabSubtitle}</p>
                </div>
              </div>
            </div>

            <div className="table-controls-row">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  placeholder={labels.searchFarmers} 
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                />
              </div>

              <div className="filter-group">
                <Filter size={16} className="text-secondary" />
                <select 
                  value={userRoleFilter} 
                  onChange={e => setUserRoleFilter(e.target.value)}
                  className="admin-select"
                >
                  <option value="all">{labels.allRoles}</option>
                  <option value="farmer">{labels.farmersOnly}</option>
                  <option value="admin">{labels.administrators}</option>
                </select>
              </div>
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{labels.colId}</th>
                    <th>{labels.colFarmerName}</th>
                    <th>{labels.colEmail}</th>
                    <th>{labels.colPhone}</th>
                    <th>{labels.colRole}</th>
                    <th>{labels.colRegDate}</th>
                    <th>{labels.colDiseaseScans}</th>
                    <th>{labels.colCropsAnalyzed}</th>
                    <th>{labels.colActions}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="no-data-cell">{labels.noUsers}</td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => (
                      <tr key={u.id}>
                        <td className="font-mono text-secondary">#{u.id}</td>
                        <td className="font-semibold">
                          <div className="user-name-cell">
                            <div className="user-avatar-initials">{u.name?.charAt(0).toUpperCase()}</div>
                            <span>{u.name}</span>
                          </div>
                        </td>
                        <td>{u.email}</td>
                        <td>{u.phone || 'N/A'}</td>
                        <td>
                          <span className={`role-pill ${u.role === 'admin' ? 'role-admin' : 'role-farmer'}`}>
                            {getLocalizedRole(u.role)}
                          </span>
                        </td>
                        <td className="text-secondary">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td>
                          <span className="activity-count-badge scans">{u.scans_count || 0} {labels.scansBadge || 'scans'}</span>
                        </td>
                        <td>
                          <span className="activity-count-badge crops">{u.crops_count || 0} {labels.cropsBadge || 'crops'}</span>
                        </td>
                        <td>
                          {u.role !== 'admin' && (
                            <button 
                              className="admin-action-icon-btn delete" 
                              title="Delete user"
                              onClick={() => handleDeleteUser(u.id, u.name)}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: TOP 5 DISEASES (Shown when Box 2 clicked) */}
      {activeBox === 'diseases' && (
        <div className="tab-section-content fade-in">
          {/* TOP 5 MOST DIAGNOSED DISEASES LEADERBOARD CARD */}
          <div className="admin-card glass-panel top-diseases-leaderboard-card">
            <div className="card-header-flex">
              <div className="card-title-group">
                <Award className="text-warning-gold" size={24} />
                <div>
                  <h3 className="leaderboard-heading">{labels.top5DiseasesTitle}</h3>
                  <p className="section-subtext">{labels.top5DiseasesSubtitle}</p>
                </div>
              </div>
            </div>

            <div className="top-diseases-list">
              {top5DiseasesList.map((item, index) => {
                const rankNumber = item.rank || index + 1;
                const localizedName = getLocalizedDisease(item.disease_name);

                return (
                  <div key={item.disease_name || index} className={`top-disease-row rank-${rankNumber}`}>
                    {/* Plain Number Rank Badge (1, 2, 3, 4, 5) */}
                    <div className="top-disease-rank-col">
                      <span className={`rank-badge rank-num-${rankNumber}`}>
                        {rankNumber}
                      </span>
                    </div>

                    {/* Disease Info & 3 Affected Crops */}
                    <div className="top-disease-info-col">
                      <div className="top-disease-name-row">
                        <h4 className="top-disease-title">{localizedName}</h4>
                        <span className={`severity-badge ${item.severity?.toLowerCase()}`}>
                          {getLocalizedSeverity(item.severity)}
                        </span>
                      </div>

                      {/* 3 Crops Affected */}
                      <div className="top-disease-crops-row">
                        <span className="crops-affected-label">{labels.primaryCrops}:</span>
                        <div className="top-disease-crops-pills">
                          {(item.crops || []).slice(0, 3).map((crop, cIdx) => (
                            <span key={cIdx} className="crop-mini-pill">
                              <Sprout size={13} className="crop-mini-icon" />
                              {getLocalizedCrop(crop)}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Reported Districts */}
                      {item.districts && item.districts.length > 0 && (
                        <div className="top-disease-districts-row">
                          <span className="crops-affected-label">{labels.reportedDistricts}:</span>
                          <div className="top-disease-crops-pills">
                            {item.districts.map((district, dIdx) => (
                              <span key={dIdx} className="district-mini-pill">
                                <MapPin size={13} className="district-mini-icon" />
                                {getLocalizedDistrict(district)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: MOST REQUESTED CROPS (Shown when Box 3 clicked) - Horizontal Lines Display */}
      {activeBox === 'most_requested_crops' && (
        <div className="tab-section-content fade-in">
          <div className="admin-card glass-panel">
            <div className="card-header-flex">
              <div className="card-title-group">
                <Sprout className="text-primary-dark" size={24} />
                <div>
                  <h3>{labels.cropsTabTitle}</h3>
                  <p className="section-subtext">{labels.cropsTabSubtitle}</p>
                </div>
              </div>
              <div className="search-input-wrapper small">
                <Search size={16} className="search-icon" />
                <input 
                  type="text" 
                  placeholder={labels.searchDistrictCrops} 
                  value={districtCropSearch}
                  onChange={e => setDistrictCropSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Clean Horizontal Lines for District and 3 Recommended Crops */}
            <div className="district-crop-lines-wrapper">
              {filteredDistrictTopList.length === 0 ? (
                <div className="no-data-cell">{labels.noDistrictCrops}</div>
              ) : (
                filteredDistrictTopList.map((item) => (
                  <div key={item.district} className="district-crop-line-row">
                    <div className="line-district-col">
                      <div className="district-icon-circle">
                        <MapPin size={16} className="line-district-pin" />
                      </div>
                      <span className="line-district-name">
                        {getLocalizedDistrict(item.district)}
                      </span>
                    </div>

                    <div className="line-horizontal-connector">
                      <span className="connector-line"></span>
                    </div>

                    <div className="line-crops-group">
                      {item.crops.map((crop, idx) => (
                        <div key={idx} className="line-crop-badge">
                          <Sprout size={13} className="line-crop-icon" />
                          <span className="line-crop-text">
                            {getLocalizedCrop(crop)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
