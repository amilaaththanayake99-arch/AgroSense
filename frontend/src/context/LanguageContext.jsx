import React, { createContext, useContext, useState, useEffect } from 'react';

export const LanguageContext = createContext();

export const translations = {
  English: {
    // Header & Nav
    home: 'Home',
    cropRecommendation: 'Crop Recommendation',
    diseaseDetection: 'Disease Detection',
    cultivationGuide: 'Cultivation Guide',
    marketPredictions: 'Market Predictions',
    profile: 'My Profile',
    login: 'Login',
    createAccount: 'Create Account',
    logout: 'Logout',
    selectLanguage: 'Select Language',
    farmerRole: 'Farmer',
    adminDashboard: 'Admin Dashboard',
    
    // Crop Analysis - Form
    cropAnalysisTitle: 'Precision Crop Suitability & Master Cultivation Roadmap',
    cropAnalysisSubtitle: 'Sri Lanka Department of Agriculture (DOA) agronomic extension guidelines and island-wide wholesale market economics across all 25 districts.',
    selectDistrict: 'Select District',
    selectDistrictPrompt: '-- Select Your District --',
    selectMonthPrompt: '-- Select Planting Month --',
    detectGps: 'Detect GPS Location',
    detectingGps: 'Detecting...',
    gpsDetected: 'GPS Coordinates Active',
    landExtent: 'Land Extent (Acres)',
    targetCrop: 'Target Crop to Plant',
    cropPlaceholder: 'Type or select any crop (e.g. Rice, Onion, Tomato, Green Chili, Tea, Maize)...',
    plantingMonth: 'Planting Month',
    evaluateBtn: 'Evaluate Crop Suitability',
    reEvaluateBtn: 'Re-Evaluate / Update Parameters',
    evaluatingBtn: 'Evaluating Agro-Climatic & Market Feasibility...',
    
    // In-form Loading & Success
    loadingAnalysisTitle: 'Analyzing Agro-Climatic & Nationwide Market Dynamics...',
    loadingAnalysisSub: 'Evaluating soil moisture, weather forecast, and island-wide wholesale market trends across Manning, Dambulla, Regional DECs, and Supermarket hubs.',
    evalReady: 'Evaluation Ready',
    viewResultsBelow: 'View Full Analysis & Guide Below',
    statusRecommended: 'Recommended for Cultivation',
    statusNotRecommended: 'Not Recommended (Alternatives Provided)',
    match: 'Match',
    
    // Results
    agronomicEvaluation: 'Agronomic & Climate Evaluation',
    marketEconomicsTitle: 'Harvest-Time Market Economics & National Supply Assessment',
    marketEconomicsSubtitle: 'Comprehensive island-wide price intelligence across Sri Lanka Dedicated Economic Centers, Manning terminal hub, and retail consumers.',
    nationalOutlook: 'National Supply-Demand Outlook:',
    importPolicy: 'Import Tariffs & SCL Protections:',
    farmerStrategy: 'Recommended Farmer Sales Strategy:',
    
    // Price cards
    colomboManning: 'Colombo Manning Market',
    manningSub: 'Western Province Terminal Consumption Hub',
    dambullaDec: 'Dambulla DEC',
    dambullaSub: 'Central Island Wholesale Redistribution Hub',
    regionalDecs: 'Regional DECs',
    regionalDecsSub: 'Thambuttegama / Keppetipola / Meegoda / Jaffna',
    supermarketContract: 'Supermarket Contract Price',
    supermarketSub: 'Direct Farmgate Purchasing (Cargills / Keells)',
    islandWideRetail: 'Island-wide Retail Range',
    retailSub: 'Consumer Retail Pricing across 9 Provinces',
    
    // Financial metrics
    expectedHarvestMonth: 'Expected Harvest Month',
    projectedWholesalePrice: 'Projected Wholesale Price',
    nationalWholesaleAvg: 'National Wholesale Average across Island-wide DECs',
    productionCost: 'Production Cost',
    estimatedNetProfit: 'Estimated Net Profit',
    
    // Unsuitable box
    whyNotRecommended: 'Specific Reasons Why This Crop is Not Recommended:',
    
    // Alternatives
    altCropsTitle: 'High-Yield Suitable Crops Recommended for Your Land:',
    altCropsSubtitle: 'These alternative crops command strong national wholesale demand and thrive under current local weather. Click any crop below to view its complete Cultivation Guide.',
    selectAndGuide: 'Select & View Cultivation Guide',
    viewMarketAndGuide: 'View Market Prices & Cultivation Roadmap',
    viewDetailsBtn: 'View Market Prices & Guidelines',
    hideDetailsBtn: 'Close / Hide Details',
    viewingDetailsFor: 'Complete Market Economics & Cultivation Roadmap',
    activeDossierTitle: 'Master Economic Assessment & Cultivation Roadmap',
    activeDossierSub: 'Comprehensive harvest-time price intelligence across Sri Lanka and DOA agronomic extension roadmap.',
    
    // Cultivation Guide
    masterRoadmap: 'Master Cultivation Roadmap',
    doaGuidelines: 'Department of Agriculture (DOA - Sri Lanka) Master Agronomic Extension Guidelines',
    printRoadmap: 'Print / Save Roadmap',
    cropSpecs: 'DOA Official Crop Specifications',
    recVarieties: 'Recommended Varieties',
    seedRate: 'Seed Requirement',
    spacing: 'Field Spacing',
    soilDolomite: 'Soil & Dolomite',
    
    // Guide Stages
    instructionsHeading: 'Detailed Practical Step-by-Step Field Instructions:',
    fertilizerHeading: 'DOA Standard Fertilizer Application Schedule:',
    ipmHeading: 'Integrated Pest & Disease Management (IPM):',
    waterHeading: 'Water & Drainage Management:',
    
    // Disease Detection
    diseaseTitle: 'AI Crop Disease Detection',
    dsDivision: 'Divisional Secretariat Division (DS Division)',
    selectDsDivision: 'Select DS Division',
    selectDsDivisionPrompt: '-- Select Your DS Division --',
    selectDistrictFirst: '-- First Select Your District --',
    uploadPhoto: 'Upload Leaf Photo',
    uploadLandPhoto: 'Upload Land Photo',
    dragDrop: 'Drag and drop image here or browse files',
    detectDiseaseBtn: 'Diagnose Plant Disease',
    diagnosisResult: 'Diagnosis Results',
    severity: 'Severity',
    confidence: 'Confidence',
    symptoms: 'Observed Symptoms',
    causes: 'Underlying Causes',
    chemicalTreatment: 'Approved Chemical Remedies',
    organicTreatment: 'Organic & Bio-Control Remedies',
    preventionTips: 'Field Prevention Measures',
    
    // Landing
    welcomeTo: 'Welcome to',
    smartFarming: 'Smart Farming',
    welcomeSub: 'Smart farming made simple — crop recommendations, plant disease detection, and expert agricultural advice.',
    cropRecCardDesc: 'Find the most profitable and suitable crops for your land location.',
    soilClimateTag: 'Soil & Climate',
    diseaseDetCardDesc: 'Upload a diseased leaf photo for instant identification and treatment.',
    aiVisionTag: 'AI Vision',

    // Disease Detection
    uploadOnlyNotice: 'Please upload ONLY a clear, close-up photo of the affected plant leaf for accurate AI diagnosis.',
    followStepsNotice: 'Follow the simple steps below:',
    plantNameLabel: 'Affected Plant / Crop Name:',
    plantNamePlaceholder: 'e.g. Paddy, Grapes, Turmeric, Strawberry, Mango, Banana, Onion, Corn, Carrot, Ladiesfingers...',
    step1Title: 'Take a Clear Leaf Photo',
    step1Desc: 'Focus closely on a single affected leaf with good natural lighting.',
    step2Title: 'Upload Leaf Image',
    step2Desc: 'Click the button below or drag & drop the photo into the box.',
    chooseImgDevice: 'Choose Leaf Image from Device',
    uploadLeafImage: 'Upload Plant Leaf Image',
    removePhoto: 'Remove Photo',
    detectDisease: 'Detect Disease',
    analyzingImage: 'Analyzing Leaf with Gemini Vision...',
    uploadAnotherPhoto: 'Upload Another Leaf Photo',
    leafOnlyNotice: 'Note: Please upload plant leaf photos only. Non-leaf or unclear images cannot be processed.',
    medicinesAndRemedies: 'Recommended Medicines & Treatment',
    dosageAndUsage: 'Dosage & Application Instructions',
    organicRemedies: 'Organic & Bio-Control Alternatives',
    detectionFailedTitle: 'Could Not Process Image',
    detectionFailedDesc: 'Gemini was unable to diagnose this image:',

    // Cultivation Guide
    smartGuideTitle: 'Smart Cultivation Guide',
    smartGuideSub: 'Get a detailed, AI-generated step-by-step farming plan tailored for your location.',
    selectCrop: 'Select Crop',
    yourLocation: 'Your Location',
    clickGpsToDetect: 'Click GPS to detect',
    generateGuideBtn: 'Generate Cultivation Guide',
    generatingGuide: 'Generating Guide...',

    // Market Predictions
    marketPredTitle: 'Market Price Predictions',
    marketPredSub: 'AI-driven price forecasts based on Sri Lankan market data to help you sell at the right time.',
    selectCropMarket: 'Select Crop for Market Analysis',
    getForecastBtn: 'Get Forecast',
    analyzingMarket: 'Analyzing...',
    dataReferences: 'Data references:',

    // Chat Widget - Crop Recommendation
    chatTitle: 'AgriSense AI Assistant',
    chatSubtitle: 'Agricultural guidance only • Crops, fertilizers, diseases & farming',
    chatPlaceholder: 'Ask an agriculture or farming question (e.g. fertilizer for chili)...',
    chatWelcome: '**Hello!** I am your AgriSense AI Agricultural Advisor.\n\nI am exclusively dedicated to helping farmers with agriculture:\n* Crop varieties and Maha/Yala planting guides\n* DOA recommended fertilizer schedules\n* Pest and disease treatments\n* Market prices and harvesting advice',

    // Chat Widget - Disease Detection
    diseaseChatTitle: 'AI Plant Doctor',
    diseaseChatPlaceholder: 'Ask about leaf symptoms, pest diagnosis, remedies (e.g. cure for tomato blight)...',
    diseaseChatWelcome: '**Hello!** I am your AgriSense AI Plant Doctor & Crop Pathologist.\n\nI am exclusively dedicated to plant health and crop pathology:\n* Leaf spots, curling, wilting, and yellowing\n* Fungal, bacterial, and viral pathogen diagnosis\n* Department of Agriculture (DOA) chemical & organic treatments\n* Preventive spray schedules & field sanitation',

    // Profile Page
    farmerProfile: 'Farmer Profile',
    farmerProfileSub: 'Manage your agricultural credentials, contact information, and farm parameters.',
    profileUpdatedSuccess: 'Profile information updated successfully!',
    hi: 'Hi',
    regFarmerBadge: 'Registered Sri Lankan Farmer',
    cultivatedLand: 'Cultivated Land',
    acres: 'Acres',
    farmingExp: 'Farming Experience',
    years: 'Years',
    primaryCrops: 'Primary Crops',
    farmerAccountDetails: 'Farmer Account Details',
    editDetails: 'Edit Details',
    cancelEdit: 'Cancel Edit',
    fullName: 'Full Name',
    emailAddress: 'Email Address',
    phoneNumber: 'Phone Number',
    agriDistrict: 'Agricultural District (25 Districts)',
    landSizeAcres: 'Land Size (Acres)',
    primaryCultivatedCrops: 'Primary Cultivated Crops',
    primaryCropsPlaceholder: 'e.g. Rice (Paddy), Coconut, Tomato',
    saveChanges: 'Save Profile Changes',
    changePhotoTitle: 'Change Profile Picture',
    chooseFromGallery: 'Choose from Gallery',
    currentPhoto: 'Current Photo',
    photoOptimizeNote: 'Supports PNG, JPG, or WEBP. Image is automatically optimized.',
    resetToDefaultPhoto: 'Reset to Default Photo',
    close: 'Close',

    // Weather Widget
    weatherForecast: 'Weather Forecast',
    sriLanka: 'Sri Lanka',
    today: 'Today',
    loadingWeather: 'Loading weather...'
  },
  
  සිංහල: {
    // Header & Nav
    home: 'මුල් පිටුව',
    cropRecommendation: 'බෝග නිර්දේශය',
    diseaseDetection: 'රෝග හඳුනාගැනීම',
    cultivationGuide: 'වගා මාර්ගෝපදේශය',
    marketPredictions: 'වෙළඳපල පුරෝකථනය',
    profile: 'මගේ ගිණුම',
    login: 'ඇතුල් වන්න',
    createAccount: 'ගිණුමක් සාදන්න',
    logout: 'ඉවත් වන්න',
    selectLanguage: 'භාෂාව තෝරන්න',
    farmerRole: 'ගොවි මහතා',
    adminDashboard: 'පරිපාලක පුවරුව',
    
    // Crop Analysis - Form
    cropAnalysisTitle: 'නිවැරදි බෝග යෝග්‍යතා ඇගයීම සහ පූර්ණ වගා මාර්ගෝපදේශය',
    cropAnalysisSubtitle: 'ශ්‍රී ලංකා කෘෂිකර්ම දෙපාර්තමේන්තුවේ (DOA) නිල වගා නිර්දේශ සහ දිවයින පුරා ආර්ථික මධ්‍යස්ථානවල තොග වෙළඳපල මිල විශ්ලේෂණය.',
    selectDistrict: 'ඔබේ දිස්ත්‍රික්කය තෝරන්න',
    selectDistrictPrompt: '-- ඔබේ දිස්ත්‍රික්කය තෝරන්න --',
    selectMonthPrompt: '-- වගා කරන මාසය තෝරන්න --',
    detectGps: 'GPS මඟින් පිහිටීම ලබාගන්න',
    detectingGps: 'ස්ථානය සොයමින්...',
    gpsDetected: 'GPS ස්ථානය සක්‍රීයයි',
    landExtent: 'වගාබිම් ප්‍රමාණය (අක්කර)',
    targetCrop: 'වගා කිරීමට අපේක්ෂිත බෝගය',
    cropPlaceholder: 'බෝගයේ නම ඇතුළත් කරන්න (උදා: වී, ලොකු ළුණු, තක්කාලි, අමු මිරිස්, බඩඉරිඟු)...',
    plantingMonth: 'වගා කරන මාසය',
    evaluateBtn: 'බෝග යෝග්‍යතාවය පරීක්ෂා කරන්න',
    reEvaluateBtn: 'නැවත පරීක්ෂා කරන්න / තොරතුරු වෙනස් කරන්න',
    evaluatingBtn: 'දේශගුණික හා වෙළඳපල තොරතුරු විශ්ලේෂණය කරමින්...',
    
    // In-form Loading & Success
    loadingAnalysisTitle: 'දේශගුණය සහ දීපව්‍යාප්ත වෙළඳපල තොරතුරු විශ්ලේෂණය කෙරේ...',
    loadingAnalysisSub: 'පාංශු තෙතමනය, කාලගුණ අනාවැකි සහ කොළඹ මැනිං, දඹුල්ල, ප්‍රාදේශීය ආර්ථික මධ්‍යස්ථාන හා සුපිරි වෙළඳසැල් තොග මිල පරික්ෂා කෙරේ.',
    evalReady: 'ඇගයීම් ප්‍රතිඵල සූදානම්',
    viewResultsBelow: 'සම්පූර්ණ විස්තරය සහ වගා මාර්ගෝපදේශය පහතින් බලන්න',
    statusRecommended: 'වගාව සඳහා ඉතා යෝග්‍යයි',
    statusNotRecommended: 'වගාව නිර්දේශ නොකෙරේ (විකල්ප බෝග සපයා ඇත)',
    match: 'ගැලපීම',
    
    // Results
    agronomicEvaluation: 'දේශගුණික හා කෘෂිකාර්මික ඇගයීම',
    marketEconomicsTitle: 'අස්වනු නෙලන කාලයේ දීපව්‍යාප්ත වෙළඳපල ආර්ථිකය හා මිල විශ්ලේෂණය',
    marketEconomicsSubtitle: 'දඹුල්ල පමණක් නොව කොළඹ මැනිං, ප්‍රාදේශීය ආර්ථික මධ්‍යස්ථාන, සුපිරි වෙළඳසැල් සහ දිවයින පුරා සිල්ලර මිල පිළිබඳ පූර්ණ විග්‍රහය.',
    nationalOutlook: 'ජාතික සැපයුම් සහ ඉල්ලුම් පුරෝකථනය:',
    importPolicy: 'රජයේ ආනයන බදු සහ තීරුබදු බලපෑම:',
    farmerStrategy: 'ගොවියාට වැඩිම ලාභයක් සඳහා අලෙවි උපායමාර්ගය:',
    
    // Price cards
    colomboManning: 'කොළඹ මැනිං / පෑලියගොඩ තොග වෙළඳපල',
    manningSub: 'බස්නාහිර පළාතේ ප්‍රධාන පරිභෝජන කේන්ද්‍රස්ථානය',
    dambullaDec: 'දඹුල්ල ආර්ථික මධ්‍යස්ථානය',
    dambullaSub: 'දිවයිනේ මධ්‍යම තොග ප්‍රතිනැව්ගත කිරීමේ මධ්‍යස්ථානය',
    regionalDecs: 'ප්‍රාදේශීය ආර්ථික මධ්‍යස්ථාන',
    regionalDecsSub: 'තඹුත්තේගම / කැප්පෙටිපොළ / මීගොඩ / යාපනය ආදී',
    supermarketContract: 'සුපිරි වෙළඳසැල් ගිවිසුම් මිල',
    supermarketSub: 'සෘජු ගොවිපල මිලදී ගැනීම් (Cargills / Keells)',
    islandWideRetail: 'දිවයින පුරා සිල්ලර මිල පරාසය',
    retailSub: 'පළාත් 9ම පාරිභෝගික සාමාන්‍ය සිල්ලර මිල',
    
    // Financial metrics
    expectedHarvestMonth: 'අපේක්ෂිත අස්වනු නෙලන මාසය',
    projectedWholesalePrice: 'අපේක්ෂිත තොග මිල',
    nationalWholesaleAvg: 'දිවයින පුරා ආර්ථික මධ්‍යස්ථානවල සාමාන්‍ය තොග මිල',
    productionCost: 'අක්කරයක නිෂ්පාදන වියදම',
    estimatedNetProfit: 'අපේක්ෂිත ශුද්ධ ලාභය',
    
    // Unsuitable box
    whyNotRecommended: 'මෙම බෝගය මෙම කාලයේ නිර්දේශ නොකිරීමට ප්‍රධාන හේතු:',
    
    // Alternatives
    altCropsTitle: 'ඔබේ ඉඩමට සහ කාලගුණයට වඩාත් ගැලපෙන විකල්ප බෝග:',
    altCropsSubtitle: 'මෙම බෝග සඳහා ඉහළ දීපව්‍යාප්ත වෙළඳපල ඉල්ලුමක් පවතින අතර ඔබේ දිස්ත්‍රික්කයේ දේශගුණයට මනාව ගැලපේ. සම්පූර්ණ වගා උපදෙස් බැලීමට බෝගයක් තෝරන්න.',
    selectAndGuide: 'තෝරාගෙන වගා මාර්ගෝපදේශය බලන්න',
    viewMarketAndGuide: 'වෙළඳපල මිල ගණන් සහ වගා මාර්ගෝපදේශය බලන්න',
    viewDetailsBtn: 'වෙළඳපල මිල ගණන් සහ මාර්ගෝපදේශ බලන්න',
    hideDetailsBtn: 'විස්තර වසන්න',
    viewingDetailsFor: 'සම්පූර්ණ වෙළඳපල ආර්ථික විශ්ලේෂණය සහ වගා මාර්ගෝපදේශය',
    activeDossierTitle: 'පූර්ණ වෙළඳපල ආර්ථික විශ්ලේෂණය සහ වගා සැලැස්ම',
    activeDossierSub: 'දිවයින පුරා ආර්ථික මධ්‍යස්ථාන තොග මිල බිඳවැටුම සහ කෘෂිකර්ම දෙපාර්තමේන්තු වගා මාර්ගෝපදේශය.',
    
    // Cultivation Guide
    masterRoadmap: 'පූර්ණ වගා මාර්ගෝපදේශය',
    doaGuidelines: 'ශ්‍රී ලංකා කෘෂිකර්ම දෙපාර්තමේන්තුවේ නිල ක්ෂේත්‍ර ව්‍යාප්ති නිර්දේශ',
    printRoadmap: 'මාර්ගෝපදේශය මුද්‍රණය / සුරකින්න',
    cropSpecs: 'කෘෂිකර්ම දෙපාර්තමේන්තු නිල බෝග පිරිවිතර',
    recVarieties: 'නිර්දේශිත ප්‍රභේද',
    seedRate: 'බීජ අවශ්‍යතාවය',
    spacing: 'ක්ෂේත්‍ර පරතරය',
    soilDolomite: 'පස සහ ඩොලමයිට්',
    
    // Guide Stages
    instructionsHeading: 'ප්‍රායෝගික ක්ෂේත්‍ර උපදෙස් සහ පියවර:',
    fertilizerHeading: 'කෘෂිකර්ම දෙපාර්තමේන්තු නිල පොහොර නිර්දේශය:',
    ipmHeading: 'ඒකාබද්ධ පළිබෝධ, රෝග සහ වල් මර්දනය:',
    waterHeading: 'ජල සම්පාදනය සහ ජලාපවහන කළමනාකරණය:',
    
    // Disease Detection
    diseaseTitle: 'AI බෝග රෝග විනිශ්චය පද්ධතිය',
    dsDivision: 'ප්‍රාදේශීය ලේකම් කොට්ඨාසය (DS Division)',
    selectDsDivision: 'ප්‍රාදේශීය ලේකම් කොට්ඨාසය තෝරන්න',
    selectDsDivisionPrompt: '-- ඔබගේ ප්‍රාදේශීය ලේකම් කොට්ඨාසය තෝරන්න --',
    selectDistrictFirst: '-- ප්‍රථමයෙන් ඔබගේ දිස්ත්‍රික්කය තෝරන්න --',
    uploadPhoto: 'පත්‍රයේ ඡායාරූපය ඇතුළත් කරන්න',
    uploadLandPhoto: 'ඉඩමේ / පසෙහි ඡායාරූපය ඇතුළත් කරන්න',
    dragDrop: 'ඡායාරූපය මෙතැනට දමන්න හෝ තෝරන්න',
    detectDiseaseBtn: 'රෝගය පරීක්ෂා කරන්න',
    diagnosisResult: 'රෝග විනිශ්චය ප්‍රතිඵලය',
    severity: 'හානියේ තීව්‍රතාව',
    confidence: 'නිරවද්‍යතාව',
    symptoms: 'ක්ෂේත්‍ර රෝග ලක්ෂණ',
    causes: 'රෝගයට හේතුකාරක',
    chemicalTreatment: 'අනුමත රසායනික ප්‍රතිකාර',
    organicTreatment: 'කාබනික හා ස්වභාවික පිළියම්',
    preventionTips: 'ක්ෂේත්‍ර ආරක්ෂණ උපදෙස්',

    // Landing
    welcomeTo: 'සාදරයෙන් පිළිගනිමු -',
    smartFarming: 'ස්මාර්ට් ගොවිතැනට',
    welcomeSub: 'ස්මාර්ට් කෘෂිකර්මාන්තය පහසු කරයි — නිවැරදි බෝග නිර්දේශ, පත්‍ර රෝග විනිශ්චය සහ ප්‍රවීණ කෘෂි උපදෙස්.',
    cropRecCardDesc: 'ඔබේ ඉඩමේ පිහිටීමට වඩාත්ම ලාභදායී සහ සුදුසු බෝග සොයාගන්න.',
    soilClimateTag: 'පස සහ දේශගුණය',
    diseaseDetCardDesc: 'ක්ෂණිකව රෝගය හඳුනාගෙන ප්‍රතිකාර ලබාගැනීමට රෝගී පත්‍රයක ඡායාරූපයක් එක්කරන්න.',
    aiVisionTag: 'කෘත්‍රිම බුද්ධිය (AI)',

    // Disease Detection
    uploadOnlyNotice: 'නිරවද්‍ය රෝග විනිශ්චයක් සඳහා කරුණාකර රෝගය වැළඳී ඇති ශාක පත්‍රයේ පමණක් (Leaf Only) පැහැදිලි ඡායාරූපයක් උඩුගත කරන්න.',
    followStepsNotice: 'පහත සරල පියවර අනුගමනය කරන්න:',
    plantNameLabel: 'රෝගය වැළඳුණු ශාකය / බෝගයේ නම:',
    plantNamePlaceholder: 'උදා: වී/ගොයම්, මිදි, කහ, ස්ට්‍රෝබෙරි, අඹ, කෙසෙල්, ලූණු, ඉරිඟු, කැරට්, බණ්ඩක්කා...',
    step1Title: 'පැහැදිලි පත්‍ර ඡායාරූපයක් ගන්න',
    step1Desc: 'ස්වභාවික ආලෝකයේදී රෝග ලක්ෂණ ඇති කොළය පමණක් සමීපව ඡායාරූපගත කරන්න.',
    step2Title: 'පත්‍රයේ ඡායාරූපය එක්කරන්න',
    step2Desc: 'පහත බොත්තම ඔබා හෝ ඡායාරූපය මෙතැනට ඇද දමන්න.',
    chooseImgDevice: 'පත්‍රයේ ඡායාරූපයක් උපාංගයෙන් තෝරන්න',
    uploadLeafImage: 'බෝගයේ පත්‍ර ඡායාරූපය එක්කරන්න',
    removePhoto: 'ඡායාරූපය ඉවත් කරන්න',
    detectDisease: 'රෝගය පරීක්ෂා කරන්න',
    analyzingImage: 'Gemini Vision මඟින් පත්‍රය පරීක්ෂා කරමින්...',
    uploadAnotherPhoto: 'වෙනත් පත්‍ර ඡායාරූපයක් තෝරන්න',
    leafOnlyNotice: 'විශේෂ දැනුම්දීම: කරුණාකර ශාක පත්‍රවල ඡායාරූප පමණක් ලබාදෙන්න. කොළ නොවන හෝ අපැහැදිලි පින්තූර පරීක්ෂා කළ නොහැක.',
    medicinesAndRemedies: 'නිර්දේශිත ඖෂධ සහ ප්‍රතිකාර',
    dosageAndUsage: 'ඖෂධ මාත්‍රාව සහ යෙදීමේ උපදෙස්',
    organicRemedies: 'කාබනික සහ ස්වභාවික විකල්ප ප්‍රතිකාර',
    detectionFailedTitle: 'ඡායාරූපය පරීක්ෂා කිරීමට නොහැකි විය',
    detectionFailedDesc: 'Gemini AI හට මෙම ඡායාරූපය පරීක්ෂා කිරීමට නොහැකි වීමට හේතුව:',

    // Cultivation Guide
    smartGuideTitle: 'ස්මාර්ට් වගා මාර්ගෝපදේශය',
    smartGuideSub: 'ඔබේ ප්‍රදේශයට සරිලන පරිදි සැකසූ පියවරෙන් පියවර සම්පූර්ණ වගා සැලැස්ම ලබාගන්න.',
    selectCrop: 'බෝගය තෝරන්න',
    yourLocation: 'ඔබේ පිහිටීම',
    clickGpsToDetect: 'GPS මඟින් පිහිටීම ලබාගන්න',
    generateGuideBtn: 'වගා මාර්ගෝපදේශය සකසන්න',
    generatingGuide: 'මාර්ගෝපදේශය සකසමින්...',

    // Market Predictions
    marketPredTitle: 'වෙළඳපල මිල පුරෝකථනය',
    marketPredSub: 'නියම වේලාවට ඉහළම ලාභයකින් අස්වැන්න අලෙවි කරගැනීමට ශ්‍රී ලංකාවේ වෙළඳපල දත්ත ඇසුරින් සකසන ලද මිල පුරෝකථන.',
    selectCropMarket: 'මිල විශ්ලේෂණය සඳහා බෝගය තෝරන්න',
    getForecastBtn: 'මිල පුරෝකථනය ලබාගන්න',
    analyzingMarket: 'විශ්ලේෂණය කරමින්...',
    dataReferences: 'දත්ත මූලාශ්‍ර:',

    // Chat Widget - Crop Recommendation
    chatTitle: 'AgriSense AI සහයක',
    chatSubtitle: 'කෘෂිකාර්මික උපදෙස් සඳහා පමණි • බෝග, පොහොර, රෝග සහ ගොවිතැන',
    chatPlaceholder: 'කෘෂිකාර්මික හෝ වගා ගැටලුවක් විමසන්න (උදා: මිරිස් වගාවට පොහොර)...',
    chatWelcome: '**ආයුබෝවන්!** මම ඔබගේ AgriSense AI කෘෂිකාර්මික උපදේශක සහයකයා වෙමි.\n\nමම සම්පූර්ණයෙන්ම කැපවී සිටින්නේ කෘෂිකර්මාන්තය සහ ගොවිතැන් කටයුතු සඳහා පමණි:\n* බෝග ප්‍රභේද සහ මාස් / යල කන්නයේ වගා උපදෙස්\n* කෘෂිකර්ම දෙපාර්තමේන්තු අනුමත පොහොර නිර්දේශ\n* පළිබෝධ හා රෝග මර්දන ක්‍රම\n* අස්වනු නෙලීම හා වෙළඳපල මිල ගණන්',

    // Chat Widget - Disease Detection
    diseaseChatTitle: 'AI බෝග වෛද්‍ය සහයක',
    diseaseChatPlaceholder: 'පත්‍රයේ රෝග ලක්ෂණ, පළිබෝධ හා ප්‍රතිකාර විමසන්න (උදා: තක්කාලි අංගමාරුව)...',
    diseaseChatWelcome: '**ආයුබෝවන්!** මම ඔබගේ AgriSense AI බෝග වෛද්‍ය සහ රෝග විශේෂඥ සහයකයා වෙමි.\n\nමම සම්පූර්ණයෙන්ම කැපවී සිටින්නේ ශාක රෝග හා බෝග සෞඛ්‍යය සඳහා පමණි:\n* පත්‍ර ලප, කොළ කොඩවීම, කහවීම සහ මැළවීම\n* දිලීර, බැක්ටීරියා සහ වෛරස් රෝග හඳුනාගැනීම\n* කෘෂිකර්ම දෙපාර්තමේන්තු අනුමත දිලීර නාශක හා කෘමිනාශක නිර්දේශ\n* කාබනික ප්‍රතිකාර සහ වගා ආරක්ෂණ උපදෙස්',

    // Profile Page
    farmerProfile: 'ගොවි ගිණුම',
    farmerProfileSub: 'ඔබගේ කෘෂිකාර්මික තොරතුරු, සබඳතා සහ ගොවිපල දත්ත කළමනාකරණය කරන්න.',
    profileUpdatedSuccess: 'ගිණුමේ තොරතුරු සාර්ථකව යාවත්කාලීන විය!',
    hi: 'ආයුබෝවන්',
    regFarmerBadge: 'ලියාපදිංචි ශ්‍රී ලාංකික ගොවි මහතා',
    cultivatedLand: 'වගා කළ ඉඩම',
    acres: 'අක්කර',
    farmingExp: 'ගොවිතැන් පළපුරුද්ද',
    years: 'වසර',
    primaryCrops: 'ප්‍රධාන බෝග',
    farmerAccountDetails: 'ගොවි ගිණුම් විස්තර',
    editDetails: 'තොරතුරු සංස්කරණය',
    cancelEdit: 'අවලංගු කරන්න',
    fullName: 'සම්පූර්ණ නම',
    emailAddress: 'විද්‍යුත් තැපෑල',
    phoneNumber: 'දුරකථන අංකය',
    agriDistrict: 'කෘෂිකාර්මික දිස්ත්‍රික්කය (දිස්ත්‍රික්ක 25)',
    landSizeAcres: 'ඉඩම් ප්‍රමාණය (අක්කර)',
    primaryCultivatedCrops: 'වගා කරන ප්‍රධාන බෝග',
    primaryCropsPlaceholder: 'උදා: වී/ගොයම්, පොල්, තක්කාලි',
    saveChanges: 'වෙනස්කම් සුරකින්න',
    changePhotoTitle: 'පැතිකඩ ඡායාරූපය වෙනස් කරන්න',
    chooseFromGallery: 'ගැලරියෙන් ඡායාරූපයක් තෝරන්න',
    currentPhoto: 'දැනට ඇති ඡායාරූපය',
    photoOptimizeNote: 'PNG, JPG හෝ WEBP සඳහා සහය දක්වයි. ඡායාරූපය ස්වයංක්‍රීයව ප්‍රශස්ත කරනු ලැබේ.',
    resetToDefaultPhoto: 'මුල් ඡායාරූපය යොදන්න',
    close: 'වසන්න',

    // Weather Widget
    weatherForecast: 'කාලගුණ අනාවැකිය',
    sriLanka: 'ශ්‍රී ලංකාව',
    today: 'අද',
    loadingWeather: 'කාලගුණය ලබාගනිමින්...'
  },
  
  தமிழ்: {
    // Header & Nav
    home: 'முகப்பு',
    cropRecommendation: 'பயிர் பரிந்துரை',
    diseaseDetection: 'நோய் கண்டறிதல்',
    cultivationGuide: 'பயிர்செய்கை வழிகாட்டி',
    marketPredictions: 'சந்தை முன்னறிவிப்பு',
    profile: 'சுயவிவரம்',
    login: 'உள்நுழைக',
    createAccount: 'கணக்கை உருவாக்கு',
    logout: 'வெளியேறு',
    selectLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்',
    farmerRole: 'விவசாயி',
    adminDashboard: 'நிர்வாக தளம்',
    
    // Crop Analysis - Form
    cropAnalysisTitle: 'துல்லியமான பயிர் பொருத்தம் மற்றும் பயிர்செய்கை வழிகாட்டி',
    cropAnalysisSubtitle: 'இலங்கை விவசாயத் திணைக்களத்தின் (DOA) உத்தியோகபூர்வ வழிகாட்டுதல்கள் மற்றும் நாடு தழுவிய சந்தை விலை பகுப்பாய்வு.',
    selectDistrict: 'மாவட்டத்தைத் தேர்ந்தெடுக்கவும்',
    selectDistrictPrompt: '-- உங்கள் மாவட்டத்தைத் தேர்ந்தெடுக்கவும் --',
    selectMonthPrompt: '-- பயிரிடும் மாதத்தைத் தேர்ந்தெடுக்கவும் --',
    detectGps: 'GPS மூலம் இருப்பிடத்தைக் கண்டறியவும்',
    detectingGps: 'கண்டறியப்படுகிறது...',
    gpsDetected: 'GPS இருப்பிடம் செயலில் உள்ளது',
    landExtent: 'நிலப்பரப்பு (ஏக்கர்)',
    targetCrop: 'பயிரிட உத்தேசித்துள்ள பயிர்',
    cropPlaceholder: 'பயிரின் பெயரை உள்ளிடவும் (எ.கா: நெல், வெங்காயம், தக்காளி, மிளகாய்)...',
    plantingMonth: 'பயிரிடும் மாதம்',
    evaluateBtn: 'பயிர் பொருத்தத்தை மதிப்பிடுக',
    reEvaluateBtn: 'மீண்டும் மதிப்பிடுக / மாற்றுக',
    evaluatingBtn: 'காலநிலை மற்றும் சந்தை நிலவரங்கள் பகுப்பாய்வு செய்யப்படுகின்றன...',
    
    // In-form Loading & Success
    loadingAnalysisTitle: 'காலநிலை மற்றும் நாடு தழுவிய சந்தை நிலவரங்கள் பகுப்பாய்வு செய்யப்படுகின்றன...',
    loadingAnalysisSub: 'மண் ஈரப்பதம், வானிலை முன்னறிவிப்பு மற்றும் கொழும்பு மேனிங், தம்புள்ளை, பிராந்திய சந்தைகளின் மொத்த விலைகள் சரிபார்க்கப்படுகின்றன.',
    evalReady: 'மதிப்பீட்டு முடிவுகள் தயார்',
    viewResultsBelow: 'முழுமையான வழிகாட்டியை கீழே காண்க',
    statusRecommended: 'பயிரிட மிகவும் பொருத்தமானது',
    statusNotRecommended: 'பரிந்துரைக்கப்படவில்லை (மாற்றுப் பயிர்கள் வழங்கப்பட்டுள்ளன)',
    match: 'பொருத்தம்',
    
    // Results
    agronomicEvaluation: 'விவசாய மற்றும் காலநிலை மதிப்பீடு',
    marketEconomicsTitle: 'அறுவடை கால நாடு தழுவிய சந்தை பொருளாதாரம் மற்றும் விலை பகுப்பாய்வு',
    marketEconomicsSubtitle: 'தம்புள்ளை மட்டுமல்லாது கொழும்பு மேனிங், பிராந்திய சந்தைகள் மற்றும் சில்லறை விலைகளின் விரிவான கண்ணோட்டம்.',
    nationalOutlook: 'தேசிய வழங்கல் மற்றும் தேவை கண்ணோட்டம்:',
    importPolicy: 'இறக்குமதி வரிகள் மற்றும் கட்டண பாதுகாப்பு:',
    farmerStrategy: 'அதிக லாபத்திற்கான விற்பனை உத்தி:',
    
    // Price cards
    colomboManning: 'கொழும்பு மேனிங் சந்தை',
    manningSub: 'மேல் மாகாண பிரதான நுகர்வு மையம்',
    dambullaDec: 'தம்புள்ளை பொருளாதார மையம்',
    dambullaSub: 'மத்திய மொத்த மறுபகிர்வு மையம்',
    regionalDecs: 'பிராந்திய பொருளாதார மையங்கள்',
    regionalDecsSub: 'தம்புள்ளை, தம்புத்தேகம, கப்பற்றிபொல, யாழ்ப்பாணம்',
    supermarketContract: 'சூப்பர் மார்க்கெட் ஒப்பந்த விலை',
    supermarketSub: 'நேரடி கொள்முதல் (Cargills / Keells)',
    islandWideRetail: 'நாடு தழுவிய சில்லறை விலை வரம்பு',
    retailSub: '9 மாகாணங்களின் நுகர்வோர் சில்லறை விலை',
    
    // Financial metrics
    expectedHarvestMonth: 'எதிர்பார்க்கப்படும் அறுவடை மாதம்',
    projectedWholesalePrice: 'எதிர்பார்க்கப்படும் மொத்த விலை',
    nationalWholesaleAvg: 'நாடு தழுவிய பொருளாதார மையங்களின் சராசரி மொத்த விலை',
    productionCost: 'ஏக்கருக்கான உற்பத்தி செலவு',
    estimatedNetProfit: 'எதிர்பார்க்கப்படும் நிகர லாபம்',
    
    // Unsuitable box
    whyNotRecommended: 'இந்த பயிர் பரிந்துரைக்கப்படாததற்கான முக்கிய காரணங்கள்:',
    
    // Alternatives
    altCropsTitle: 'உங்கள் நிலத்திற்கு மிகவும் பொருத்தமான மாற்றுப் பயிர்கள்:',
    altCropsSubtitle: 'இப்பயிர்கள் சந்தையில் அதிக தேவை கொண்டவை மற்றும் தற்போதைய காலநிலைக்கு ஏற்றவை. முழுமையான வழிகாட்டியைப் பார்க்க பயிரைத் தேர்ந்தெடுக்கவும்.',
    selectAndGuide: 'தேர்ந்தெடுத்து வழிகாட்டியைப் பார்க்கவும்',
    viewMarketAndGuide: 'சந்தை விலைகள் மற்றும் பயிர்ச்செய்கை வழிகாட்டலைப் பார்க்கவும்',
    viewDetailsBtn: 'சந்தை விலைகள் மற்றும் வழிகாட்டல்களைப் பார்க்கவும்',
    hideDetailsBtn: 'விவரங்களை மூடு',
    viewingDetailsFor: 'முழுமையான சந்தை பொருளாதார பகுப்பாய்வு மற்றும் பயிர்ச்செய்கை வழிகாட்டல்',
    activeDossierTitle: 'முழுமையான சந்தை பகுப்பாய்வு மற்றும் பயிர்ச்செய்கை திட்டம்',
    activeDossierSub: 'இலங்கை பொருளாதார மையங்களின் மொத்த விலை மற்றும் விவசாயத் திணைக்கள பயிர்ச்செய்கை வழிகாட்டல்.',
    
    // Cultivation Guide
    masterRoadmap: 'முழுமையான பயிர்செய்கை வழிகாட்டி',
    doaGuidelines: 'இலங்கை விவசாயத் திணைக்களத்தின் உத்தியோகபூர்வ வழிகாட்டல்கள்',
    printRoadmap: 'வழிகாட்டியை அச்சிட / சேமிக்க',
    cropSpecs: 'விவசாயத் திணைக்கள உத்தியோகபூர்வ பயிர் விபரங்கள்',
    recVarieties: 'பரிந்துரைக்கப்பட்ட வகைகள்',
    seedRate: 'விதை தேவை',
    spacing: 'இடைவெளி',
    soilDolomite: 'மண் மற்றும் டோலமைட்',
    
    // Guide Stages
    instructionsHeading: 'செயல்முறை கள அறிவுறுத்தல்கள் மற்றும் படிகள்:',
    fertilizerHeading: 'விவசாயத் திணைக்களத்தின் உரப் பரிந்துரை:',
    ipmHeading: 'ஒருங்கிணைந்த பூச்சி மற்றும் நோய் முகாமைத்துவம்:',
    waterHeading: 'நீர்ப்பாசனம் மற்றும் வடிகால் முகாமைத்துவம்:',
    
    // Disease Detection
    diseaseTitle: 'AI பயிர் நோய் கண்டறிதல்',
    dsDivision: 'பிரதேச செயலகப் பிரிவு (DS Division)',
    selectDsDivision: 'பிரதேச செயலகப் பிரிவைத் தேர்ந்தெடுக்கவும்',
    selectDsDivisionPrompt: '-- உங்கள் பிரதேச செயலகப் பிரிவைத் தேர்ந்தெடுக்கவும் --',
    selectDistrictFirst: '-- முதலில் உங்கள் மாவட்டத்தைத் தேர்ந்தெடுக்கவும் --',
    uploadPhoto: 'இலையின் புகைப்படத்தை பதிவேற்றவும்',
    uploadLandPhoto: 'நிலத்தின் புகைப்படத்தைப் பதிவேற்றவும்',
    dragDrop: 'படத்தை இங்கே இழுத்து விடவும் அல்லது தேர்ந்தெடுக்கவும்',
    detectDiseaseBtn: 'நோயைக் கண்டறியவும்',
    diagnosisResult: 'கண்டறிதல் முடிவுகள்',
    severity: 'தீவிரம்',
    confidence: 'துல்லியம்',
    symptoms: 'அறிகுறிகள்',
    causes: 'காரணங்கள்',
    chemicalTreatment: 'அங்கீகரிக்கப்பட்ட இரசாயன சிகிச்சை',
    organicTreatment: 'இயற்கை மற்றும் உயிரியல் முறைகள்',
    preventionTips: 'தடுப்பு நடவடிக்கைகள்',

    // Landing
    welcomeTo: 'வரவேற்கிறோம் -',
    smartFarming: 'ஸ்மார்ட் விவசாயம்',
    welcomeSub: 'நவீன விவசாயம் எளிதாக்கப்பட்டுள்ளது — துல்லியமான பயிர் பரிந்துரைகள், தாவர நோய் கண்டறிதல் மற்றும் விவசாய ஆலோசனைகள்.',
    cropRecCardDesc: 'உங்கள் நிலத்திற்கு மிகவும் இலாபகரமான மற்றும் பொருத்தமான பயிர்களைக் கண்டறியவும்.',
    soilClimateTag: 'மண் மற்றும் காலநிலை',
    diseaseDetCardDesc: 'உடனடி அடையாளம் காணல் மற்றும் சிகிச்சைக்கு பாதிக்கப்பட்ட இலையின் புகைப்படத்தைப் பதிவேற்றவும்.',
    aiVisionTag: 'செயற்கை நுண்ணறிவு (AI)',

    // Disease Detection
    uploadOnlyNotice: 'துல்லியமான நோயறிதலுக்கு பாதிக்கப்பட்ட தாவர இலையின் (Leaf Only) புகைப்படத்தை மட்டும் பதிவேற்றவும்.',
    followStepsNotice: 'கீழே உள்ள எளிய வழிமுறைகளைப் பின்பற்றவும்:',
    plantNameLabel: 'பாதிக்கப்பட்ட பயிர் / தாவரத்தின் பெயர்:',
    plantNamePlaceholder: 'எ.கா: நெல், திராட்சை, மஞ்சள், ஸ்ட்ராபெர்ரி, மாம்பழம், வாழை, வெங்காயம், மக்காச்சோளம், கேரட், வெண்டை...',
    step1Title: 'தெளிவான இலை படம் எடுக்கவும்',
    step1Desc: 'நல்ல வெளிச்சத்தில் பாதிக்கப்பட்ட இலையை மட்டும் நெருக்கமாகப் படம் பிடிக்கவும்.',
    step2Title: 'இலை படத்தைப் பதிவேற்றவும்',
    step2Desc: 'கீழே உள்ள பொத்தானைக் கிளிக் செய்யவும் அல்லது படத்தை இங்கே இழுத்து விடவும்.',
    chooseImgDevice: 'இலை புகைப்படத்தைத் தேர்ந்தெடுக்கவும்',
    uploadLeafImage: 'இலையின் புகைப்படத்தைப் பதிவேற்றவும்',
    removePhoto: 'புகைப்படத்தை நீக்கு',
    detectDisease: 'நோயைக் கண்டறியவும்',
    analyzingImage: 'Gemini Vision மூலம் இலை பகுப்பாய்வு செய்யப்படுகிறது...',
    uploadAnotherPhoto: 'மற்றொரு இலை புகைப்படத்தைப் பதிவேற்றவும்',
    leafOnlyNotice: 'குறிப்பு: தாவர இலைகளின் புகைப்படங்களை மட்டுமே பதிவேற்றவும். இலை அல்லாத அல்லது தெளிவற்ற படங்களை ஆய்வு செய்ய முடியாது.',
    medicinesAndRemedies: 'பரிந்துரைக்கப்பட்ட மருந்துகள் & சிகிச்சை',
    dosageAndUsage: 'மருந்து அளவு மற்றும் தெளிக்கும் முறைகள்',
    organicRemedies: 'இயற்கை மற்றும் உயிரியல் முறைகள்',
    detectionFailedTitle: 'படத்தை பகுப்பாய்வு செய்ய முடியவில்லை',
    detectionFailedDesc: 'Gemini AI இப் படத்தை ஆய்வு செய்ய முடியாததற்கான காரணம்:',

    // Cultivation Guide
    smartGuideTitle: 'ஸ்மார்ட் பயிர்செய்கை வழிகாட்டி',
    smartGuideSub: 'உங்கள் இருப்பிடத்திற்கு ஏற்ப உருவாக்கப்பட்ட படி படியான விவசாய திட்டத்தைப் பெறுங்கள்.',
    selectCrop: 'பயிரைத் தேர்ந்தெடுக்கவும்',
    yourLocation: 'உங்கள் இருப்பிடம்',
    clickGpsToDetect: 'GPS மூலம் கண்டறிய கிளிக் செய்க',
    generateGuideBtn: 'வழிகாட்டியை உருவாக்கவும்',
    generatingGuide: 'வழிகாட்டி உருவாக்கப்படுகிறது...',

    // Market Predictions
    marketPredTitle: 'சந்தை விலை முன்னறிவிப்பு',
    marketPredSub: 'சரியான நேரத்தில் அதிக லாபத்தில் அறுவடையை விற்பனை செய்ய இலங்கை சந்தை தரவுகளின் அடிப்படையில் முன்னறிவிப்புகள்.',
    selectCropMarket: 'சந்தை பகுப்பாய்விற்கான பயிரைத் தேர்ந்தெடுக்கவும்',
    getForecastBtn: 'முன்னறிவிப்பைப் பெறுங்கள்',
    analyzingMarket: 'பகுப்பாய்வு செய்யப்படுகிறது...',
    dataReferences: 'தரவு குறிப்புகள்:',

    // Chat Widget - Crop Recommendation
    chatTitle: 'AgriSense AI உதவியாளர்',
    chatSubtitle: 'விவசாய வழிகாட்டல் மட்டுமே • பயிர்கள், உரங்கள், நோய்கள் மற்றும் விவசாயம்',
    chatPlaceholder: 'விவசாயம் அல்லது பயிர் கேள்வியைக் கேளுங்கள்...',
    chatWelcome: '**வணக்கம்!** நான் உங்கள் AgriSense AI விவசாய ஆலோசகர்.\n\nவிவசாயம் மற்றும் பயிர் பாதுகாப்பு தொடர்பான விடயங்களில் மட்டுமே உதவ நான் தயாராக உள்ளேன்:\n* பயிர்கள் மற்றும் பருவ கால சாகுபடி வழிகாட்டல்\n* DOA பரிந்துரைக்கப்பட்ட உர அட்டவணைகள்\n* பூச்சி மற்றும் நோய் மேலாண்மை\n* சந்தை விலைகள் மற்றும் அறுவடை ஆலோசனைகள்',

    // Chat Widget - Disease Detection
    diseaseChatTitle: 'AI பயிர் மருத்துவர்',
    diseaseChatPlaceholder: 'இலை அறிகுறிகள், நோயறிதல் மற்றும் மருந்துகள் பற்றிக் கேளுங்கள்...',
    diseaseChatWelcome: '**வணக்கம்!** நான் உங்கள் AgriSense AI பயிர் நோய் மருத்துவர்.\n\nதாவர நோய்கள் மற்றும் பயிர் ஆரோக்கியத்திற்கு மட்டுமே நான் வழிகாட்டுகிறேன்:\n* இலைப்புள்ளி, சுருட்டல், மஞ்சள் நிறமாதல்\n* பூஞ்சை, பாக்டீரியா மற்றும் வைரஸ் நோய் கண்டறிதல்\n* விவசாயத் திணைக்கள அங்கீகரிக்கப்பட்ட மருந்துகள்\n* தடுப்பு தெளிப்பு அட்டவணைகள் மற்றும் பாதுகாப்பு',

    // Profile Page
    farmerProfile: 'விவசாயி சுயவிவரம்',
    farmerProfileSub: 'உங்கள் விவசாய சான்றுகள், தொடர்பு விவரங்கள் மற்றும் பண்ணை அளவீடுகளை நிர்வகிக்கவும்.',
    profileUpdatedSuccess: 'சுயவிவர தகவல்கள் வெற்றிகரமாக புதுப்பிக்கப்பட்டன!',
    hi: 'வணக்கம்',
    regFarmerBadge: 'பதிவுசெய்த இலங்கை விவசாயி',
    cultivatedLand: 'பயிரிடப்பட்ட நிலம்',
    acres: 'ஏக்கர்',
    farmingExp: 'விவசாய அனுபவம்',
    years: 'ஆண்டுகள்',
    primaryCrops: 'முக்கிய பயிர்கள்',
    farmerAccountDetails: 'விவசாயி கணக்கு விவரங்கள்',
    editDetails: 'விவரங்களை திருத்து',
    cancelEdit: 'ரத்துசெய்',
    fullName: 'முழு பெயர்',
    emailAddress: 'மின்னஞ்சல் முகவரி',
    phoneNumber: 'தொலைபேசி எண்',
    agriDistrict: 'விவசாய மாவட்டம் (25 மாவட்டங்கள்)',
    landSizeAcres: 'நில அளவு (ஏக்கர்)',
    primaryCultivatedCrops: 'பயிரிடப்படும் முதன்மை பயிர்கள்',
    primaryCropsPlaceholder: 'எ.கா: நெல், தென்னை, தக்காளி',
    saveChanges: 'மாற்றங்களை சேமிக்கவும்',
    changePhotoTitle: 'சுயவிவரப் படத்தை மாற்றவும்',
    chooseFromGallery: 'கேலரியில் இருந்து தேர்ந்தெடுக்கவும்',
    currentPhoto: 'தற்போதைய புகைப்படம்',
    photoOptimizeNote: 'PNG, JPG அல்லது WEBP ஆதரிக்கப்படுகிறது. படம் தானாகவே அளவமைக்கப்படும்.',
    resetToDefaultPhoto: 'இயல்புநிலை புகைப்படத்தை மீட்டமைக்க',
    close: 'மூடு',

    // Weather Widget
    weatherForecast: 'வானிலை முன்னறிவிப்பு',
    sriLanka: 'இலங்கை',
    today: 'இன்று',
    loadingWeather: 'வானிலை ஏற்றப்படுகிறது...'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('agrosense_selected_lang') || 'English';
  });

  const setLanguage = (newLang) => {
    setLanguageState(newLang);
    localStorage.setItem('agrosense_selected_lang', newLang);
  };

  const t = (key, fallbackText) => {
    const langDict = translations[language] || translations['English'];
    if (langDict && langDict[key] !== undefined) {
      return langDict[key];
    }
    const enDict = translations['English'];
    if (enDict && enDict[key] !== undefined) {
      return enDict[key];
    }
    return fallbackText || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, availableLanguages: ['English', 'සිංහල', 'தமிழ்'] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'English',
      setLanguage: () => {},
      t: (k, fb) => fb || k,
      availableLanguages: ['English', 'සිංහල', 'தமிழ்']
    };
  }
  return context;
};
