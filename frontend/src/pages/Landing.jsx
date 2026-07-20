import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useState } from "react";
import { useLang } from "../context/LanguageContext.jsx";
import { FiMenu, FiX, FiActivity, FiCalendar, FiShoppingCart, FiBarChart2, FiCheck, FiAward, FiWifi, FiScissors, FiSettings, FiInfo, FiDollarSign, FiFileText, FiMail, FiMapPin, FiPlay, FiUser, FiMessageSquare, FiTarget, FiSun, FiGlobe, FiUserPlus, FiPhone } from "react-icons/fi";

// Translation dictionary
const translations = {
  EN: {
    nav: { home: "Home", about: "About", services: "Services", pages: "Pages", blog: "Blog", contact: "Contact" },
    hero: {
      title: "AI technology for Sri Lankan agriculture",
      subtitle: "Get real-time weather-aware guidance, advanced crop intelligence, direct marketplace access to buyers, and your personal farming assistant — all intelligently tuned for local Sri Lankan fields, available in Sinhala, English, and Tamil, with a mobile-first design that works seamlessly on any device.",
      signup: "Sign up →",
      signin: "Sign in",
      openapp: "Open app →"
    },
    about: {
      kicker: "About Us",
      title: "Empowering Sri Lankan Farmers with Technology",
      desc: "Govi AI revolutionizes Sri Lankan farming with cutting-edge artificial intelligence. Our platform provides real-time weather forecasts, AI-driven crop health analysis, a direct marketplace for selling harvests, and personalized farming advice in Sinhala, English, and Tamil. Empowering farmers with data for better yields, sustainable practices, and higher profits.",
      feat1: "Sustainable Farming",
      feat1desc: "Promoting eco-friendly practices for long-term soil health and productivity",
      feat2: "Local Language Support",
      feat2desc: "Full multilingual support in Sinhala, English, and Tamil languages",
      learnmore: "Learn More",
      oldKicker: "OUR MISSION",
      oldTitle: "Digital Stewardship for Eco-friendly Growth",
      oldDesc: "At Govi AI, we believe that the health of the land is inextricably linked to the technology we use to tend it. Our 'Digital Stewardship' philosophy focuses on precise, data-backed decisions that minimize environmental footprint while maximizing farmer profitability.",
      oldFeat1: "Regenerative Practices",
      oldFeat1desc: "Integrating tech with soil regeneration techniques to build long-term land health.",
      oldFeat2: "Data Transparency",
      oldFeat2desc: "Full lifecycle visibility from seed to silo for enhanced consumer trust.",
      oldBtn: "Read Sustainability Report"
    },
    features: {
      advisor: "AI Advisor",
      adesc: "Ask about fertilizers, pests, prices, and seasonal practices.",
      weather: "Weather",
      wdesc: "GPS-based forecasts and alerts for irrigation planning.",
      market: "Marketplace",
      mdesc: "List harvests and connect with local buyers.",
      reports: "Reports",
      rdesc: "Crop health and yield insights with SHAP explainability."
    },
    services: {
      our: "Our services",
      title: "Empowering farmers with modern technology",
      integrated: "OUR SERVICES",
      intTitle: "Integrated Agricultural Solutions",
      intSub: "Precision tools designed for the modern grower, balancing yield optimization with ecological responsibility.",
      sol1: "Precision Crop Management",
      sol1desc: "Real-time data analytics and satellite imagery to optimize seed placement and fertilizer application at every acre.",
      sol2: "Livestock Health Monitoring",
      sol2desc: "Wearable IoT sensors and AI-driven monitoring to ensure the well-being and productivity of your herd 24/7.",
      sol3: "Sustainable Irrigation Systems",
      sol3desc: "Smart water delivery systems that reduce waste by up to 40% while maximizing soil hydration efficiency.",
      explore: "Explore Service →"
    },
    originalServices: {
      advisor: "AI advisor",
      adesc: "Ask about fertilizers, pests, prices, and seasonal practices — grounded in local context.",
      weather: "Weather forecast",
      wdesc: "GPS-based forecasts and alerts so you can plan irrigation and field work.",
      market: "Digital marketplace",
      mdesc: "List harvests, manage orders, and connect with buyers from one place.",
      intel: "Crop intelligence",
      idesc: "SHAP-backed recommendations and reports to understand what drives yield on your farm."
    },
    why: {
      title: "Why choose us?",
      product: "Product",
      assistant: "Assistant",
      weather: "Weather",
      marketplace: "Marketplace",
      reports: "Reports",
      company: "Company",
      about: "About",
      careers: "Careers",
      goal: "10,000+ active farmers (goal)",
      feature1: "Easy to use",
      f1desc: "Designed for smartphones — large tap targets, offline-friendly PWA install.",
      feature2: "Localized",
      f2desc: "Sri Lankan farming context with multilingual UI.",
      feature3: "Free to start",
      f3desc: "Core advisory and weather features without hidden fees."
    }
  },
  SI: {
    nav: { home: "මුල්", about: "අපි ගැන", services: "සේවා", pages: "පිටු", blog: "බ්ලොග්", contact: "සබඳතා" },
    hero: {
      title: "ශ්‍රී ලංකාවේ ගොවිතැන සඳහා AI තාක්ෂණය",
      subtitle: "ස්වයංක්‍රීයව තත්‍ය කාලීන කාලගුණ මත පදනම් වූ මාර්ගෝපදේශන, උසස් වගා බුද්ධිය, සෘජු ගෙවීම් කිරීමේ සුවිධාතා සහ ඔබේ පුද්ගලික ගොවිතැන් සහකාරිය — සියල්ල ශ්‍රී ලංකාවේ ස්ථානීය කුඹුරු සඳහා බුද්ධිමත්ව සිරිත, සිංහල, ඉංග්‍රීසි සහ දෙමළ භාෂාවන්හි ලබා ගත හැකි සහ ඕනෑම ගිණුමින් නිරවිරුද්ධව ක්‍රියා කරන ජංගම-ප්‍රථම සැලසුමක් සමඟ.",
      signup: "ලියාපදිංචි වන්න →",
      signin: "ප්‍රවේශ වන්න",
      openapp: "යෙදුම විවෘත කරන්න →"
    },
    about: {
      kicker: "අපි ගැන",
      title: "තාක්ෂණයෙන් ශ්‍රී ලංකාවේ ගොවීන්ට බල ගැන්වීම",
      desc: "ගොවි AI කපනු ඇති කෘතිම බුද්ධියෙන් ශ්‍රී ලංකාවේ ගොවිතැන විප්ලවයක් කරයි. අපගේ වේදිකාව තත්‍ය කාලීන කාලගුණ පුරෝකථන, AI මගින් පාලනය කරන ලද වගා සෞඛ්‍ය විශ්ලේෂණ, අස්වනු විකුණීම සඳහා සෘජු වෙළඳපොලක් සහ සිංහල, ඉංග්‍රීසි සහ දෙමළ භාෂාවන්හි පෞද්ගලික ගොවිතැන් උපදෙස් සපයයි. හොඳ අස්වනු, තිරසාර ප්‍රතිපත්ති සහ අධික ලාබ සඳහා දත්ත මගින් ගොවීන්ට බල ගැන්වීම.",
      feat1: "තිරසාර ගොවිතැන",
      feat1desc: "දීර්ග කාලීන පස් සෞඛ්‍යය සහ උත්පාදකත්වය සඳහා පාරිසරික හිතකාමී ප්‍රතිපත්ති ප්‍රවර්ධනය කිරීම",
      feat2: "ප්‍රදේශීය භාෂා සහය",
      feat2desc: "සිංහල, ඉංග්‍රීසි සහ දෙමළ භාෂාවන්හි සම්පූර්ණ බහු භාෂා සහය",
      learnmore: "වැඩි දැන ගන්න",
      oldKicker: "අපගේ මෙහෙයුම",
      oldTitle: "පාරිසරික හිතකාමී වර්ධනය සඳහා අංකීකරණය",
      oldDesc: "ගොවි AI හි, අපි භාවිතා කරන තාක්ෂණය සමඟ භූමියේ සෞඛ්‍යය අඛණ්ඩව සම්බන්ධ වේ යැයි විශ්වාස කරමු. අපගේ 'අංකීකරණ මෙහෙයුම්' දර්ශනය පාරිසරික අඩු කිරීමට සහ ගොවි ලාබය උපරිම කිරීමට ස්ථිර දත්ත මත පදනම් වූ තීරණ මත කෙන දක්වයි.",
      oldFeat1: "ප්‍රත්‍යුත්පාදන ප්‍රතිපත්ති",
      oldFeat1desc: "දීර්ග කාලීන භූමියේ සෞඛ්‍යය ගොඩනැගීම සඳහා තාක්ෂණය පස් ප්‍රත්‍යුත්පාදන ක්‍රම සමඟ ඒකාබද්ධ කිරීම.",
      oldFeat2: "දත්ත විනිවිදක බව",
      oldFeat2desc: "වැඩි පාරිභෝගික විශ්වාසය සඳහා බීජ සිට නිගමනය දක්වා සම්පූර්ණ ජීවන චක්‍රය දෘශ්‍යත්වය.",
      oldBtn: "තිරසාරත්ව වාර්තාව කියවන්න"
    },
    features: {
      advisor: "AI උපදේශකයා",
      adesc: "ආසව, පළි, මිල සහ කාල සාකච්ඡා පිළිබඳ අසන්න.",
      weather: "කාලගුණය",
      wdesc: "වාරි ජලය සැලසුම් කිරීම සඳහා GPS පදනම් පුරෝකථන සහ එසවීම්.",
      market: "වෙළඳපොල",
      mdesc: "අස්වනු ලැයිස්තු කර ප්‍රදේශීය ගණන්ගතයන් සමඟ සම්බන්ධ වන්න.",
      reports: "වාර්තා",
      rdesc: "SHAP පැහැදිලි කිරීම් සමඟ වගා සෞඛ්‍ය සහ අස්වනු තොරතුරු."
    },
    services: {
      our: "අපගේ සේවා",
      title: "නවීන තාක්ෂණයෙන් ගොවීන්ට බල ගැන්වීම",
      integrated: "අපගේ සේවා",
      intTitle: "එක්සත් ගොවිතැන් විසඳුම්",
      intSub: "නවීන ගොවියාට සැලසුම් කළ කාර්යක්ෂම මෙවලම්, පාරිසරික වගකීම සමඟ අස්වනු උපරිම කිරීම සමතුලනය.",
      sol1: "නිරවද්‍ය වගා කළමනාකරණය",
      sol1desc: "සෑම අකරයකම බීජ තැබීම සහ ආසව යොදවීම උපරිම කිරීමට තත්‍ය කාලීන දත්ත විශ්ලේෂණය සහ චන්ද්‍රිකා රූප.",
      sol2: "පශු සෞඛ්‍ය අධීක්ෂණය",
      sol2desc: "ඔබේ එළවළුවේ සුභ ස්ථිතිය සහ උත්පාදකත්වය දින 24ක් අධීක්ෂණය සඳහා පැහැදිලි IoT සංවේදක සහ AI මගින් පාලනය කරන ලද අධීක්ෂණය.",
      sol3: "තිරසාර වාරි ජල පද්ධති",
      sol3desc: "පස් ජලය උපරිම කළ හැසිරීමක් අතර 40% කින් අඩු කරන වාරි ජල පද්ධති.",
      explore: "සේවාව ගවේෂණය කරන්න →"
    },
    originalServices: {
      advisor: "AI උපදේශකයා",
      adesc: "ආසව, පළි, මිල සහ කාල සාකච්ඡා — ප්‍රදේශීය තත්ත්වය මත පදනම් වූවා.",
      weather: "කාලගුණ පුරෝකථනය",
      wdesc: "වාරි ජලය සහ ක්ෂේත්‍ර කාර්යයන් සැලසුම් කළ හැකි GPS පදනම් පුරෝකථන සහ එසවීම්.",
      market: "ඩිජිටල් වෙළඳපොල",
      mdesc: "අස්වනු ලැයිස්තු කර, නියෝග කළමනාකරණය කර, එක් තැනින් ගණන්ගතයන් සමඟ සම්බන්ධ වන්න.",
      intel: "වගා බුද්ධිය",
      idesc: "ඔබේ ගොවිතැනේ අස්වනු ගැන තේරුම් ගැනීමට SHAP මගින් සමරන ලද නිර්දේශ සහ වාර්තා."
    },
    why: {
      title: "අපි තෝරන්නේ ඇයි?",
      product: "නිෂ්පාදන",
      assistant: "උපදේශකයා",
      weather: "කාලගුණය",
      marketplace: "වෙළඳපොල",
      reports: "වාර්තා",
      company: "සමාගම",
      about: "අපි ගැන",
      careers: "රැකියා",
      goal: "ක්‍රියාකාරී ගොවීන් 10,000+ (අවස්ථාව)",
      feature1: "පහසුවෙන් භාවිතා කළ හැකිය",
      f1desc: "ස්මාර්ට් ජංගම දුරකථන සඳහා සැලසුම් කළ — විශාල ටැප් ඉලක්ක, අමන්ත්‍රණය විරහිත PWA ස්ථාපනය.",
      feature2: "ප්‍රදේශීය කිරීම",
      f2desc: "බහු භාෂා UI සමඟ ශ්‍රී ලංකාවේ ගොවිතැන් තත්ත්වය.",
      feature3: "ආරම්භ කිරීමට නිදහස්",
      f3desc: "සඟපත් ගාස්තු නොමැතිව මූලික උපදේශන සහ කාලගුණ සේවා.",
      checkmark: "✓"
    }
  },
  TA: {
    nav: { home: "முகப்பு", about: "எங்களை", services: "சேவைகள்", pages: "பக்கங்கள்", blog: "வலைப்பதிவு", contact: "தொடர்பு" },
    hero: {
      title: "இலங்கையின் விவசாயத்திற்கான AI தொழில்நுட்பம",
      subtitle: "உண்மையான நேர வானிலை சார்ந்த வழிகாட்டுதல், மேம்பட்ட பயிர் நுண்ணறிவு, நேரடி விற்பனையாளர்களுக்கான அணுகல், மற்றும் உங்கள் தனிப்பட்ட விவசாய உதவியாளர் — இலங்கையின் உள்ளூர்ப் பசும்பாகங்களுக்கு மிகவும் சரிப்படுத்தப்பட்ட தமிழ், ஆங்கிலம் மற்றும் சிங்களம் மொழிகளில் ஒவ்வொரு சாதனத்திலும் முடிவுற்ற மொபைல் முதல் வடிவமைப்போடு.",
      signup: "பதிவு செய் →",
      signin: "உள்நுழைய",
      openapp: "பயன்பாட்டைத் திற →"
    },
    about: {
      kicker: "எங்களை பற்றி",
      title: "தொழில்நுட்பத்தின் மூலம் இலங்கையின் விவசாயிகளுக்கு அதிகாரம்",
      desc: "கோவி AI அதிநவீன செயற்கை நுண்ணறிவு மூலம் இலங்கையின் விவசாயத்தை புரட்சி செய்கிறது. எங்கள் தளம் உண்மையான நேர வானிலை முன்கணிப்புகள், ஆதரவு செய்யப்பட்ட பயிர் ஆரோக்கிய பகுப்பாய்வு, அறுவடைகளை விற்க நேரடி சந்தை மற்றும் தமிழ், ஆங்கிலம் மற்றும் சிங்களம் மொழிகளில் தனிப்பயனாக்கப்பட்ட விவசாய ஆலோசனைகளை வழங்குகிறது. சிறிய அதிகரிப்புகள், நிலையான நடைமுறைகள் மற்றும் அதிக இலாபங்களுக்கு தரவு மூலம் விவசாயிகளுக்கு அதிகாரம்.",
      feat1: "நிலையான விவசாயம்",
      feat1desc: "நீண்ட கால மண் ஆரோக்கியம் மற்றும் உற்பத்தித்திறனுக்கு சுற்றுச்சூழல் நடைமுறைகளை ஊக்குவித்தல",
      feat2: "உள்ளூர் மொழி ஆதரவு",
      feat2desc: "தமிழ், ஆங்கிலம் மற்றும் சிங்களம் மொழிகளில் முழு மொழி ஆதரவு",
      learnmore: "மேலும் அறிக",
      oldKicker: "எங்கள் பணி",
      oldTitle: "சுற்றுச்சூழல் நட்பு வளர்ச்சிக்கான டிஜிட்டல் பராமரிப்பு",
      oldDesc: "கோவி AI இல், நாம் வளர்க்க பயன்படுத்தும் தொழில்நுட்பத்துடன் நிலத்தின் ஆரோக்கியம் பிரிவின்றி இணைக்கப்பட்டுள்ளது என்று நம்புகிறோம். எங்களின் 'டிஜிட்டல் பராமரிப்பு' தத்துவம் சுற்றுச்சூழல் பதிவை குறைக்கும் அதே நேரத்தில் விவசாயி இலாபத்தை அதிகரிக்கும் துல்லியமான, தரவு ஆதரவான முடிவுகள் மீது கவனம் செலுத்துகிறது.",
      oldFeat1: "மீண்டும் உருவாக்கும் நடைமுறைகள்",
      oldFeat1desc: "நீண்ட கால நில ஆரோக்கியத்தை உருவாக்குவதற்கு தொழில்நுட்பத்தை மண் மீண்டும் உருவாக்கும் நுட்பங்களுடன் ஒருங்கிணைக்கிறது.",
      oldFeat2: "தரவு வெளிப்படைத்தன்மை",
      oldFeat2desc: "மேம்பட்ட நுகர்வோர் நம்பிக்கைக்கு விதையிலிருந்து களத்து வரை முழு வாழ்க்கை சுழற்சி பார்வை.",
      oldBtn: "நிலைத்தன்மை அறிக்கையை படிக்கவும்"
    },
    features: {
      advisor: "AI ஆலோசகர்",
      adesc: "உரங்கள், பூச்சிகள், விலைகள் மற்றும் பருவ நடைமுறைகள் பற்றி கேளுங்கள்.",
      weather: "வானிலை",
      wdesc: "நீர்ப்பாசனத் திட்டமிடலுக்கு GPS அடிப்படையிலான முன்கணிப்புகள் மற்றும் எச்சரிக்கைகள்.",
      market: "சந்தை",
      mdesc: "அறுவடைகளை பட்டியலிட்டு உள்ளூர் வாங்குபவர்களுடன் இணைக்கவும்.",
      reports: "அறிக்கைகள்",
      rdesc: "SHAP விளக்கங்களுடன் பயிர் ஆரோக்கியம் மற்றும் அறுவடை நுண்ணறிவு."
    },
    services: {
      our: "எங்கள் சேவைகள்",
      title: "நவீன தொழில்நுட்பத்தின் மூலம் விவசாயிகளுக்கு அதிகாரம்",
      integrated: "எங்கள் சேவைகள்",
      intTitle: "ஒருங்கிணைந்த விவசாய தீர்வுகள்",
      intSub: "நவீன பயிரிடுபவருக்கு வடிவமைக்கப்பட்ட துல்லிய கருவிகள், சுற்றுச்சூழல் பொறுப்புடன் மகசூல் உகபாக்கத்தை சமநிலைப்படுத்துகிறது.",
      sol1: "துல்லிய பயிர் மேலாண்மை",
      sol1desc: "ஒவ்வொரு ஏக்கரிலும் விதை அமைப்பு மற்றும் உரம் பயன்பாட்டை உகபாக்க உண்மையான நேர தரவு பகுப்பாய்வு மற்றும் செயற்கைக்கோள் படம்.",
      sol2: "கால்நடை உடல்நிலை கண்காணிப்பு",
      sol2desc: "உங்கள் மாட்டின் நல்வாழ்வு மற்றும் மகசூலுக்கு 24/7 உறுதி செய்ய அணியவும் IoT சென்சார்கள் மற்றும் AI-இயக்கிய கண்காணிப்பு.",
      sol3: "நிலையான நீர்ப்பாசன அமைப்புகள்",
      sol3desc: "மண்ணின் நீர்ப்பாதிப்பு செயல்திறனை அதிகரிக்கும் அதே நேரத்தில் கழிவுகளை 40% வரை குறைக்கும் ஸ்மார்ட் நீர் விநியோக அமைப்புகள்.",
      explore: "சேவையை ஆராயுங்கள் →"
    },
    originalServices: {
      advisor: "AI ஆலோசகர்",
      adesc: "உரங்கள், பூச்சிகள், விலைகள் மற்றும் பருவ நடைமுறைகள் பற்றி கேளுங்கள் — உள்ளூர் சூழலில் அடிப்படையாக.",
      weather: "வானிலை முன்கணிப்பு",
      wdesc: "நீர்ப்பாசனம் மற்றும் வயல் பணிகளை திட்டமிடலாம் என்பதற்கு GPS அடிப்படையிலான முன்கணிப்புகள் மற்றும் எச்சரிக்கைகள்.",
      market: "டிஜிட்டல் சந்தை",
      mdesc: "அறுவடைகளை பட்டியலிடவும், ஆர்டர்களை நிர்வகிக்கவும், ஒரு இடத்திலிருந்து வாங்குபவர்களுடன் இணைக்கவும்.",
      intel: "பயிர் நுண்ணறிவு",
      idesc: "உங்கள் பண்ணையின் மகசூலை ஊக்குவிப்பதை புரிந்து கொள்ள SHAP-ஆதரவு பரிந்துரைகள் மற்றும் அறிக்கைகள்."
    },
    why: {
      title: "எங்களை ஏன் தேர்ந்தெடுக்க வேண்டும்?",
      product: "தயாரிப்பு",
      assistant: "உதவியாளர்",
      weather: "வானிலை",
      marketplace: "சந்தை",
      reports: "அறிக்கைகள்",
      company: "நிறுவனம்",
      about: "எங்களை பற்றி",
      careers: "பணி வாய்ப்புகள்",
      goal: "செயலில் உள்ள 10,000+ விவசாயிகள் (இலக்கு)",
      feature1: "பயன்படுத்த எளிது",
      f1desc: "ஸ்மார்ட்போன்களுக்கு வடிவமைக்கப்பட்டது — பெரிய தட்டு இலக்குகள், ஆஃப்லைன் நட்பு PWA நிறுவல்.",
      feature2: "உள்ளூர்மயமாக்கப்பட்டது",
      f2desc: "பல மொழி UI உடன் இலங்கையின் விவசாய சூழல்.",
      feature3: "தொடங்க இலவசம்",
      f3desc: "மறைக்கப்பட்ட கட்டணங்கள் இல்லாமல் முக்கிய ஆலோசனை மற்றும் வானிலை அம்சங்கள்.",
      checkmark: "✓"
    }
  }
};

export default function Landing() {
  const { token } = useAuth();
  const { lang, setLang } = useLang();
  const activeLang = lang.toUpperCase(); // EN, SI, TA
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const t = translations[activeLang]; // Current translations
  
  const languages = [
    { code: "EN", label: "EN" },
    { code: "SI", label: "සිං" },
    { code: "TA", label: "தமி" }
  ];

  return (
    <div className="gov-landing">
      <header className="gov-landing-header" style={{ flexDirection: "column", padding: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "16px clamp(20px, 4vw, 50px)" }}>
          <Link to="/" className="gov-logo">
            <div className="gov-logo-icon">
              <img src="/logo.jpg" alt="Govi AI Logo" className="gov-logo-img" />
            </div>
            <div className="gov-logo-text">
              Govi AI
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="gov-landing-nav hide-on-mobile" aria-label="Marketing">
            <Link to="#home" style={{ color: '#0f172a', textDecoration: 'none' }}>{t.nav.home}</Link>
            <Link to="#about" style={{ color: '#0f172a', textDecoration: 'none' }}>{t.nav.about}</Link>
            <Link to="#services" style={{ color: '#0f172a', textDecoration: 'none' }}>{t.nav.services}</Link>
            <Link to="#features" style={{ color: '#0f172a', textDecoration: 'none' }}>{t.nav.pages}</Link>
            <Link to="#" style={{ color: '#0f172a', textDecoration: 'none' }}>{t.nav.blog}</Link>
            <Link to="#contact" style={{ color: '#0f172a', textDecoration: 'none' }}>{t.nav.contact}</Link>
          </nav>

          <div className="hide-on-mobile" style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div className="gov-lang-switcher">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  className={`gov-lang-btn ${activeLang === lang.code ? "gov-lang-btn--active" : ""}`}
                  onClick={() => setLang(lang.code.toLowerCase())}
                >
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
            {token ? (
              <Link to="/app" className="gov-landing-btn gov-landing-btn-primary">
                Dashboard
              </Link>
            ) : (
              <div style={{ display: 'flex', gap: '12px' }}>
                <Link to="/login" className="gov-landing-btn gov-landing-btn-primary" style={{ fontSize: 14 }}>
                  Sign in
                </Link>
                <Link to="/register" className="gov-landing-btn gov-landing-btn-primary" style={{ fontSize: 14 }}>
                  Sign up
                </Link>
              </div>
            )}
          </div>

          <button className="hide-on-desktop" onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ background: "none", border: "none", fontSize: 28, cursor: "pointer", color: "#0f172a", display: "flex", padding: 4 }}>
            {isMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* Mobile Nav Overlay */}
        {isMenuOpen && (
          <div className="hide-on-desktop" style={{ width: "100%", background: "#fff", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 20, borderTop: "1px solid rgba(0,0,0,0.05)" }}>
            <nav style={{ display: "flex", flexDirection: "column", gap: 16, fontSize: 16, fontWeight: 700 }}>
              <Link to="#home" onClick={() => setIsMenuOpen(false)} style={{ color: '#0f172a', textDecoration: 'none' }}>{t.nav.home}</Link>
              <Link to="#about" onClick={() => setIsMenuOpen(false)} style={{ color: '#0f172a', textDecoration: 'none' }}>{t.nav.about}</Link>
              <Link to="#services" onClick={() => setIsMenuOpen(false)} style={{ color: '#0f172a', textDecoration: 'none' }}>{t.nav.services}</Link>
              <Link to="#features" onClick={() => setIsMenuOpen(false)} style={{ color: '#0f172a', textDecoration: 'none' }}>{t.nav.pages}</Link>
              <Link to="#" onClick={() => setIsMenuOpen(false)} style={{ color: '#0f172a', textDecoration: 'none' }}>{t.nav.blog}</Link>
              <Link to="#contact" onClick={() => setIsMenuOpen(false)} style={{ color: '#0f172a', textDecoration: 'none' }}>{t.nav.contact}</Link>
            </nav>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 16, borderTop: "1px solid rgba(0,0,0,0.05)" }}>
              <div className="gov-lang-switcher" style={{ width: "fit-content" }}>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    className={`gov-lang-btn ${activeLang === lang.code ? "gov-lang-btn--active" : ""}`}
                    onClick={() => { setLang(lang.code.toLowerCase()); setIsMenuOpen(false); }}
                  >
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
              {token ? (
                <Link to="/app" className="gov-landing-btn gov-landing-btn-primary" onClick={() => setIsMenuOpen(false)} style={{ textAlign: "center" }}>
                  Dashboard
                </Link>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: "1fr 1fr", gap: '12px' }}>
                  <Link to="/login" className="gov-landing-btn gov-landing-btn-primary" onClick={() => setIsMenuOpen(false)} style={{ fontSize: 14, textAlign: "center", justifyContent: "center" }}>
                    Sign in
                  </Link>
                  <Link to="/register" className="gov-landing-btn gov-landing-btn-primary" onClick={() => setIsMenuOpen(false)} style={{ fontSize: 14, textAlign: "center", justifyContent: "center" }}>
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <section id="home" className="gov-landing-hero">
        <div className="gov-landing-hero-inner">
          <div className="gov-landing-hero-content">
            <h1>{t.hero.title}</h1>
            <p>{t.hero.subtitle}</p>
            <div className="gov-landing-actions">
              {token ? (
                <Link to="/app" className="gov-landing-btn gov-landing-btn-primary">
                  {t.hero.openapp}
                </Link>
              ) : (
                <>
                  <Link to="/register" className="gov-landing-btn gov-landing-btn-primary">
                    {t.hero.signup}
                  </Link>
                  <Link to="/login" className="gov-landing-btn gov-landing-btn-primary">
                    {t.hero.signin}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="gov-about-section">
        <div className="gov-about-grid">
          <div className="gov-about-image">
            <img src="/about.jpg" alt="About Govi AI" />
          </div>
          <div className="gov-about-content">
            <div className="gov-section-kicker">{t.about.kicker}</div>
            <h2>{t.about.title}</h2>
            <p>{t.about.desc}</p>
            <div className="gov-about-list">
              <div className="gov-about-item">
                <div className="gov-about-icon"><FiAward size={32} style={{color: 'var(--sf-primary)'}} /></div>
                <div>
                  <h4>{t.about.feat1}</h4>
                  <p>{t.about.feat1desc}</p>
                </div>
              </div>
              <div className="gov-about-item">
                <div className="gov-about-icon"><FiWifi size={32} style={{color: 'var(--sf-primary)'}} /></div>
                <div>
                  <h4>{t.about.feat2}</h4>
                  <p>{t.about.feat2desc}</p>
                </div>
              </div>
            </div>
            <Link to="#" className="gov-landing-btn gov-landing-btn-primary" style={{ marginTop: '24px', display: 'inline-flex' }}>
              {t.about.learnmore}
            </Link>
          </div>
        </div>
      </section>

      <section id="features" className="gov-features-section">
        <div className="gov-features-grid">
          <div className="gov-feature-card">
            <div className="gov-feature-icon"><FiActivity size={40} /></div>
            <h3>{t.features.advisor}</h3>
            <p>{t.features.adesc}</p>
          </div>
          <div className="gov-feature-card">
            <div className="gov-feature-icon"><FiCalendar size={40} /></div>
            <h3>{t.features.weather}</h3>
            <p>{t.features.wdesc}</p>
          </div>
          <div className="gov-feature-card">
            <div className="gov-feature-icon"><FiShoppingCart size={40} /></div>
            <h3>{t.features.market}</h3>
            <p>{t.features.mdesc}</p>
          </div>
          <div className="gov-feature-card">
            <div className="gov-feature-icon"><FiBarChart2 size={40} /></div>
            <h3>{t.features.reports}</h3>
            <p>{t.features.rdesc}</p>
          </div>
        </div>
      </section>

      <section id="mission" className="gov-landing-mission" style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 20px' }}>
        <div className="gov-mission-grid">
          <div className="gov-mission-image-wrap" style={{ position: 'relative' }}>
            <img src="/mission.jpg" alt="Digital Stewardship" className="gov-mission-image" style={{ width: '100%', aspectRatio: '3.5/4', objectFit: 'cover', borderRadius: '24px', display: 'block' }} />
            <div className="gov-mission-badge">
              100%<br />TRACEABLE
            </div>
          </div>
          <div className="gov-mission-content">
            <div className="gov-landing-kicker" style={{ textAlign: 'left', color: '#166534' }}>Our Mission</div>
            <h2>Digital Stewardship for Eco-friendly Growth</h2>
            <p>
              At Govi AI, we believe that the health of the land is inextricably linked to the technology we use to tend it. 
              Our "Digital Stewardship" philosophy focuses on precise, data-backed decisions that minimize environmental footprint while maximizing farmer profitability.
            </p>
            <div className="gov-mission-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
              <div className="gov-mission-item" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div>
                  <h3>Regenerative Practices</h3>
                  <p>Integrating tech with soil regeneration techniques to build long-term land health.</p>
                </div>
              </div>
              <div className="gov-mission-item" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div>
                  <h3>Data Transparency</h3>
                  <p>Full lifecycle visibility from seed to silo for enhanced consumer trust.</p>
                </div>
              </div>
            </div>
            <Link to="#" className="gov-btn-outline-dark">Read Sustainability Report</Link>
          </div>
        </div>
      </section>

      <section id="solutions" className="gov-landing-solutions">
        <div className="gov-solutions-header">
          <div className="gov-landing-kicker">Our services</div>
          <h2>Integrated Agricultural Solutions</h2>
          <p>Smart tools tailored for Sri Lankan farmers, combining real-time intelligence with local expertise for sustainable growth.</p>
        </div>
        <div className="gov-solutions-grid">
          <div className="gov-solution-card">
            <h3>AI Advisor</h3>
            <p>Get instant guidance on fertilizers, pest management, market prices, and seasonal practices — all grounded in Sri Lankan farming context.</p>
            <Link to="#" className="gov-solution-link">Explore Service →</Link>
          </div>
          <div className="gov-solution-card">
            <h3>Weather Forecasting</h3>
            <p>GPS-based weather alerts and forecasts to help you plan irrigation, field work, and protect your crops from unexpected conditions.</p>
            <Link to="#" className="gov-solution-link">Explore Service →</Link>
          </div>
          <div className="gov-solution-card">
            <h3>Digital Marketplace</h3>
            <p>List your harvests, manage buyer inquiries, and connect directly with customers to get the best prices for your produce.</p>
            <Link to="#" className="gov-solution-link">Explore Service →</Link>
          </div>
        </div>
      </section>

      <section className="gov-landing-section" style={{ background: "color-mix(in srgb, var(--sf-card) 65%, var(--sf-bg))", borderTop: "1px solid var(--sf-border)" }}>
        <div className="gov-why">
          <div className="gov-card" style={{ padding: 28 }}>
            <div style={{ fontWeight: 900, marginBottom: 16 }}>Product</div>
            <div className="sf-muted" style={{ display: "grid", gap: 10 }}>
              <span>Assistant</span>
              <span>Weather</span>
              <span>Marketplace</span>
              <span>Reports</span>
            </div>
            <div style={{ marginTop: 24, fontWeight: 900 }}>Company</div>
            <div className="sf-muted" style={{ display: "grid", gap: 10 }}>
              <span>About</span>
              <span>Careers</span>
            </div>
            <div
              style={{
                marginTop: 28,
                display: "inline-block",
                padding: "10px 14px",
                borderRadius: 12,
                background: "var(--sf-msg-ai)",
                fontWeight: 800,
                fontSize: 13,
                color: "var(--sf-primary)",
              }}
            >
              10,000+ active farmers (goal)
            </div>
          </div>
          <div>
            <h2 style={{ textAlign: "left", marginBottom: 20 }}>Why choose us?</h2>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 18 }}>
              <li style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <FiCheck size={20} style={{ color: "var(--sf-primary)", fontWeight: 900, flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong>Easy to use</strong>
                  <div className="sf-muted" style={{ marginTop: 4 }}>
                    Designed for smartphones — large tap targets, offline-friendly PWA install.
                  </div>
                </div>
              </li>
              <li style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <FiCheck size={20} style={{ color: "var(--sf-primary)", fontWeight: 900, flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong>Localized</strong>
                  <div className="sf-muted" style={{ marginTop: 4 }}>
                    Sri Lankan farming context with multilingual UI.
                  </div>
                </div>
              </li>
              <li style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <FiCheck size={20} style={{ color: "var(--sf-primary)", fontWeight: 900, flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong>Free to start</strong>
                  <div className="sf-muted" style={{ marginTop: 4 }}>
                    Core advisory and weather features without hidden fees.
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="gov-landing-section">
        <h2>Success stories from farmers</h2>
        <div className="gov-services-grid">
          {[
            { name: "Sunil Perera", loc: "Kurunegala", quote: "Weather alerts helped me shift nursery timing — less seed loss." },
            { name: "Kamal Silva", loc: "Embilipitiya", quote: "The assistant explains fertilizer choices in simple Sinhala." },
            { name: "Nimal Fonseka", loc: "Anuradhapura", quote: "Listing carrots on the marketplace brought buyers faster." },
          ].map((s) => (
            <div key={s.name} className="gov-card">
              <div style={{ color: "#f4a923", marginBottom: 8 }}>★★★★★</div>
              <p style={{ margin: "0 0 16px", fontSize: 14, lineHeight: 1.55 }}>&ldquo;{s.quote}&rdquo;</p>
              <div style={{ fontWeight: 800 }}>{s.name}</div>
              <div className="sf-muted" style={{ fontSize: 13 }}>
                {s.loc}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="gov-footer">
        <div className="gov-footer-inner">
          <div className="gov-footer-brand">
            <Link to="/" className="gov-logo">
              <div className="gov-logo-icon">
                <img src="/logo.jpg" alt="Govi AI Logo" className="gov-logo-img" style={{ filter: 'brightness(0) invert(1)' }} />
              </div>
              <div className="gov-logo-text" style={{ color: 'white' }}>
                Govi AI
              </div>
            </Link>
            <div className="gov-footer-subscribe" style={{ marginTop: '32px' }}>
              <h3>Subscribe For Latest Articles</h3>
              <div className="gov-footer-subscribe-form">
                <input type="email" placeholder="Email" />
                <button type="button">Go</button>
              </div>
            </div>
          </div>
          <div className="gov-footer-links-row">
            <div className="gov-footer-col">
              <h4>Our Services</h4>
              <ul>
                <li><Link to="/app/chat"><FiMessageSquare size={16} style={{display: 'inline', marginRight: 6}} /> AI Chat Assistant</Link></li>
                <li><Link to="/app/predict"><FiTarget size={16} style={{display: 'inline', marginRight: 6}} /> Crop Prediction</Link></li>
                <li><Link to="/app"><FiSun size={16} style={{display: 'inline', marginRight: 6}} /> Real-time Weather</Link></li>
                <li><Link to="/app/market"><FiShoppingCart size={16} style={{display: 'inline', marginRight: 6}} /> Digital Marketplace</Link></li>
                <li><Link to="/app/reports"><FiBarChart2 size={16} style={{display: 'inline', marginRight: 6}} /> Farm Analytics</Link></li>
              </ul>
            </div>
            <div className="gov-footer-col">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#"><FiInfo size={16} style={{display: 'inline', marginRight: 6}} /> About Govi AI</a></li>
                <li><a href="#"><FiAward size={16} style={{display: 'inline', marginRight: 6}} /> Why Choose Us</a></li>
                <li><a href="#"><FiSettings size={16} style={{display: 'inline', marginRight: 6}} /> How It Works</a></li>
                <li><a href="#"><FiGlobe size={16} style={{display: 'inline', marginRight: 6}} /> Our Mission</a></li>
                <li><Link to="/register"><FiUserPlus size={16} style={{display: 'inline', marginRight: 6}} /> Start for Free</Link></li>
              </ul>
            </div>
            <div className="gov-footer-col">
              <h4>Contact</h4>
              <ul>
                <li><a href="tel:+9476044308015"><FiPhone size={16} style={{display: 'inline', marginRight: 6}} /> +94 76044308015</a></li>
                <li><a href="mailto:info@govi.ai"><FiMail size={16} style={{display: 'inline', marginRight: 6}} /> info@govi.ai</a></li>
                <li><a href="#"><FiMapPin size={16} style={{display: 'inline', marginRight: 6}} /> Labuduwa, Galle, Sri Lanka</a></li>
              </ul>
            </div>
          </div>
          <div className="gov-footer-social-row">
            <div className="gov-footer-social">
              <a href="#">f</a>
              <a href="#">x</a>
              <a href="#">in</a>
              <a href="#"><FiPlay size={16} /></a>
            </div>
          </div>
        </div>
        <div className="gov-footer-bottom">
          <p>© {new Date().getFullYear()} Govi AI. @All Rights Reserved.</p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href="#" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', textDecoration: 'none' }}>Terms & Condition</a>
            <a href="#" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', textDecoration: 'none' }}>Privacy & supports</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
