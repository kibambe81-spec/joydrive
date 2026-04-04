/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import PaymentModal from './components/PaymentModal';
import UserLocationMarker from './components/UserLocationMarker';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer, Autocomplete, OverlayView, Polyline } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Navigation, 
  Search, 
  MapPin, 
  Clock, 
  CreditCard, 
  User, 
  Settings, 
  Star, 
  ChevronRight, 
  Car, 
  ShieldCheck, 
  Zap,
  Menu,
  X,
  History,
  Gift,
  HelpCircle,
  LogOut,
  Globe,
  Info,
  FileText,
  Briefcase,
  Facebook,
  Mail,
  Phone,
  MessageSquare,
  Truck,
  Package,
  Shield,
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Sun,
  Moon,
  Bell,
  Wallet,
  Banknote,
  FileCheck,
  Smartphone,
  Palette,
  Upload,
  Plus,
  Heart
} from 'lucide-react';
import { cn } from './lib/utils';
import { GoogleGenAI } from "@google/genai";
import confetti from 'canvas-confetti';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

const mapContainerStyle = {
  width: '100%',
  height: '100vh',
};

const center = {
  lat: 48.8566,
  lng: 2.3522, // Paris by default
};

const darkMapOptions = {
  disableDefaultUI: true,
  styles: [
    { "elementType": "geometry", "stylers": [{ "color": "#1a1a1a" }] },
    { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#1a1a1a" }] },
    { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2c" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }
  ]
};

const lightMapOptions = {
  disableDefaultUI: true,
  styles: [
    { "elementType": "geometry", "stylers": [{ "color": "#ebe3cd" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#523735" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#f5f1e6" }] },
    { "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [{ "color": "#c9b2a6" }] },
    { "featureType": "administrative.land_parcel", "elementType": "geometry.stroke", "stylers": [{ "color": "#dcd2be" }] },
    { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [{ "color": "#ae9e90" }] },
    { "featureType": "landscape.natural", "elementType": "geometry", "stylers": [{ "color": "#dfd2ae" }] },
    { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#dfd2ae" }] },
    { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#93817c" }] },
    { "featureType": "poi.park", "elementType": "geometry.fill", "stylers": [{ "color": "#a5b076" }] },
    { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#447530" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#f5f1e6" }] },
    { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#fdfcf8" }] },
    { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#f8c967" }] },
    { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#e9bc62" }] },
    { "featureType": "road.highway.controlled_access", "elementType": "geometry", "stylers": [{ "color": "#e98d58" }] },
    { "featureType": "road.highway.controlled_access", "elementType": "geometry.stroke", "stylers": [{ "color": "#db854f" }] },
    { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#806b63" }] },
    { "featureType": "transit.line", "elementType": "geometry", "stylers": [{ "color": "#dfd2ae" }] },
    { "featureType": "transit.line", "elementType": "labels.text.fill", "stylers": [{ "color": "#8f7d77" }] },
    { "featureType": "transit.line", "elementType": "labels.text.stroke", "stylers": [{ "color": "#ebe3cd" }] },
    { "featureType": "transit.station", "elementType": "geometry", "stylers": [{ "color": "#dfd2ae" }] },
    { "featureType": "water", "elementType": "geometry.fill", "stylers": [{ "color": "#b9d3c2" }] },
    { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#92998d" }] }
  ]
};

const RIDE_TYPES = [
  { id: 'joy_lite', name: 'Joy Lite', icon: Car, basePrice: 15, pricePerKm: 4.8, time: '2 min', description: 'Quick & Efficient', color: '#FFD700', seats: 2, topViewUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/vehicle-topview-lite-yellow-black-roof-etnaaXdnxrdNaiggNEH7WV.webp' },
  { id: 'joy_economy', name: 'Joy Economy', icon: Car, basePrice: 21, pricePerKm: 7.2, time: '4 min', description: 'Comfortable & Affordable', color: '#FFFFFF', seats: 2, topViewUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/vehicle-topview-confort-white-black-roof-9B7dMyBAjHPjmHwVuGS6ur.webp', sideViewUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/vehicle-side-white-economy-v2-VtuXfQGSyrevMmbuwjMwEA.webp' },
  { id: 'joy_confort', name: 'Joy Confort', icon: Car, basePrice: 21, pricePerKm: 7.2, time: '4 min', description: 'Comfortable & Affordable', color: '#FFFFFF', seats: 4, topViewUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/vehicle-topview-confort-white-black-roof-9B7dMyBAjHPjmHwVuGS6ur.webp', sideViewUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/vehicle-side-white-economy-v2-VtuXfQGSyrevMmbuwjMwEA.webp' },
  { id: 'joy_women', name: 'Joy Women for Women', icon: Car, basePrice: 60, pricePerKm: 21, time: '5 min', description: 'Luxury & Safe', color: '#C0C0C0', seats: 4, topViewUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/vehicle-topview-women-gray-pale-clean-7PH6zhPzjPAEH4mqkevt76.webp', sideViewUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/vehicle-side-women-gray-pale-clean-T6mEbPNjDtjJsiXUg2fGmz.webp' },
  { id: 'joy_express', name: 'Joy Express', icon: Car, basePrice: 30, pricePerKm: 10.8, time: '3 min', description: 'Premium & Fast', color: '#FFFFFF', seats: 4, topViewUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/vehicle-topview-express-white-black-roof-WfSbVdovRfvVc2abNoCJ7H.webp', sideViewUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/vehicle-side-white-express-v2-fhHNuH8veh8LjKV9o5s2wb.webp' },
  { id: 'joy_premium', name: 'Joy Premium', icon: Car, basePrice: 60, pricePerKm: 21, time: '5 min', description: 'Luxury & Style', color: '#FFFFFF', seats: 4, topViewUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/vehicle-topview-premium-white-black-roof-Bgm8Xi9QaJ6rHX4MVko4RK.webp', sideViewUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/vehicle-side-white-vip-v2-WW2bcVFmanUFGWkWeiEmwd.webp' },
  { id: 'joy_xl', name: 'Joy XL', icon: Car, basePrice: 36, pricePerKm: 12, time: '6 min', description: '6 Seater Van', color: '#000000', seats: 6, topViewUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/vehicle-topview-xl-black-black-roof-V2uuvunWAy4F4sp84qDv5s.webp', sideViewUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/vehicle-side-black-xl-phares-bande-Y4wvFEG5hS4zJHrPDMozZy.webp' },
  { id: 'joy_parcels', name: 'Joy Parcels', icon: Package, basePrice: 18, pricePerKm: 6, time: '10 min', description: 'Safe & Secure Delivery', color: '#FF8C00', seats: 1, topViewUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/vehicle-topview-parcels-orange-black-roof-4dUmx5UCntjFsWSFW8FrJB.webp', sideViewUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/delivery-box-3d-orange-RHRPuegGaDmXqRnCa68UNw.webp' },
  { id: 'joy_moving', name: 'Joy Moving', icon: Truck, basePrice: 120, pricePerKm: 30, time: '15 min', description: 'Large Capacity Moving', color: '#FF8C00', seats: 2, topViewUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/vehicle-topview-parcels-orange-black-roof-4dUmx5UCntjFsWSFW8FrJB.webp', sideViewUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/delivery-box-3d-orange-RHRPuegGaDmXqRnCa68UNw.webp' },
];

const REFERENCE_ADDRESSES = [
  { name: 'Johannesburg CBD', address: 'Johannesburg, South Africa' },
  { name: 'Sandton City', address: 'Sandton, Johannesburg' },
  { name: 'Cape Town Waterfront', address: 'V&A Waterfront, Cape Town' },
  { name: 'Durban Beach Front', address: 'Durban, South Africa' },
  { name: 'Pretoria Union Buildings', address: 'Pretoria, South Africa' },
  { name: 'Bloemfontein CBD', address: 'Bloemfontein, South Africa' },
  { name: 'Port Elizabeth Beachfront', address: 'Port Elizabeth, South Africa' },
  { name: 'Polokwane CBD', address: 'Polokwane, South Africa' },
];

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'zu', name: 'Zulu' },
  { code: 'xh', name: 'Xhosa' },
  { code: 'af', name: 'Afrikaans' },
];

const TRANSLATIONS: Record<string, any> = {
  en: {
    welcome: "Welcome to JoyDrive",
    tagline: "Intelligence & Prestige",
    getStarted: "Get Started",
    whereTo: "Where to?",
    from: "Pickup point",
    search: "Search Ride",
    order: "Order",
    cancel: "Cancel",
    confirm: "Confirm",
    becomeDriver: "Become a Driver",
    profile: "Profile",
    history: "History",
    payment: "Payment",
    promos: "Promotions",
    help: "Help",
    settings: "Settings",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    theme: "Theme",
    about: "About",
    privacy: "Privacy Policy",
    language: "Language",
    logout: "Logout",
    driverArriving: "Your JoyDrive is arriving",
    driverInfo: "Your driver is on the way.",
    paymentRequired: "Payment Verification",
    payNow: "Pay & Search",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    register: "Register",
    socialLogin: "Or continue with",
    deleteAccount: "Delete Account",
    deleteConfirm: "Are you sure you want to delete your account?",
    saveChanges: "Save Changes",
    selectLanguage: "Select Language",
    emergency: "Emergency Call",
    searchingDriver: "Searching for your pilot...",
    driverFound: "Pilot Found!",
    driverArrived: "Your pilot has arrived!",
    message: "Message",
    call: "Call",
    eta: "ETA",
    min: "min",
    deleteAccountPerm: "Delete Account Permanently",
    paymentMethod: "Payment Method",
    cash: "Cash",
    card: "Credit Card",
    notifications: "Notifications",
    becomeDriverTitle: "Join the Fleet",
    driverPhone: "Phone Number",
    vehicleColor: "Vehicle Color",
    uploadDocs: "Upload Documents (PDF/Image)",
    license: "Driver's License",
    vehicleDocs: "Vehicle Registration",
    rateDriver: "Rate your Driver",
    driverFeedback: "How was your driver?",
    vehicleFeedback: "How was the vehicle?",
    tripFeedback: "How was the trip?",
    priceFeedback: "How was the price?",
    feedbackPlaceholder: "Tell us more about your journey...",
    submitFeedback: "Submit Review",
    downloading: "Downloading intelligence...",
    forgotSomething: "Forgot something in the vehicle?",
    callDriverManual: "Call Driver",
    addStop: "Add Stop",
    favorites: "Favorites",
    saveAddress: "Save Address",
    saveDriver: "Save Driver",
    favoriteDrivers: "Favorite Drivers",
    favoriteAddresses: "Favorite Addresses",
    addCard: "Add New Card",
    cardNumber: "Card Number",
    expiryDate: "Expiry Date",
    cvv: "CVV",
    paymentSuccess: "Payment Successful!",
    noCards: "No cards saved yet",
    emergencyNumber: "Police: 10111",
    signOut: "Sign Out",
    deleteAccountPermanently: "Delete My Account",
    deleteAccountWarning: "This will permanently delete your account and all associated data.",
    confirmDelete: "Yes, delete my account",
    uploadPhoto: "Upload Photo",
    uploadingPhoto: "Uploading...",
    photoUploaded: "Photo uploaded successfully!",
    signIn: "Sign In",
    signInWithGoogle: "Sign in with Google",
  },
  fr: {
    welcome: "Bienvenue sur JoyDrive",
    tagline: "Intelligence & Prestige",
    getStarted: "Commencer",
    whereTo: "Où allez-vous ?",
    from: "Point de départ",
    search: "Rechercher",
    order: "Commander",
    cancel: "Annuler",
    confirm: "Confirmer",
    becomeDriver: "Devenir Chauffeur",
    profile: "Profil",
    history: "Trajets",
    payment: "Paiement",
    promos: "Promotions",
    help: "Aide",
    settings: "Paramètres",
    about: "À propos",
    privacy: "Confidentialité",
    language: "Langue",
    logout: "Déconnexion",
    driverArriving: "Votre JoyDrive arrive",
    driverInfo: "Votre chauffeur est en route.",
    paymentRequired: "Vérification du paiement",
    payNow: "Payer & Rechercher",
    firstName: "Prénom",
    lastName: "Nom",
    email: "Email",
    register: "S'enregistrer",
    socialLogin: "Ou continuer avec",
    deleteAccount: "Supprimer le compte",
    deleteConfirm: "Êtes-vous sûr de vouloir supprimer votre compte ?",
    saveChanges: "Enregistrer",
    selectLanguage: "Choisir la langue",
    darkMode: "Mode Sombre",
    lightMode: "Mode Clair",
    theme: "Thème",
    emergency: "Appel d'Urgence",
    searchingDriver: "Recherche de votre pilote...",
    driverFound: "Pilote Trouvé !",
    driverArrived: "Votre pilote est arrivé !",
    message: "Message",
    call: "Appel",
    eta: "Arrivée",
    min: "min",
    deleteAccountPerm: "Supprimer définitivement",
    paymentMethod: "Mode de Paiement",
    cash: "Espèces",
    card: "Carte Bancaire",
    notifications: "Notifications",
    becomeDriverTitle: "Rejoindre la Flotte",
    driverPhone: "Numéro de Téléphone",
    vehicleColor: "Couleur du Véhicule",
    uploadDocs: "Télécharger Documents (PDF/Image)",
    license: "Permis de Conduire",
    vehicleDocs: "Carte Grise",
    rateDriver: "Notez votre chauffeur",
    driverFeedback: "Comment était le chauffeur ?",
    vehicleFeedback: "Comment était le véhicule ?",
    tripFeedback: "Comment était le trajet ?",
    priceFeedback: "Comment était le prix ?",
    feedbackPlaceholder: "Dites-nous en plus sur votre voyage...",
    submitFeedback: "Envoyer l'avis",
    downloading: "Téléchargement de l'intelligence...",
    forgotSomething: "Oublié quelque chose dans le véhicule ?",
    callDriverManual: "Appeler le chauffeur",
    addStop: "Ajouter un arrêt",
    favorites: "Favoris",
    saveAddress: "Enregistrer l'adresse",
    saveDriver: "Enregistrer le chauffeur",
    favoriteDrivers: "Chauffeurs favoris",
    favoriteAddresses: "Adresses favorites",
    addCard: "Ajouter une Carte",
    cardNumber: "Numéro de Carte",
    expiryDate: "Date d'Expiration",
    cvv: "CVV",
    paymentSuccess: "Paiement Réussi !",
    noCards: "Aucune carte enregistrée",
  }
};

const ABOUT_CONTENT = `JoyDrive is the world's most advanced transport intelligence platform. Born from the fusion of cutting-edge AI and premium logistics, we provide an unparalleled travel experience. 

Our mission is to move the world with class, safety, and absolute precision. We are committed to excellence in every journey, ensuring that every passenger feels the Joy of driving without the stress.

Key Features:
• AI-Driven Route Optimization
• Premium Fleet of 3D-Rendered Vehicles
• Real-time Driver Intelligence
• Secure, Encrypted Communication
• Global Support Network

We believe in a future where transport is not just a utility, but a seamless extension of your lifestyle. For support or inquiries, contact us at +27788002462 or visit our headquarters.`;

const PRIVACY_POLICY = `Your privacy is our priority. JoyDrive uses end-to-end encryption for all trip data. 

Data Collection & Usage:
• Personal Information: We collect your name and email to personalize your experience.
• Location Data: Used only during active trips to ensure safety and accurate navigation.
• Trip History: Stored securely to help you manage your past journeys.
• Payment Data: Processed through secure, PCI-compliant gateways.

Your Rights:
• Access: You can request a copy of your data at any time.
• Deletion: You have the right to delete your account and all associated data.
• Control: You can manage your privacy settings directly in the app.

We never sell your personal information to third parties. We comply with all international data protection regulations, including GDPR and POPIA. For data deletion or privacy concerns, contact +27788002462.`;

// Components
const LandingPage = ({ theme, loadingProgress, t }: { theme: string, loadingProgress: number, t: (key: string) => string }) => (
  <motion.div 
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className={cn("fixed inset-0 z-[100] flex flex-col items-center justify-center p-8 text-center transition-colors duration-500", theme === 'dark' ? "bg-black" : "bg-white")}
  >
    <motion.div 
      initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ type: 'spring', duration: 1.5 }}
      className="mb-8 relative"
    >
      <div className={cn("absolute inset-0 blur-3xl rounded-full", theme === 'dark' ? "bg-white/20" : "bg-black/5")} />
      <Car className="w-32 h-32 relative z-10 animate-float text-[#FDB931]" />
    </motion.div>
    <motion.h1 
      initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
      className="text-6xl font-display joy-gradient font-bold tracking-tighter mb-4"
    >
      JoyDrive
    </motion.h1>
    <motion.p 
      initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}
      className="text-sm uppercase tracking-[0.4em] opacity-40 mb-12"
    >
      {t('tagline')}
    </motion.p>
    
    <div className="w-full max-w-xs space-y-4">
      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${loadingProgress}%` }}
          className="h-full bg-[#FDB931]"
        />
      </div>
      <p className="text-[10px] uppercase tracking-widest opacity-30">{t('downloading')}</p>
    </div>
  </motion.div>
);

const AuthPage = ({ theme, t, handleSocialLogin, setAppState, handleManualRegister }: { theme: string, t: (key: string) => string, handleSocialLogin: (p: string) => void, setAppState: (s: AppState) => void, handleManualRegister: (fn: string, ln: string, e: string) => void }) => {
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');

  const handleRegisterClick = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      alert('Please fill in all fields');
      return;
    }
    handleManualRegister(firstName, lastName, email);
  };

  return (
  <motion.div 
    initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
    className={cn("fixed inset-0 z-[90] p-8 flex flex-col justify-center transition-colors duration-500", theme === 'dark' ? "bg-black" : "bg-white")}
  >
    <div className="max-w-md mx-auto w-full space-y-8 overflow-y-auto max-h-full px-2 py-8 custom-scrollbar">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Car className="w-8 h-8 text-[#FDB931]" />
          <h2 className="text-3xl font-display joy-gradient">{t('welcome')}</h2>
        </div>
        <p className="text-sm opacity-50">Join the elite transport network</p>
      </div>

      <div className="space-y-4">
        <input type="text" placeholder={t('firstName')} value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full glass p-4 rounded-2xl focus:outline-none focus:border-white/30" />
        <input type="text" placeholder={t('lastName')} value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full glass p-4 rounded-2xl focus:outline-none focus:border-white/30" />
        <input type="email" placeholder={t('email')} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full glass p-4 rounded-2xl focus:outline-none focus:border-white/30" />
        <button onClick={handleRegisterClick} className={cn("w-full font-bold py-4 rounded-2xl transition-colors", theme === 'dark' ? "bg-white text-black" : "bg-black text-white")}>{t('register')}</button>
      </div>

      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
        <div className="relative flex justify-center text-xs uppercase"><span className={cn("px-2 opacity-40 transition-colors", theme === 'dark' ? "bg-black" : "bg-white")}>{t('socialLogin')}</span></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => handleSocialLogin('Google')} className="glass py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/5 transition-colors">
          <Mail className="w-5 h-5 text-red-400" /> Google
        </button>
        <button onClick={() => handleSocialLogin('Facebook')} className="glass py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/5 transition-colors">
          <Facebook className="w-5 h-5 text-blue-500" /> Facebook
        </button>
      </div>

      <button 
        onClick={() => setAppState('driver_reg')}
        className="w-full glass py-4 rounded-2xl flex items-center justify-center gap-2 border-[#FDB931]/30 border-dashed"
      >
        <Car className="w-5 h-5 text-[#FDB931]" />
        <span className="font-bold text-[#FDB931]">{t('becomeDriver')}</span>
      </button>
    </div>
  </motion.div>
  );
};

const DriverRegPage = ({ theme, t, setAppState, driverRegData, setDriverRegData, handlePhotoUpload }: { theme: string, t: (key: string) => string, setAppState: (s: AppState) => void, driverRegData: any, setDriverRegData: any, handlePhotoUpload: any }) => (
  <motion.div 
    initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
    className={cn("fixed inset-0 z-[110] p-8 overflow-y-auto transition-colors duration-500 custom-scrollbar", theme === 'dark' ? "bg-black" : "bg-white")}
  >
    <div className="max-w-md mx-auto py-12 w-full">
      <button onClick={() => setAppState('auth')} className="mb-8 opacity-50 flex items-center gap-2"><ArrowRight className="w-5 h-5 rotate-180" /> Back</button>
      <div className="flex items-center gap-3 mb-8">
        <Car className="w-10 h-10 text-[#FDB931]" />
        <h2 className="text-4xl font-display joy-gradient">{t('becomeDriverTitle')}</h2>
      </div>
      <div className="space-y-6 pb-12">
        <div className={cn("w-32 h-32 glass rounded-full mx-auto flex flex-col items-center justify-center gap-2 border-dashed relative overflow-hidden group", theme === 'dark' ? "border-white/20" : "border-black/10")}>
          <Camera className="w-8 h-8 opacity-30 group-hover:opacity-100 transition-opacity" />
          <span className="text-[10px] uppercase opacity-30">Selfie</span>
          <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handlePhotoUpload} />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <input type="text" placeholder={t('firstName')} className="w-full glass p-4 rounded-2xl" />
          <input type="text" placeholder={t('lastName')} className="w-full glass p-4 rounded-2xl" />
        </div>
        
        <div className="relative">
          <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-30" />
          <input 
            type="tel" 
            placeholder={t('driverPhone')} 
            className="w-full glass p-4 pl-12 rounded-2xl"
            value={driverRegData.phone}
            onChange={(e) => setDriverRegData({...driverRegData, phone: e.target.value})}
          />
        </div>

        <div className="relative">
          <Palette className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-30" />
          <input 
            type="text" 
            placeholder={t('vehicleColor')} 
            className="w-full glass p-4 pl-12 rounded-2xl"
            value={driverRegData.color}
            onChange={(e) => setDriverRegData({...driverRegData, color: e.target.value})}
          />
        </div>

        <input type="text" placeholder="Vehicle Model (e.g. Mercedes S-Class)" className="w-full glass p-4 rounded-2xl" />
        <input type="text" placeholder="License Plate Number" className="w-full glass p-4 rounded-2xl" />
        
        <div className="glass p-6 rounded-3xl space-y-6">
          <p className="text-xs font-bold uppercase tracking-widest opacity-50 flex items-center gap-2">
            <FileCheck className="w-4 h-4" /> {t('uploadDocs')}
          </p>
          
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <span className="text-sm opacity-70">{t('license')}</span>
              <label className={cn("flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed cursor-pointer hover:bg-white/5 transition-colors", theme === 'dark' ? "border-white/20" : "border-black/10")}>
                <Upload className="w-4 h-4 opacity-50" />
                <span className="text-xs opacity-50">{driverRegData.license ? driverRegData.license.name : "Choose File (Photo/PDF)"}</span>
                <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setDriverRegData({...driverRegData, license: e.target.files?.[0] || null})} />
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm opacity-70">{t('vehicleDocs')}</span>
              <label className={cn("flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed cursor-pointer hover:bg-white/5 transition-colors", theme === 'dark' ? "border-white/20" : "border-black/10")}>
                <Upload className="w-4 h-4 opacity-50" />
                <span className="text-xs opacity-50">{driverRegData.vehicleDocs ? driverRegData.vehicleDocs.name : "Choose File (Photo/PDF)"}</span>
                <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setDriverRegData({...driverRegData, vehicleDocs: e.target.files?.[0] || null})} />
              </label>
            </div>
          </div>
        </div>

        <button onClick={async () => {
          try {
            const { submitDriverApplication, supabase } = await import('./lib/supabase');
            const { data: { user } } = await supabase.auth.getUser();
            if (user && driverRegData.phone && driverRegData.color) {
              await submitDriverApplication(user.id, {
                licenseNumber: driverRegData.licenseNumber || '',
                licenseExpiry: driverRegData.licenseExpiry || '',
                insuranceNumber: driverRegData.insuranceNumber || '',
                insuranceExpiry: driverRegData.insuranceExpiry || '',
                vehicleRegistration: driverRegData.vehicleRegistration || '',
                vehicleType: driverRegData.color,
              });
              confetti();
              alert('Application submitted! Waiting for admin approval.');
              setAppState('map');
            } else {
              alert('Please fill in all required fields');
            }
          } catch (error) {
            console.error('Submit error:', error);
            alert('Failed to submit application');
          }
        }} className={cn("w-full font-bold py-5 rounded-2xl shadow-xl transition-colors", theme === 'dark' ? "bg-white text-black" : "bg-black text-white")}>Submit Application</button>
      </div>
    </div>
  </motion.div>
);

type AppState = 'landing' | 'auth' | 'map' | 'vehicle-selection' | 'searching' | 'driver-found' | 'simulation' | 'driver_reg';

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places", "geometry"];

export default function App() {
  // Check for demo mode in URL
  const isDemoMode = window.location.hash === '#demo';
  const [appState, setAppState] = useState<AppState>(isDemoMode ? 'search' : 'landing');
  const [lang, setLang] = useState('en');
  const [user, setUser] = useState<{ name: string, email: string, photo: string, phone?: string } | null>(isDemoMode ? { name: 'Demo User', email: 'demo@joydrive.com', photo: '', phone: '+27 123 456 789' } : null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedRide, setSelectedRide] = useState(RIDE_TYPES[0]);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [stopAddress, setStopAddress] = useState('');
  const [showStopInput, setShowStopInput] = useState(false);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [pickupDirections, setPickupDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [simulatedPos, setSimulatedPos] = useState<google.maps.LatLngLiteral | null>(null);
  const [pickupSimulatedPos, setPickupSimulatedPos] = useState<google.maps.LatLngLiteral | null>(null);
  const [driverPos, setDriverPos] = useState<google.maps.LatLngLiteral | null>(null);
  const [aiInsight, setAiInsight] = useState("");
  const [heading, setHeading] = useState(0);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);
  const [showRideDetails, setShowRideDetails] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [history, setHistory] = useState<{id: string, from: string, to: string, date: string, price: number, rideType: string}[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [favoriteDrivers, setFavoriteDrivers] = useState<string[]>([]);
  const [favoriteAddresses, setFavoriteAddresses] = useState<{id: string, name: string, address: string}[]>(() => {
    try {
      const saved = localStorage.getItem('joydrive_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist favorites to localStorage
  useEffect(() => {
    localStorage.setItem('joydrive_favorites', JSON.stringify(favoriteAddresses));
  }, [favoriteAddresses]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showCardEntry, setShowCardEntry] = useState(false);
  const [savedCards, setSavedCards] = useState<{id: string, number: string, expiry: string, brand: string}[]>([]);
  const [ratingData, setRatingData] = useState({ driver: 0, vehicle: 0, trip: 0, price: 0, comment: '' });
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [eta, setEta] = useState(5);
  const [driverInfo, setDriverInfo] = useState({ name: "Sibusiso", rating: 4.9, car: "Quantum X-1", plate: "JOY-001-GP", phone: "+27 78 800 2462", color: "Obsidian Black" });
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);
  const [communicationMode, setCommunicationMode] = useState<'message' | 'call'>('message');
  const [messageText, setMessageText] = useState('');
  const [notifications, setNotifications] = useState<{id: string, text: string, time: string}[]>([
    { id: '1', text: 'Welcome to JoyDrive! Enjoy your first ride.', time: 'Just now' }
  ]);
  const [zoom, setZoom] = useState(15);
  const [driverRegData, setDriverRegData] = useState({ phone: '', color: '', license: null as File | null, vehicleDocs: null as File | null });
  const [distance, setDistance] = useState(0);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [suggestionType, setSuggestionType] = useState<'origin' | 'destination'>('origin');
  const [filterType, setFilterType] = useState<'recommended' | 'fastest' | 'cheapest'>('recommended');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<{description: string, placeId: string}[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [tripPhase, setTripPhase] = useState<'pickup' | 'destination'>('pickup');
  const [pathIndex, setPathIndex] = useState(0);
  const [erasedPath, setErasedPath] = useState<google.maps.LatLngLiteral[]>([]);
  const [vehicleRotation, setVehicleRotation] = useState(0);
  const [touchStartAngle, setTouchStartAngle] = useState(0);

  const getSortedRides = () => {
    const rides = [...RIDE_TYPES];
    if (filterType === 'fastest') {
      return rides.sort((a, b) => parseInt(a.time) - parseInt(b.time));
    } else if (filterType === 'cheapest') {
      return rides.sort((a, b) => a.basePrice - b.basePrice);
    }
    return rides;
  };

  const calculatePrice = (rideType: any, distanceKm: number) => {
    const basePrice = rideType.basePrice || 0;
    const pricePerKm = rideType.pricePerKm || 0;
    return Math.max(basePrice, basePrice + (distanceKm * pricePerKm));
  };

  const fetchAddressSuggestions = async (input: string, type: 'origin' | 'destination') => {
    if (!input.trim()) return;
    setLoadingSuggestions(true);
    try {
      const service = new google.maps.places.AutocompleteService();
      const result = await service.getPlacePredictions({
        input: input,
        componentRestrictions: { country: 'za' },
      });
      setAddressSuggestions(result.predictions.map(p => ({ description: p.description, placeId: p.place_id })));
      setSuggestionType(type);
      setShowAddressSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion: {description: string, placeId: string}) => {
    if (suggestionType === 'origin') {
      setOrigin(suggestion.description);
    } else {
      setDestination(suggestion.description);
    }
    setShowAddressSuggestions(false);
    setAddressSuggestions([]);
  };

  const t = (key: string) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en'][key];

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries
  });

  const originRef = useRef<google.maps.places.Autocomplete | null>(null);
  const destRef = useRef<google.maps.places.Autocomplete | null>(null);
  const stopRef = useRef<google.maps.places.Autocomplete | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          if (pos.coords.heading !== null && pos.coords.heading !== undefined) {
            setHeading(pos.coords.heading);
          }
        },
        (error) => {
          console.warn("Location access error:", error);
          setUserLocation({ lat: 48.8566, lng: 2.3522 });
        },
        { 
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  useEffect(() => {
    if (appState === 'landing') {
      setLoadingProgress(0); // Reset progress when entering landing
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setAppState('auth');
            return 100;
          }
          return prev + 1;
        });
      }, 150); // 15 seconds total
      return () => clearInterval(interval);
    }
  }, [appState]);

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        setNotifications(prev => [{ id: '2', text: 'New promotion available! 20% off your next Joy VIP ride.', time: 'Just now' }, ...prev]);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Handle OAuth callback and session
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { supabase, getCurrentUser, getUserProfile, createProfile } = await import('./lib/supabase');
        
        // Check if there's a session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const user = session.user;
          let profile = await getUserProfile(user.id);
          
          // If profile doesn't exist, create it
          if (!profile) {
            const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
            const avatarUrl = user.user_metadata?.avatar_url;
            await createProfile(user.id, user.email || '', fullName, avatarUrl);
            profile = await getUserProfile(user.id);
          }
          
          // Set user and redirect to map
          setUser({
            name: profile?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            photo: profile?.avatar_url || user.user_metadata?.avatar_url || `https://picsum.photos/seed/${user.email}/100/100`,
            phone: profile?.phone || ''
          });
          setAppState('map');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
      }
    };
    
    handleAuthCallback();
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = async () => {
          canvas.width = 400;
          canvas.height = 400;
          ctx?.drawImage(img, 0, 0, 400, 400);
          
          canvas.toBlob(async (blob) => {
            if (blob) {
              try {
                const { uploadProfilePhoto, updateProfile, supabase } = await import('./lib/supabase');
                const { data: { user: authUser } } = await supabase.auth.getUser();
                
                if (authUser) {
                  const compressedFile = new File([blob], file.name, { type: 'image/jpeg' });
                  const photoUrl = await uploadProfilePhoto(authUser.id, compressedFile);
                  if (photoUrl) {
                    await updateProfile(authUser.id, { avatar_url: photoUrl });
                    setUser({ ...user, photo: photoUrl });
                    alert('Photo uploaded successfully!');
                  }
                }
              } catch (error) {
                console.error('Photo upload error:', error);
                alert('Failed to upload photo');
              }
            }
          }, 'image/jpeg', 0.8);
        };
        
        img.onerror = () => {
          alert('Failed to load image');
        };
        
        img.src = URL.createObjectURL(file);
      } catch (error) {
        console.error('Photo processing error:', error);
        alert('Failed to process photo');
      }
    }
  };

  const handleSocialLogin = async (provider: string) => {
    try {
      if (provider === 'Google') {
        const { signInWithGoogle } = await import('./lib/supabase');
        await signInWithGoogle();
      } else if (provider === 'Facebook') {
        const { signInWithFacebook } = await import('./lib/supabase');
        await signInWithFacebook();
      } else if (provider === 'Manual') {
        // Manual registration - show form
        setAppState('auth');
        return;
      }
    } catch (error) {
      console.error(`${provider} login error:`, error);
      alert(`Failed to sign in with ${provider}`);
    }
  };

  const handleManualRegister = async (firstName: string, lastName: string, email: string) => {
    try {
      const { supabase, createProfile } = await import('./lib/supabase');
      
      // Sign up with email and password
      const { data, error } = await supabase.auth.signUp({
        email,
        password: Math.random().toString(36).slice(-12), // Generate random password
        options: {
          data: {
            full_name: `${firstName} ${lastName}`,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Create profile
        await createProfile(data.user.id, email, `${firstName} ${lastName}`);
        
        setUser({
          name: `${firstName} ${lastName}`,
          email: email,
          photo: `https://picsum.photos/seed/${email}/100/100`,
          phone: ''
        });
        setAppState('map');
      }
    } catch (error) {
      console.error('Manual registration error:', error);
      alert('Registration failed. Please try again.');
    }
  };

  const startSimulation = () => {
    if (!directions) return;
    setAppState('simulation');
    setZoom(18); // Auto-zoom for better avenue visibility
    
    // Add to history
    const newRide = {
      id: Math.random().toString(36).substr(2, 9),
      from: origin,
      to: destination,
      date: new Date().toLocaleString(),
      price: selectedRide.price,
      rideType: selectedRide.name
    };
    setHistory(prev => [newRide, ...prev]);

    const path = directions.routes[0].overview_path;
    const steps = directions.routes[0].legs[0].steps;
    let index = 0;
    let stepIndex = 0;

    const speak = (text: string) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'fr' ? 'fr-FR' : 'en-US';
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Google US English'));
      if (femaleVoice) utterance.voice = femaleVoice;
      window.speechSynthesis.speak(utterance);
    };

    const interval = setInterval(() => {
      if (index >= path.length) {
        clearInterval(interval);
        const arrivalSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        arrivalSound.play().catch(() => {});
        speak(lang === 'fr' ? "Vous êtes arrivé à destination." : "You have arrived at your destination.");
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        
        setTimeout(() => {
          setAppState('map');
          setShowRating(true);
        }, 3000);
        return;
      }

      // Check for navigation instructions
      if (stepIndex < steps.length) {
        const step = steps[stepIndex];
        const stepStart = step.start_location;
        const currentPos = path[index];
        const dist = google.maps.geometry.spherical.computeDistanceBetween(currentPos, stepStart);
        
        if (dist < 20) {
          const instruction = step.instructions.replace(/<[^>]*>?/gm, '');
          speak(instruction);
          stepIndex++;
        }
      }

      const currentPos = path[index];
      const nextPos = path[index + 1] || currentPos;
      const heading = google.maps.geometry.spherical.computeHeading(currentPos, nextPos);
      
      setSimulatedPos({ lat: currentPos.lat(), lng: currentPos.lng() });
      setHeading(heading);
      index++;
    }, 1000); // Slower speed (1 second per point)
  };

  const handleEmergency = () => {
    setShowEmergencyConfirm(true);
  };

  const executeEmergencyCall = () => {
    window.location.href = "tel:10111";
    setShowEmergencyConfirm(false);
  };

  const findDriver = () => {
    if (paymentMethod === 'card') {
      setShowCardEntry(true);
      return;
    }
    startFindingDriver();
  };

  const startFindingDriver = () => {
    setAppState('searching');
    
    // Simulate finding a driver nearby
    const directionsService = new google.maps.DirectionsService();
    const finalOrigin = originRef.current?.getPlace()?.formatted_address || origin;
    
    // Random nearby point for driver start
    const driverStart = {
      lat: (userLocation?.lat || center.lat) + (Math.random() - 0.5) * 0.02,
      lng: (userLocation?.lng || center.lng) + (Math.random() - 0.5) * 0.02
    };

    directionsService.route(
      {
        origin: driverStart,
        destination: finalOrigin,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setPickupDirections(result);
          setTimeout(() => {
            setAppState('driver-found');
            const foundSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
            foundSound.play().catch(() => {});
            
            // Start pickup simulation
            startPickupSimulation(result);
          }, 4000);
        }
      }
    );
  };

  const startPickupSimulation = (pickupResult: google.maps.DirectionsResult) => {
    const path = pickupResult.routes[0].overview_path;
    let pathIndex = 0;
    let subIndex = 0;
    const SUBSTEPS = 100;
    const INTERVAL = 300; // Vitesse normale et fluide
    setPathIndex(0);
    setErasedPath([]);
    setTripPhase('pickup');
    
    const interval = setInterval(() => {
      if (pathIndex >= path.length - 1) {
        clearInterval(interval);
        setEta(0);
        const speak = (text: string) => {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = lang === 'fr' ? 'fr-FR' : 'en-US';
          window.speechSynthesis.speak(utterance);
        };
        speak(lang === 'fr' ? "Votre chauffeur est arrivé !" : "Your driver has arrived!");
        setTripPhase('destination');
        if (directions) {
          startDestinationSimulation(directions);
        }
        return;
      }

      const currentPos = path[pathIndex];
      const nextPos = path[pathIndex + 1];
      const progress = subIndex / SUBSTEPS;
      
      const interpolatedLat = currentPos.lat() + (nextPos.lat() - currentPos.lat()) * progress;
      const interpolatedLng = currentPos.lng() + (nextPos.lng() - currentPos.lng()) * progress;
      
      setPickupSimulatedPos({ lat: interpolatedLat, lng: interpolatedLng });
      setErasedPath(path.slice(0, pathIndex + 1));
      
      if (subIndex === 0) {
        const heading = google.maps.geometry.spherical.computeHeading(currentPos, nextPos);
        setHeading(heading);
      }
      
      const totalRemaining = (path.length - pathIndex - 1) + (1 - progress);
      const estimatedTime = Math.max(1, Math.ceil(totalRemaining * 3));
      setEta(estimatedTime);
      
      subIndex++;
      if (subIndex >= SUBSTEPS) {
        subIndex = 0;
        pathIndex++;
      }
    }, INTERVAL);
  };

  const startDestinationSimulation = (destResult: google.maps.DirectionsResult) => {
    const path = destResult.routes[0].overview_path;
    let pathIndex = 0;
    let subIndex = 0;
    const SUBSTEPS = 100;
    const INTERVAL = 5000; // Réduit de 95% - trajet très lent et fluide (16x plus lent)
    setPathIndex(0);
    setErasedPath([]);
    
    const interval = setInterval(() => {
      if (pathIndex >= path.length - 1) {
        clearInterval(interval);
        setEta(0);
        const speak = (text: string) => {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = lang === 'fr' ? 'fr-FR' : 'en-US';
          window.speechSynthesis.speak(utterance);
        };
        speak(lang === 'fr' ? "Vous etes arrive !" : "You have arrived!");
        setAppState('rating');
        return;
      }

      const currentPos = path[pathIndex];
      const nextPos = path[pathIndex + 1];
      const progress = subIndex / SUBSTEPS;
      
      const interpolatedLat = currentPos.lat() + (nextPos.lat() - currentPos.lat()) * progress;
      const interpolatedLng = currentPos.lng() + (nextPos.lng() - currentPos.lng()) * progress;
      
      setSimulatedPos({ lat: interpolatedLat, lng: interpolatedLng });
      // Effacer la ligne derrière le véhicule - garder seulement la ligne future
      const remainingPath = path.slice(pathIndex + 1);
      setErasedPath(remainingPath);
      
      if (subIndex === 0) {
        const heading = google.maps.geometry.spherical.computeHeading(currentPos, nextPos);
        setHeading(heading);
      }
      
      const totalRemaining = (path.length - pathIndex - 1) + (1 - progress);
      const estimatedTime = Math.max(1, Math.ceil(totalRemaining * 3));
      setEta(estimatedTime);
      
      subIndex++;
      if (subIndex >= SUBSTEPS) {
        subIndex = 0;
        pathIndex++;
      }
    }, INTERVAL);
  };

  const calculateRoute = async () => {
    if (!origin || !destination) return;
    
    const finalOrigin = originRef.current?.getPlace()?.formatted_address || origin;
    const finalDest = destRef.current?.getPlace()?.formatted_address || destination;
    const finalStop = stopRef.current?.getPlace()?.formatted_address || stopAddress;

    setDirections(null);
    const directionsService = new google.maps.DirectionsService();
    
    const waypoints = finalStop ? [{ location: finalStop, stopover: true }] : [];

    directionsService.route(
      {
        origin: finalOrigin,
        destination: finalDest,
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
          const totalDistance = result.routes[0].legs.reduce((sum, leg) => sum + (leg.distance?.value || 0), 0) / 1000;
          setDistance(totalDistance);
          setAppState('vehicle-selection');
          generateAiInsight(finalOrigin, finalDest);
        } else {
          console.error(`Directions request failed due to ${status}`);
          let errorMsg = `Could not calculate route: ${status}`;
          if (status === 'REQUEST_DENIED') {
            errorMsg = "Google Maps Directions API is not enabled. Please check your Google Cloud Console.";
          } else if (status === 'ZERO_RESULTS') {
            errorMsg = "No route found between these locations. Please check the addresses.";
          } else if (status === 'NOT_FOUND') {
            errorMsg = "One or more addresses could not be found.";
          }
          alert(errorMsg);
        }
      }
    );
  };

  const generateAiInsight = async (from: string, to: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze the trip from ${from} to ${to}. Give a 15-word luxury travel insight.`,
      });
      setAiInsight(response.text || "Optimized for your comfort.");
    } catch (e) {
      setAiInsight("JoyDrive Intelligence: Route optimized.");
    }
  };

  return (
    <div 
      className={cn("relative w-full h-screen overflow-hidden transition-colors duration-500", theme === 'dark' ? "bg-black text-white" : "bg-white text-black")}
      style={{
        '--glass-bg': theme === 'dark' 
          ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)' 
          : 'linear-gradient(135deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.02) 100%)',
        '--glass-border': theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
      } as React.CSSProperties}
    >
      <AnimatePresence>
        {appState === 'landing' && <LandingPage theme={theme} loadingProgress={loadingProgress} t={t} />}
        {appState === 'auth' && <AuthPage theme={theme} t={t} handleSocialLogin={handleSocialLogin} setAppState={setAppState} handleManualRegister={handleManualRegister} />}
        {appState === 'driver_reg' && <DriverRegPage theme={theme} t={t} setAppState={setAppState} driverRegData={driverRegData} setDriverRegData={setDriverRegData} handlePhotoUpload={handlePhotoUpload} />}
      </AnimatePresence>

      {/* Map Layer */}
      <div className="absolute inset-0 z-0">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={simulatedPos || userLocation || center}
            zoom={zoom}
            options={theme === 'dark' ? darkMapOptions : lightMapOptions}
            onLoad={(mapInstance) => {
              // Store map instance for UserLocationMarker
              (window as any).joydrive_map = mapInstance;
            }}
          >
            {directions && <DirectionsRenderer directions={directions} options={{
              polylineOptions: { 
                strokeColor: '#3B82F6', // Blue route line
                strokeWeight: 6, 
                strokeOpacity: simulatedPos && tripPhase === 'destination' ? 0.3 : 0.9,
                geodesic: true
              },
              markerOptions: { visible: false }
            }} />}
            {erasedPath.length > 0 && simulatedPos && tripPhase === 'destination' && (
              <Polyline
                path={erasedPath}
                options={{
                  strokeColor: '#3B82F6',
                  strokeWeight: 6,
                  strokeOpacity: 1,
                  geodesic: true
                }}
              />
            )}
            {pickupDirections && <DirectionsRenderer directions={pickupDirections} options={{
              polylineOptions: { 
                strokeColor: '#FDB931', // Yellow pickup line
                strokeWeight: 4, 
                strokeOpacity: 1,
                icons: [{
                  icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 4 },
                  offset: '0',
                  repeat: '20px'
                }]
              },
              markerOptions: { visible: false }
            }} />}
            {userLocation && !directions && (
              <UserLocationMarker
                position={userLocation}
                heading={heading}
                map={(window as any).joydrive_map || null}
              />
            )}
            {directions && directions.routes[0].legs[0].end_location && (
              <Marker 
                position={directions.routes[0].legs[0].end_location}
                icon={{
                  path: "M2,2H22V22H2M4,4V20H20V4H4M6,6H10V10H6V6M14,6H18V10H14V6M6,14H10V18H6V14M14,14H18V18H14V14Z",
                  scale: 1,
                  fillColor: '#000000',
                  fillOpacity: 1,
                  strokeWeight: 1,
                  strokeColor: '#FFFFFF',
                  anchor: new google.maps.Point(12, 12),
                }}
              />
            )}
            {pickupSimulatedPos && (
              <>
                <OverlayView
                  position={pickupSimulatedPos}
                  mapPaneName={OverlayView.FLOAT_PANE}
                >
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="relative"
                    style={{ 
                      transform: 'translate(-50%, -50%)', 
                      width: '80px', 
                      height: '80px'
                    }}
                  >
                    {/* Vehicle top view image */}
                    <motion.div 
                      className="w-full h-full flex items-center justify-center"
                      animate={{ rotate: heading + 90 }}
                      transition={{ rotate: { duration: 0.5, ease: 'easeInOut' }, y: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }}
                      style={{
                        filter: `drop-shadow(0 8px 16px rgba(0,0,0,0.4))`,
                        transformOrigin: 'center center'
                      }}
                    >
                      <img 
                        src={selectedRide.topViewUrl || 'https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/vehicle-topview-white-XiS3QfDtGyuSNM7rAjtcJt.webp'}
                        alt="Vehicle"
                        className="w-full h-full object-contain"
                      />
                    </motion.div>
                  </motion.div>
                </OverlayView>
              </>
            )}
            {simulatedPos && (
              <>
                <OverlayView
                  position={simulatedPos}
                  mapPaneName={OverlayView.FLOAT_PANE}
                >
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="relative"
                    style={{ 
                      transform: 'translate(-50%, -50%)', 
                      width: '80px', 
                      height: '80px'
                    }}
                  >
                    {/* Vehicle top view image */}
                    <motion.div 
                      className="w-full h-full flex items-center justify-center"
                      animate={{ rotate: heading + 90 }}
                      transition={{ rotate: { duration: 0.5, ease: 'easeInOut' }, y: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }}
                      style={{
                        filter: `drop-shadow(0 8px 16px rgba(0,0,0,0.4))`,
                        transformOrigin: 'center center'
                      }}
                    >
                      <img 
                        src={selectedRide.topViewUrl || 'https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/vehicle-topview-white-XiS3QfDtGyuSNM7rAjtcJt.webp'}
                        alt="Vehicle"
                        className="w-full h-full object-contain"
                      />
                    </motion.div>
                  </motion.div>
                </OverlayView>
              </>
            )}
            {false && (
              <>
                <Marker 
                  position={simulatedPos} 
                  icon={{
                    path: "M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z",
                    scale: 1.5,
                    fillColor: selectedRide.color || '#FDB931',
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: '#FFFFFF',
                    anchor: new google.maps.Point(12, 12),
                    rotation: heading
                  }} 
                />
                <OverlayView
                  position={google.maps.geometry.spherical.computeOffset(
                    new google.maps.LatLng(simulatedPos.lat, simulatedPos.lng),
                    -10, // 10 meters behind
                    heading
                  ).toJSON()}
                  mapPaneName={OverlayView.FLOAT_PANE}
                >
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative"
                    style={{ transform: 'translate(-50%, -50%)' }}
                  >
                    {/* The "Circle" with the flag */}
                    <div className="w-12 h-12 rounded-full border-2 border-[#FDB931] shadow-[0_0_20px_rgba(253,185,49,0.5)] overflow-hidden bg-white flex items-center justify-center p-0.5">
                      <div className="w-full h-full rounded-full overflow-hidden relative">
                        <motion.img 
                          src="https://flagcdn.com/za.svg" 
                          alt="South Africa"
                          className="w-full h-full object-cover"
                          animate={{ 
                            x: [-2, 2, -2],
                            skewX: [-5, 5, -5]
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 2,
                            ease: "easeInOut"
                          }}
                          referrerPolicy="no-referrer"
                        />
                        {/* Glossy effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none" />
                      </div>
                    </div>
                    
                    {/* Floating animation for the whole bubble */}
                    <motion.div
                      animate={{ y: [-2, 2, -2] }}
                      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                      className="absolute -top-1 -right-1 w-3 h-3 bg-[#FDB931] rounded-full border border-white shadow-sm"
                    />
                  </motion.div>
                </OverlayView>
              </>
            )}
          </GoogleMap>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-900">
            {loadError ? (
              <div className="p-8 text-center glass rounded-3xl max-w-md shadow-2xl border-red-500/20">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-2xl font-display mb-4">Configuration Requise</h3>
                <div className="text-sm opacity-70 leading-relaxed text-left space-y-4">
                  <p className="font-bold text-red-400">Erreur détectée : Legacy API Not Activated</p>
                  <p>Pour corriger cela, vous devez activer les versions classiques des APIs dans votre <a href="https://console.cloud.google.com/google/maps-apis/library" target="_blank" className="underline text-white">Console Google Cloud</a> :</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Maps JavaScript API</strong> (Déjà actif)</li>
                    <li><strong>Places API</strong> (Version classique, pas seulement "New")</li>
                    <li><strong>Directions API</strong> (Version classique, pas seulement "Routes")</li>
                  </ul>
                  <p className="text-[10px] italic mt-4 opacity-50">Note : La bibliothèque actuelle nécessite ces versions pour l'autocomplétion et le calcul d'itinéraire en temps réel.</p>
                </div>
                <button 
                  onClick={() => window.location.reload()} 
                  className="w-full bg-white text-black font-bold py-4 rounded-2xl mt-8 hover:bg-neutral-200 transition-colors"
                >
                  J'ai activé les APIs, actualiser
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <Car className="w-12 h-12 text-[#FDB931] animate-float" />
                <div className="animate-pulse joy-gradient font-display text-2xl tracking-[0.5em] font-bold">JOYDRIVE</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* UI Overlays */}
      {appState !== 'landing' && appState !== 'auth' && (
        <>
          <header className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-center pointer-events-none">
            <div className="pointer-events-auto">
              <button onClick={() => setIsMenuOpen(true)} className="w-12 h-12 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                <Menu className="w-6 h-6" />
              </button>
            </div>
            <div className="flex items-center gap-2 pointer-events-none">
              <Car className="w-6 h-6 text-[#FDB931]" />
              <h1 className="text-2xl font-display tracking-[0.2em] joy-gradient font-bold">JOYDRIVE</h1>
            </div>
            <div className="w-12 h-12 pointer-events-auto">
              <button onClick={() => setShowProfileEdit(true)} className="w-12 h-12 glass rounded-full overflow-hidden border border-white/20">
                <img src={user?.photo || "https://picsum.photos/seed/user/100/100"} className="w-full h-full object-cover" alt="Profile" referrerPolicy="no-referrer" />
              </button>
            </div>
          </header>

          {/* Side Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMenuOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md z-40" />
                <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="absolute top-0 left-0 bottom-0 w-80 glass backdrop-blur-3xl z-50 p-8 flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                      <div className="flex justify-between items-center mb-12">
                        <div className="flex items-center gap-2">
                          <Car className="w-8 h-8 text-[#FDB931]" />
                          <h2 className="text-3xl font-display joy-gradient font-bold">JoyDrive</h2>
                        </div>
                        <button onClick={() => setIsMenuOpen(false)} className={cn("p-2 rounded-full", theme === 'dark' ? "hover:bg-white/10" : "hover:bg-black/5")}><X className="w-6 h-6 opacity-50" /></button>
                      </div>

                    <div className="flex items-center gap-4 mb-12 p-4 glass rounded-2xl shadow-lg">
                      <div className="relative">
                        <img src={user?.photo || "https://picsum.photos/seed/user/100/100"} className="w-16 h-16 rounded-full object-cover border-3 border-[#FDB931] shadow-lg shadow-[#FDB931]/30" />
                        <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-black" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-base">{user?.name || "Guest User"}</p>
                        <p className="text-[10px] opacity-50 uppercase tracking-widest">{user?.email || "guest@joydrive.com"}</p>
                        <div className="flex items-center gap-1 mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={cn("w-3 h-3", star <= 4 ? "text-[#FDB931] fill-[#FDB931]" : "text-white/20")} />
                          ))}
                          <span className="text-[10px] opacity-60 ml-1">4.0</span>
                        </div>
                      </div>
                    </div>

                      <nav className="flex-1 space-y-2 overflow-y-auto pr-2">
                        {[
                          { icon: User, label: t('profile'), action: () => setShowProfileEdit(true) },
                          { icon: Heart, label: t('favorites'), action: () => setShowFavorites(true) },
                          { icon: History, label: t('history'), action: () => setShowHistory(true) },
                          { icon: Bell, label: t('notifications'), action: () => setShowNotifications(true) },
                        { icon: theme === 'dark' ? Sun : Moon, label: theme === 'dark' ? t('lightMode') : t('darkMode'), action: () => setTheme(theme === 'dark' ? 'light' : 'dark') },
                        { icon: CreditCard, label: t('payment'), action: () => setShowPayment(true) },
                        { icon: AlertTriangle, label: t('emergency'), action: handleEmergency, className: "text-red-500" },
                        { icon: Briefcase, label: t('becomeDriver'), action: () => setAppState('driver_reg') },
                        { icon: Globe, label: t('language'), action: () => setShowLanguageSelect(true) },
                        { icon: Info, label: t('about'), action: () => setShowAbout(true) },
                        { icon: FileText, label: t('privacy'), action: () => setShowPrivacy(true) },
                      ].map((item, i) => (
                        <button key={i} onClick={() => { item.action(); setIsMenuOpen(false); }} className={cn("flex items-center gap-4 w-full text-left group p-3 rounded-xl hover:bg-white/5 transition-colors", item.className)}>
                          <div className={cn("w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors", item.className && "bg-red-500/10")}>
                            <item.icon className="w-5 h-5 opacity-70" />
                          </div>
                          <span className="text-sm font-medium opacity-80 group-hover:opacity-100 transition-opacity">{item.label}</span>
                        </button>
                      ))}
                  </nav>

                  <div className="mt-auto pt-8 space-y-4">
                    <button onClick={() => setAppState('landing')} className="flex items-center gap-4 text-red-400/80 hover:text-red-400 transition-colors w-full p-3 rounded-xl hover:bg-red-400/5">
                      <LogOut className="w-5 h-5" />
                      <span className="text-sm font-bold uppercase tracking-widest">{t('logout')}</span>
                    </button>
                    <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-4 text-red-500/60 hover:text-red-500 transition-colors w-full p-3 rounded-xl hover:bg-red-500/5">
                      <Zap className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase tracking-widest">{t('deleteAccountPerm')}</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Modals */}
          <AnimatePresence>
            {showProfileEdit && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("fixed inset-0 z-[120] backdrop-blur-2xl flex items-center justify-center p-6", theme === 'dark' ? "bg-black/80" : "bg-white/80")}>
                <div className="w-full max-w-sm glass backdrop-blur-3xl rounded-3xl p-8 text-center shadow-2xl">
                  <h3 className="text-2xl font-display mb-8 font-bold tracking-tight">Edit Profile</h3>
                  <div className="relative w-32 h-32 mx-auto mb-8">
                    <img src={user?.photo || "https://picsum.photos/seed/user/100/100"} className={cn("w-full h-full rounded-full object-cover border-4 shadow-lg", theme === 'dark' ? "border-[#FDB931]/50 shadow-[#FDB931]/20" : "border-[#FDB931]/60 shadow-[#FDB931]/30")} />
                    <button onClick={() => fileInputRef.current?.click()} className={cn("absolute bottom-0 right-0 w-10 h-10 rounded-full flex items-center justify-center shadow-xl transition-colors", theme === 'dark' ? "bg-white text-black" : "bg-black text-white")}>
                      <Camera className="w-5 h-5" />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
                  </div>
                  <input type="text" value={user?.name} onChange={(e) => user && setUser({ ...user, name: e.target.value })} className="w-full glass p-4 rounded-2xl mb-4 text-center" placeholder="Your Name" />
                  <input type="tel" value={user?.phone || ''} onChange={(e) => user && setUser({ ...user, phone: e.target.value })} className="w-full glass p-4 rounded-2xl mb-4 text-center" placeholder="Your Phone Number" />
                  <button onClick={async () => {
                    try {
                      const { updateProfile, supabase } = await import('./lib/supabase');
                      const { data: { user: authUser } } = await supabase.auth.getUser();
                      if (authUser && user) {
                        await updateProfile(authUser.id, { phone: user.phone });
                        alert('Profile updated successfully!');
                      }
                    } catch (error) {
                      console.error('Profile update error:', error);
                      alert('Failed to update profile');
                    }
                    setShowProfileEdit(false);
                  }} className={cn("w-full font-bold py-4 rounded-2xl transition-colors", theme === 'dark' ? "bg-white text-black" : "bg-black text-white")}>Save Changes</button>
                </div>
              </motion.div>
            )}

            {showLanguageSelect && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("fixed inset-0 z-[120] backdrop-blur-2xl flex items-center justify-center p-6", theme === 'dark' ? "bg-black/80" : "bg-white/80")}>
                <div className="w-full max-w-sm glass backdrop-blur-3xl rounded-3xl p-8 shadow-2xl">
                  <h3 className="text-2xl font-display mb-6 text-center">Select Language</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {LANGUAGES.map(l => (
                      <button key={l.code} onClick={() => { setLang(l.code); setShowLanguageSelect(false); }} className={cn("w-full p-4 rounded-2xl border text-left flex justify-between items-center transition-colors", lang === l.code ? (theme === 'dark' ? "bg-white text-black border-white" : "bg-black text-white border-black") : "border-white/10 hover:bg-white/5")}>
                        {l.name}
                        {lang === l.code && <CheckCircle2 className="w-5 h-5" />}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {(showAbout || showPrivacy || showHistory || showNotifications) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("fixed inset-0 z-[120] backdrop-blur-2xl flex items-center justify-center p-6", theme === 'dark' ? "bg-black/80" : "bg-white/80")}>
                <div className="w-full max-w-md glass backdrop-blur-3xl rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                  <button onClick={() => { setShowAbout(false); setShowPrivacy(false); setShowHistory(false); setShowNotifications(false); }} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors z-50 cursor-pointer"><X className="w-5 h-5" /></button>
                  
                  {showNotifications ? (
                    <>
                      <h3 className="text-2xl font-display mb-6">{t('notifications')}</h3>
                      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                        {notifications.map((n) => (
                          <div key={n.id} className={cn("p-4 rounded-2xl border", theme === 'dark' ? "bg-white/5 border-white/10" : "bg-black/5 border-black/5")}>
                            <p className="text-sm opacity-80 mb-1">{n.text}</p>
                            <p className="text-[10px] opacity-40 uppercase">{n.time}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : showHistory ? (
                    <>
                      <h3 className="text-2xl font-display mb-6">{t('history')}</h3>
                      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                        {history.length === 0 ? (
                          <div className="text-center py-12 opacity-40 italic">No trips yet. Your journey starts here.</div>
                        ) : (
                          history.map((ride) => (
                            <div key={ride.id} className={cn("border rounded-2xl p-4 space-y-2 transition-colors", theme === 'dark' ? "bg-white/5 border-white/10" : "bg-black/5 border-black/5")}>
                              <div className="flex justify-between items-start">
                                <div className="text-[10px] opacity-50 uppercase tracking-tighter">{ride.date}</div>
                                <div className="font-bold joy-gradient text-lg">R {ride.price.toFixed(2)}</div>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <div className={cn("w-2 h-2 rounded-full", theme === 'dark' ? "bg-white" : "bg-black")} />
                                <div className="truncate opacity-80">{ride.from}</div>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <div className={cn("w-2 h-2 border", theme === 'dark' ? "border-white" : "border-black")} />
                                <div className="truncate opacity-80">{ride.to}</div>
                              </div>
                              <div className={cn("text-[9px] uppercase tracking-[0.2em] opacity-30 pt-2 border-t", theme === 'dark' ? "border-white/5" : "border-black/5")}>{ride.rideType}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-2xl font-display mb-6">{showAbout ? t('about') : t('privacy')}</h3>
                      <div className="max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                        <p className="text-sm opacity-70 leading-relaxed whitespace-pre-line">{showAbout ? ABOUT_CONTENT : PRIVACY_POLICY}</p>
                      </div>
                    </>
                  )}
                  
                  <button onClick={() => { setShowAbout(false); setShowPrivacy(false); setShowHistory(false); }} className={cn("w-full font-bold py-4 rounded-2xl mt-4 transition-colors", theme === 'dark' ? "bg-white text-black" : "bg-black text-white")}>Close</button>
                </div>
              </motion.div>
            )}

            {showFavorites && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("fixed inset-0 z-[120] backdrop-blur-2xl flex items-center justify-center p-6", theme === 'dark' ? "bg-black/80" : "bg-white/80")}>
                <div className="w-full max-w-md glass backdrop-blur-3xl rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[80vh] custom-scrollbar">
                  <h3 className="text-2xl font-display mb-8 text-center joy-gradient font-bold">{t('favorites')}</h3>
                  
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-4 flex items-center gap-2">
                        <User className="w-4 h-4" /> {t('favoriteDrivers')}
                      </h4>
                      <div className="space-y-2">
                        {favoriteDrivers.length > 0 ? favoriteDrivers.map((d, i) => (
                          <div key={i} className="flex items-center justify-between p-4 glass rounded-2xl">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#FDB931]/20 flex items-center justify-center">
                                <User className="w-5 h-5 text-[#FDB931]" />
                              </div>
                              <span className="font-bold text-sm">{d}</span>
                            </div>
                            <button onClick={() => setFavoriteDrivers(prev => prev.filter(item => item !== d))} className="text-red-500/50 hover:text-red-500 transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )) : <p className="text-xs opacity-40 text-center py-4 italic">No favorite drivers yet</p>}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> {t('favoriteAddresses')}
                      </h4>
                      <div className="space-y-2">
                        {favoriteAddresses.length > 0 ? favoriteAddresses.map((a, i) => (
                          <div key={i} className="flex items-center justify-between p-4 glass rounded-2xl">
                            <div className="flex-1 min-w-0 mr-4">
                              <p className="font-bold text-sm truncate">{a.name}</p>
                              <p className="text-[10px] opacity-50 truncate">{a.address}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => { setDestination(a.address); setShowFavorites(false); }} className="text-[#FDB931] hover:scale-110 transition-transform">
                                <ArrowRight className="w-4 h-4" />
                              </button>
                              <button onClick={() => setFavoriteAddresses(prev => prev.filter(item => item.id !== a.id))} className="text-red-500/50 hover:text-red-500 transition-colors">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )) : <p className="text-xs opacity-40 text-center py-4 italic">No favorite addresses yet</p>}
                      </div>
                    </div>
                  </div>

                  <button onClick={() => setShowFavorites(false)} className={cn("w-full font-bold py-4 rounded-2xl mt-8 transition-colors", theme === 'dark' ? "bg-white text-black" : "bg-black text-white")}>Close</button>
                </div>
              </motion.div>
            )}

            {showRideDetails && selectedRide && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("fixed inset-0 z-[120] backdrop-blur-2xl flex items-center justify-center p-6", theme === 'dark' ? "bg-black/80" : "bg-white/80")}>
                <div className="w-full max-w-md glass backdrop-blur-3xl rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
                  <button onClick={() => setShowRideDetails(false)} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors z-50 cursor-pointer"><X className="w-5 h-5" /></button>
                  
                  <div className="mb-8 text-center">
                    <div className="w-full h-48 mb-6 flex items-center justify-center cursor-grab active:cursor-grabbing" 
                      onTouchStart={(e) => {
                        if (e.touches.length === 2) {
                          const touch1 = e.touches[0];
                          const touch2 = e.touches[1];
                          const angle = Math.atan2(touch2.clientY - touch1.clientY, touch2.clientX - touch1.clientX) * (180 / Math.PI);
                          setTouchStartAngle(angle);
                        }
                      }}
                      onTouchMove={(e) => {
                        if (e.touches.length === 2) {
                          const touch1 = e.touches[0];
                          const touch2 = e.touches[1];
                          const angle = Math.atan2(touch2.clientY - touch1.clientY, touch2.clientX - touch1.clientX) * (180 / Math.PI);
                          const diff = angle - touchStartAngle;
                          setVehicleRotation(prev => prev + diff);
                          setTouchStartAngle(angle);
                        }
                      }}
                    >
                      {selectedRide.id === 'joy_lite' && <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/vehicle-side-yellow-lite-ABswLC9mzjbfYVTuxDAj5E.webp" alt={selectedRide.name} className="w-full h-full object-contain" style={{ transform: `rotate(${vehicleRotation}deg)`, transition: 'transform 0.1s linear' }} />}
                      {selectedRide.id === 'joy_economy' && <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/vehicle-side-white-economy-v2-VtuXfQGSyrevMmbuwjMwEA.webp" alt={selectedRide.name} className="w-full h-full object-contain" style={{ transform: `rotate(${vehicleRotation}deg)`, transition: 'transform 0.1s linear' }} />}
                      {selectedRide.id === 'joy_confort' && <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/vehicle-side-white-economy-v2-VtuXfQGSyrevMmbuwjMwEA.webp" alt={selectedRide.name} className="w-full h-full object-contain" style={{ transform: `rotate(${vehicleRotation}deg)`, transition: 'transform 0.1s linear' }} />}
                      {selectedRide.id === 'joy_women' && <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/vehicle-side-women-white-confort-A9zJWkLABFbFvfaRSubUwx.png" alt={selectedRide.name} className="w-full h-full object-contain" style={{ transform: `rotate(${vehicleRotation}deg)`, transition: 'transform 0.1s linear' }} />}
                      {selectedRide.id === 'joy_express' && <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/vehicle-side-white-express-v2-fhHNuH8veh8LjKV9o5s2wb.webp" alt={selectedRide.name} className="w-full h-full object-contain" style={{ transform: `rotate(${vehicleRotation}deg)`, transition: 'transform 0.1s linear' }} />}
                      {selectedRide.id === 'joy_premium' && <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/vehicle-side-premium-gray-pale-3Dt54izWLtYiX6a7rhaXMQ.png" alt={selectedRide.name} className="w-full h-full object-contain" style={{ transform: `rotate(${vehicleRotation}deg)`, transition: 'transform 0.1s linear' }} />}
                      {selectedRide.id === 'joy_xl' && <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/vehicle-side-black-xl-phares-bande-Y4wvFEG5hS4zJHrPDMozZy.webp" alt={selectedRide.name} className="w-full h-full object-contain" style={{ transform: `rotate(${vehicleRotation}deg)`, transition: 'transform 0.1s linear' }} />}
                      {selectedRide.id === 'joy_parcels' && <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/delivery-box-3d-orange-RHRPuegGaDmXqRnCa68UNw.webp" alt={selectedRide.name} className="w-full h-full object-contain" style={{ transform: `rotate(${vehicleRotation}deg)`, transition: 'transform 0.1s linear' }} />}
                      {selectedRide.id === 'joy_moving' && <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663481567011/WbfXbPqLBGHvZyWv.png" alt={selectedRide.name} className="w-full h-full object-contain" style={{ transform: `rotate(${vehicleRotation}deg)`, transition: 'transform 0.1s linear' }} />}
                    </div>
                    <p className="text-xs opacity-50 mb-4">Utilisez deux doigts pour tourner le véhicule</p>
                    <h3 className="text-2xl font-display font-bold mb-2">{selectedRide.name}</h3>
                    <p className="text-sm opacity-70">{selectedRide.description}</p>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center p-4 glass rounded-2xl">
                      <span className="text-sm opacity-70">Tarif</span>
                      <span className="font-bold">R {selectedRide.basePrice.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 glass rounded-2xl">
                      <span className="text-sm opacity-70">Annulation</span>
                      <span className="font-bold">R {(selectedRide.basePrice * 0.5).toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 glass rounded-2xl">
                      <span className="text-sm opacity-70">Booking Fee</span>
                      <span className="font-bold">5%</span>
                    </div>
                    <div className="flex justify-between items-center p-4 glass rounded-2xl">
                      <span className="text-sm opacity-70">Réduction</span>
                      <span className="font-bold text-green-500">20%</span>
                    </div>
                    <div className="flex justify-between items-center p-4 glass rounded-2xl">
                      <span className="text-sm opacity-70">Sièges</span>
                      <span className="font-bold">{selectedRide.seats}</span>
                    </div>
                  </div>

                  <p className="text-xs opacity-50 text-center mb-6 leading-relaxed">Les estimations de prix peuvent varier si les frais de péages ou les majorations diffèrent (selon chaque ville). Si le trajet change, le prix sera calculé sur la base des tarifs fournis.</p>

                  <button onClick={() => setShowRideDetails(false)} className={cn("w-full font-bold py-4 rounded-2xl transition-colors", theme === 'dark' ? "bg-white text-black" : "bg-black text-white")}>Fermer</button>
                </div>
              </motion.div>
            )}

            {showPayment && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("fixed inset-0 z-[120] backdrop-blur-2xl flex items-center justify-center p-6", theme === 'dark' ? "bg-black/80" : "bg-white/80")}>
                <div className="w-full max-w-md glass backdrop-blur-3xl rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[80vh] custom-scrollbar">
                  <h3 className="text-2xl font-display mb-8 text-center joy-gradient font-bold">{t('payment')}</h3>
                  
                  <div className="space-y-6">
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-[#FDB931] to-[#f39c12] text-black shadow-xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-8">
                          <CreditCard className="w-10 h-10" />
                          <div className="text-right">
                            <p className="text-[10px] uppercase tracking-widest opacity-60">Balance</p>
                            <p className="text-xl font-display font-bold">R 1,250.00</p>
                          </div>
                        </div>
                        <p className="text-lg font-mono tracking-widest mb-4">**** **** **** 4242</p>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[8px] uppercase tracking-widest opacity-60">Card Holder</p>
                            <p className="text-xs font-bold uppercase">{user?.name || "Guest User"}</p>
                          </div>
                          <p className="text-xs font-bold">12/28</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-50 px-2">{t('paymentMethod')}</h4>
                      {savedCards.map(card => (
                        <div key={card.id} className="flex items-center justify-between p-4 glass rounded-2xl">
                          <div className="flex items-center gap-3">
                            <CreditCard className="w-5 h-5 opacity-50" />
                            <div>
                              <p className="text-sm font-bold">{card.brand} •••• {card.number.slice(-4)}</p>
                              <p className="text-[10px] opacity-40">Expires {card.expiry}</p>
                            </div>
                          </div>
                          <button onClick={() => setSavedCards(prev => prev.filter(c => c.id !== card.id))} className="text-red-500/50 hover:text-red-500">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => setShowCardEntry(true)} className="w-full p-4 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
                        <Plus className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">{t('addCard')}</span>
                      </button>
                    </div>
                  </div>

                  <button onClick={() => setShowPayment(false)} className={cn("w-full font-bold py-4 rounded-2xl mt-8 transition-colors", theme === 'dark' ? "bg-white text-black" : "bg-black text-white")}>Close</button>
                </div>
              </motion.div>
            )}

            {showCardEntry && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("fixed inset-0 z-[150] backdrop-blur-3xl flex items-center justify-center p-6", theme === 'dark' ? "bg-black/90" : "bg-white/90")}>
                <div className="w-full max-w-sm glass rounded-3xl p-8 shadow-2xl">
                  <h3 className="text-2xl font-display mb-8 text-center joy-gradient font-bold">{t('paymentRequired')}</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 px-2">{t('cardNumber')}</label>
                      <input type="text" placeholder="4242 4242 4242 4242" className="w-full glass p-4 rounded-2xl text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 px-2">{t('expiryDate')}</label>
                        <input type="text" placeholder="MM/YY" className="w-full glass p-4 rounded-2xl text-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 px-2">{t('cvv')}</label>
                        <input type="text" placeholder="123" className="w-full glass p-4 rounded-2xl text-sm" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 space-y-3">
                    <button 
                      onClick={() => {
                        const successSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3');
                        successSound.play().catch(() => {});
                        confetti();
                        
                        // If we are in payment modal, add the card
                        if (showPayment) {
                          setSavedCards([...savedCards, {
                            id: Math.random().toString(),
                            number: "**** **** **** " + Math.floor(1000 + Math.random() * 9000),
                            expiry: "12/28",
                            brand: "Visa"
                          }]);
                        }

                        setShowCardEntry(false);
                        
                        // If we are booking a ride, proceed to search
                        if (appState === 'vehicle-selection') {
                          startFindingDriver();
                        }
                      }} 
                      className="w-full bg-[#FDB931] text-black font-bold py-4 rounded-2xl shadow-lg shadow-[#FDB931]/20"
                    >
                      {appState === 'vehicle-selection' ? t('payNow') : t('addCard')}
                    </button>
                    <button onClick={() => setShowCardEntry(false)} className="w-full glass py-4 rounded-2xl text-sm font-bold">Cancel</button>
                  </div>
                </div>
              </motion.div>
            )}

            {showDeleteConfirm && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("fixed inset-0 z-[130] backdrop-blur-xl flex items-center justify-center p-6", theme === 'dark' ? "bg-black/90" : "bg-white/90")}>
                <div className="w-full max-w-sm glass border-red-500/20 rounded-3xl p-8 text-center">
                  <Zap className="w-12 h-12 text-red-500 mx-auto mb-6" />
                  <h3 className="text-2xl font-display mb-4">Delete Account?</h3>
                  <p className="text-sm opacity-50 mb-8">This action is permanent. All your data will be wiped from JoyDrive servers.</p>
                  <div className="space-y-3">
                    <button onClick={() => { setShowDeleteConfirm(false); setAppState('landing'); setUser(null); }} className="w-full bg-red-500 text-white font-bold py-4 rounded-2xl">Yes, Delete Forever</button>
                    <button onClick={() => setShowDeleteConfirm(false)} className="w-full glass py-4 rounded-2xl">Cancel</button>
                  </div>
                </div>
              </motion.div>
            )}

            {showEmergencyConfirm && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("fixed inset-0 z-[130] backdrop-blur-2xl flex items-center justify-center p-6", theme === 'dark' ? "bg-black/80" : "bg-white/80")}>
                <div className={cn("w-full max-w-md glass backdrop-blur-3xl rounded-3xl p-8 max-h-[80vh] overflow-y-auto custom-scrollbar shadow-2xl border", theme === 'dark' ? "bg-white/10 border-white/20" : "bg-white/20 border-white/30")}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-red-500/20">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                      </div>
                      <h3 className="text-2xl font-display">{t('emergency')}</h3>
                    </div>
                    <button onClick={() => setShowEmergencyConfirm(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors z-50 cursor-pointer"><X className="w-5 h-5" /></button>
                  </div>
                  <p className={cn("text-sm mb-6", theme === 'dark' ? "text-white/60" : "text-black/60")}>{lang === 'fr' ? "Services d'urgence en Afrique du Sud" : "South African Emergency Services"}</p>
                  
                  <div className="space-y-3">
                    {[
                      { number: '10111', name: lang === 'fr' ? 'Police' : 'Police', color: 'bg-blue-500' },
                      { number: '10177', name: lang === 'fr' ? 'Ambulance' : 'Ambulance', color: 'bg-green-500' },
                      { number: '10182', name: lang === 'fr' ? 'Pompiers' : 'Fire Services', color: 'bg-red-500' },
                      { number: '0860 010 111', name: lang === 'fr' ? 'Centre urgence' : 'Emergency Center', color: 'bg-purple-500' },
                      { number: '112', name: lang === 'fr' ? 'Urgence Mobile' : 'Emergency Mobile', color: 'bg-orange-500' }
                    ].map((service, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          window.location.href = `tel:${service.number.replace(/\s/g, '')}`;
                          setShowEmergencyConfirm(false);
                        }}
                        className={cn("w-full p-4 rounded-2xl text-white font-bold flex items-center justify-between transition-transform hover:scale-105", service.color)}
                      >
                        <span>{service.name}</span>
                        <span className="text-lg font-bold">{service.number}</span>
                      </button>
                    ))}
                  </div>
                  
                  <button onClick={() => setShowEmergencyConfirm(false)} className={cn("w-full glass py-4 rounded-2xl mt-6 font-bold", theme === 'dark' ? "text-white" : "text-black")}>Cancel</button>
                </div>
              </motion.div>
            )}

            {showRating && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("fixed inset-0 z-[140] backdrop-blur-3xl flex items-center justify-center p-6", theme === 'dark' ? "bg-black/95" : "bg-white/95")}>
                <div className="w-full max-w-md glass border-white/10 rounded-3xl p-8 overflow-y-auto max-h-[90vh] custom-scrollbar">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden border-2 border-[#FDB931] relative group">
                      <img src="https://picsum.photos/seed/driver/200/200" alt="Driver" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => {
                          if (!favoriteDrivers.includes(driverInfo.name)) {
                            setFavoriteDrivers([...favoriteDrivers, driverInfo.name]);
                            confetti();
                          }
                        }}
                        className={cn("absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity", favoriteDrivers.includes(driverInfo.name) && "opacity-100")}
                      >
                        <Heart className={cn("w-8 h-8", favoriteDrivers.includes(driverInfo.name) ? "text-[#FDB931] fill-[#FDB931]" : "text-white")} />
                      </button>
                    </div>
                    <h3 className="text-2xl font-display joy-gradient">{t('rateDriver')}</h3>
                    <p className="text-xs opacity-50">{driverInfo.name} • {driverInfo.car}</p>
                  </div>

                  <div className="space-y-6">
                    <div className={cn("p-6 rounded-3xl border border-dashed text-center space-y-4", theme === 'dark' ? "border-white/20" : "border-black/10")}>
                      <p className="text-sm font-bold opacity-70">{t('forgotSomething')}</p>
                      <button 
                        onClick={() => window.location.href = `tel:${driverInfo.phone}`}
                        className={cn("w-full py-3 rounded-2xl flex items-center justify-center gap-2 font-bold transition-colors", theme === 'dark' ? "bg-[#FDB931] text-black" : "bg-black text-white")}
                      >
                        <Phone className="w-4 h-4" /> {t('callDriverManual')}
                      </button>
                    </div>

                    {[
                      { key: 'driver', label: t('driverFeedback') },
                      { key: 'vehicle', label: t('vehicleFeedback') },
                      { key: 'trip', label: t('tripFeedback') },
                      { key: 'price', label: t('priceFeedback') },
                    ].map((item) => (
                      <div key={item.key} className="space-y-2">
                        <p className="text-sm font-bold opacity-70">{item.label}</p>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button 
                              key={star} 
                              onClick={() => setRatingData({...ratingData, [item.key]: star})}
                              className={cn("focus:outline-none p-2 rounded-lg border-2 transition-all", (ratingData as any)[item.key] >= star ? "border-[#FDB931] bg-[#FDB931]/10" : theme === 'dark' ? "border-white/20 bg-white/5" : "border-[#FDB931]/30 bg-[#FDB931]/5")}
                            >
                              <Star className={cn("w-5 h-5 transition-all", (ratingData as any)[item.key] >= star ? "text-[#FDB931] fill-[#FDB931]" : theme === 'dark' ? "text-white/30" : "text-[#FDB931]/40")} />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="space-y-2">
                      <p className="text-sm font-bold opacity-70">Review</p>
                      <textarea 
                        placeholder={t('feedbackPlaceholder')}
                        className="w-full glass p-4 rounded-2xl text-sm min-h-[100px] focus:outline-none"
                        value={ratingData.comment}
                        onChange={(e) => setRatingData({...ratingData, comment: e.target.value})}
                      />
                    </div>

                    <div className="glass p-4 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {paymentMethod === 'card' ? <CreditCard className="w-5 h-5 text-blue-400" /> : <Banknote className="w-5 h-5 text-green-400" />}
                        <span className="text-sm font-bold">{paymentMethod === 'card' ? t('card') : t('cash')}</span>
                      </div>
                      <span className="text-xl font-display joy-gradient">R {calculatePrice(selectedRide, distance).toFixed(2)}</span>
                    </div>

                    <button 
                      onClick={() => {
                        confetti();
                        setShowRating(false);
                        setAppState('map');
                        setRatingData({ driver: 0, vehicle: 0, trip: 0, price: 0, comment: '' });
                      }}
                      className="w-full bg-[#FDB931] text-black font-bold py-4 rounded-2xl shadow-lg shadow-[#FDB931]/20"
                    >
                      {t('submitFeedback')}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Interaction Area */}
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-20 flex flex-col items-center">
            <AnimatePresence mode="wait">
              {appState === 'map' && (
                <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="w-full max-w-lg max-h-[80vh] glass rounded-3xl p-4 md:p-6 shadow-2xl overflow-y-auto custom-scrollbar">
                  <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="relative">
                      <div className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-green-500")} />
                      {isLoaded && (
                        <Autocomplete 
                          onLoad={a => originRef.current = a} 
                          onPlaceChanged={() => {
                            const place = originRef.current?.getPlace();
                            if (place?.formatted_address) {
                              setOrigin(place.formatted_address);
                            } else if (place?.name) {
                              setOrigin(place.name);
                            }
                          }}
                        >
                          <input 
                            type="text" 
                            placeholder={t('from')} 
                            className={cn("w-full glass rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 placeholder:text-green-500/70", theme === 'dark' ? "focus:ring-white/20" : "focus:ring-black/10")} 
                            value={origin} 
                            onChange={e => setOrigin(e.target.value)} 
                          />
                        </Autocomplete>
                      )}
                    </div>

                    <div className="flex justify-between items-center pr-2">
                      <button 
                        onClick={() => {
                          if (origin) {
                            setFavoriteAddresses([...favoriteAddresses, { id: Math.random().toString(), name: "Favorite", address: origin }]);
                            confetti();
                          }
                        }}
                        className="text-[10px] uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity flex items-center gap-1"
                      >
                        <Heart className="w-3 h-3" />
                        {t('saveAddress')}
                      </button>
                      <button 
                        onClick={() => setShowStopInput(!showStopInput)} 
                        className="text-[10px] uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors flex items-center gap-1 font-bold"
                      >
                        {showStopInput ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                        {t('addStop')}
                      </button>
                    </div>

                    {showStopInput && (
                      <div className="relative">
                        <div className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-sm bg-[#FDB931]")} />
                        {isLoaded && (
                          <Autocomplete 
                            onLoad={a => stopRef.current = a} 
                            onPlaceChanged={() => {
                              const place = stopRef.current?.getPlace();
                              if (place?.formatted_address) {
                                setStopAddress(place.formatted_address);
                              } else if (place?.name) {
                                setStopAddress(place.name);
                              }
                            }}
                          >
                            <input 
                              type="text" 
                              placeholder={t('addStop')} 
                              className={cn("w-full glass rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2", theme === 'dark' ? "focus:ring-white/20" : "focus:ring-black/10")} 
                              value={stopAddress} 
                              onChange={e => setStopAddress(e.target.value)} 
                            />
                          </Autocomplete>
                        )}
                      </div>
                    )}

                    <div className="relative">
                      <div className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 border-2 border-purple-500")} />
                      {isLoaded && (
                        <Autocomplete 
                          onLoad={a => destRef.current = a} 
                          onPlaceChanged={() => {
                            const place = destRef.current?.getPlace();
                            if (place?.formatted_address) {
                              setDestination(place.formatted_address);
                            } else if (place?.name) {
                              setDestination(place.name);
                            }
                          }}
                        >
                          <input 
                            type="text" 
                            placeholder={t('whereTo')} 
                            className={cn("w-full glass rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 placeholder:text-purple-500/70", theme === 'dark' ? "focus:ring-white/20" : "focus:ring-black/10")} 
                            value={destination} 
                            onChange={e => {
                              setDestination(e.target.value);
                              if (e.target.value.length > 2) {
                                fetchAddressSuggestions(e.target.value, 'destination');
                              } else {
                                setShowAddressSuggestions(false);
                              }
                            }}
                          />
                        </Autocomplete>
                      )}
                    </div>
                    
                    {showAddressSuggestions && addressSuggestions.length > 0 && (
                      <div className="glass rounded-2xl p-4 max-h-64 overflow-y-auto space-y-1 border border-white/10">
                        {addressSuggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSelectSuggestion(suggestion)}
                            className="w-full text-left p-3 hover:bg-white/20 rounded-xl transition-colors text-sm flex items-start gap-2"
                          >
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-400" />
                            <div className="flex-1 min-w-0">
                              <div className="truncate text-white">{suggestion.description}</div>
                            </div>
                          </button>
                        ))}
                        <div className="text-xs text-white/40 p-2 border-t border-white/10 flex items-center justify-end gap-1">
                          <span>Powered by</span>
                          <span className="font-semibold">Google</span>
                        </div>
                      </div>
                    )}
                    
                    <button onClick={calculateRoute} disabled={!origin || !destination} className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-neutral-200 transition-colors disabled:opacity-50">
                      {t('search')}
                    </button>
                  </div>
                </motion.div>
              )}

              {appState === 'vehicle-selection' && (
                <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="w-full max-w-lg glass rounded-3xl p-6 shadow-2xl">
                  <h3 className="text-xl font-display mb-4 text-center joy-gradient font-bold">{t('search')}</h3>
                  
                  <div className="flex gap-2 mb-6 justify-center">
                    <button 
                      onClick={() => setFilterType('recommended')}
                      className={cn("px-4 py-2 rounded-full text-sm font-bold transition-colors", filterType === 'recommended' ? "bg-[#FDB931] text-black" : "glass hover:bg-white/10")}
                    >
                      {lang === 'fr' ? 'Recommande' : 'Recommended'}
                    </button>
                    <button 
                      onClick={() => setFilterType('fastest')}
                      className={cn("px-4 py-2 rounded-full text-sm font-bold transition-colors", filterType === 'fastest' ? "bg-[#FDB931] text-black" : "glass hover:bg-white/10")}
                    >
                      {lang === 'fr' ? 'Plus rapide' : 'Fastest'}
                    </button>
                    <button 
                      onClick={() => setFilterType('cheapest')}
                      className={cn("px-4 py-2 rounded-full text-sm font-bold transition-colors", filterType === 'cheapest' ? "bg-[#FDB931] text-black" : "glass hover:bg-white/10")}
                    >
                      {lang === 'fr' ? 'Moins cher' : 'Cheapest'}
                    </button>
                  </div>
                  
                  <div className="space-y-2 mb-6 max-h-[35vh] overflow-y-auto pr-2 custom-scrollbar">
                    {getSortedRides().map((ride, i) => (
                      <motion.button 
                        key={ride.id} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => { 
                          if (selectedRide.id === ride.id) {
                            setShowRideDetails(true);
                          } else {
                            setSelectedRide(ride);
                          }
                        }} 
                        className={cn("w-full flex items-center gap-4 p-4 rounded-2xl transition-all border", selectedRide.id === ride.id ? (theme === 'dark' ? "bg-white/10 border-white/30 scale-[1.02]" : "bg-black/5 border-black/20 scale-[1.02]") : "bg-transparent border-transparent hover:bg-white/5")}
                      >
                        <div className={cn("w-20 h-14 rounded-xl flex items-center justify-center relative overflow-hidden perspective-1000", selectedRide.id === ride.id ? "bg-gradient-to-br from-[#FDB931] to-[#f39c12] text-black shadow-[0_10px_20px_rgba(253,185,49,0.3)]" : (theme === 'dark' ? "bg-white/5" : "bg-black/5"))}>
                          <motion.div 
                            whileHover={{ rotateY: 15, rotateX: -10, scale: 1.1 }}
                            className="w-full h-full flex items-center justify-center"
                          >
                            {ride.id === 'joy_lite' && <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/vehicle-side-yellow-lite-ABswLC9mzjbfYVTuxDAj5E.webp" alt="Joy Lite" className="w-full h-full object-contain" />}
                            {ride.id === 'joy_economy' && <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/vehicle-side-white-economy-v2-VtuXfQGSyrevMmbuwjMwEA.webp" alt="Joy Economy" className="w-full h-full object-contain" />}
                            {ride.id === 'joy_express' && <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/vehicle-side-white-express-v2-fhHNuH8veh8LjKV9o5s2wb.webp" alt="Joy Express" className="w-full h-full object-contain" />}
                            {ride.id === 'joy_vip' && <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/vehicle-side-white-vip-v2-WW2bcVFmanUFGWkWeiEmwd.webp" alt="Joy VIP" className="w-full h-full object-contain" />}
                            {ride.id === 'joy_xl' && <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/vehicle-side-black-xl-phares-bande-Y4wvFEG5hS4zJHrPDMozZy.webp" alt="Joy XL" className="w-full h-full object-contain" />}
                            {ride.id === 'joy_parcels' && <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/delivery-box-3d-orange-RHRPuegGaDmXqRnCa68UNw.webp" alt="Joy Parcels" className="w-full h-full object-contain" />}
                            {ride.id === 'joy_moving' && <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663481567011/WbfXbPqLBGHvZyWv.png" alt="Joy Moving" className="w-full h-full object-contain" />}
                            {ride.id === 'joy_confort' && <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/vehicle-side-white-economy-v2-VtuXfQGSyrevMmbuwjMwEA.webp" alt="Joy Confort" className="w-full h-full object-contain" />}
                            {ride.id === 'joy_women' && <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/vehicle-side-women-rose-confort-LxREntRLA8SxS5MxakLMnw.webp" alt="Joy Women" className="w-full h-full object-contain" />}
                            {ride.id === 'joy_premium' && <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/vehicle-side-white-vip-v2-WW2bcVFmanUFGWkWeiEmwd.webp" alt="Joy Premium" className="w-full h-full object-contain" />}
                          </motion.div>
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-bold text-sm">{ride.name}</p>
                          <p className="text-[10px] opacity-50">{ride.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">R {calculatePrice(ride, distance).toFixed(2)}</p>
                          <p className="text-[10px] opacity-40">{ride.time}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mb-6 px-2">
                    <p className="text-xs font-bold uppercase tracking-widest opacity-50">{t('paymentMethod')}</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setPaymentMethod('card')}
                        className={cn("flex items-center gap-2 px-4 py-2 rounded-xl border transition-all", paymentMethod === 'card' ? "bg-[#FDB931] text-black border-[#FDB931]" : "glass opacity-50")}
                      >
                        <Wallet className="w-4 h-4" />
                        <span className="text-[10px] font-bold">{t('card')}</span>
                      </button>
                      <button 
                        onClick={() => setPaymentMethod('cash')}
                        className={cn("flex items-center gap-2 px-4 py-2 rounded-xl border transition-all", paymentMethod === 'cash' ? "bg-[#FDB931] text-black border-[#FDB931]" : "glass opacity-50")}
                      >
                        <Banknote className="w-4 h-4" />
                        <span className="text-[10px] font-bold">{t('cash')}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setAppState('map')} className="flex-1 glass py-4 rounded-2xl text-sm font-bold">{t('cancel')}</button>
                    <button onClick={findDriver} className={cn("flex-[2] font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95", theme === 'dark' ? "bg-white text-black" : "bg-black text-white")}>
                      {t('confirm')}
                    </button>
                  </div>
                </motion.div>
              )}

              {appState === 'searching' && (
                <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-lg glass rounded-3xl p-10 text-center">
                  <div className="w-24 h-24 bg-[#FDB931]/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                    <motion.div animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-[#FDB931]/20 rounded-full" />
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="absolute inset-0 border-2 border-dashed border-[#FDB931]/30 rounded-full" />
                    <Car className="w-12 h-12 text-[#FDB931] relative z-10 animate-float" />
                  </div>
                  <h3 className="text-2xl font-display mb-2 joy-gradient font-bold">{t('searchingDriver')}</h3>
                  <p className="text-xs opacity-50 mb-8 max-w-[200px] mx-auto">{aiInsight}</p>
                  <button onClick={() => setAppState('vehicle-selection')} className="text-xs opacity-40 hover:opacity-100 transition-opacity uppercase tracking-widest">{t('cancel')}</button>
                </motion.div>
              )}

              {appState === 'driver-found' && (
                <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-lg glass rounded-3xl p-6 shadow-2xl">
                  {/* Affichage 3D du véhicule choisi */}
                  <div className="w-full h-32 mb-6 flex items-center justify-center glass rounded-2xl overflow-hidden bg-gradient-to-br from-white/5 to-white/10">
                    {selectedRide.id === 'joy_lite' && <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/vehicle-side-yellow-lite-ABswLC9mzjbfYVTuxDAj5E.webp" alt={selectedRide.name} className="w-full h-full object-contain" />}
                    {selectedRide.id === 'joy_economy' && <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/vehicle-side-white-economy-v2-VtuXfQGSyrevMmbuwjMwEA.webp" alt={selectedRide.name} className="w-full h-full object-contain" />}
                    {selectedRide.id === 'joy_confort' && <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/vehicle-side-white-economy-v2-VtuXfQGSyrevMmbuwjMwEA.webp" alt={selectedRide.name} className="w-full h-full object-contain" />}
                    {selectedRide.id === 'joy_women' && <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/vehicle-side-women-white-confort-A9zJWkLABFbFvfaRSubUwx.png" alt={selectedRide.name} className="w-full h-full object-contain" />}
                    {selectedRide.id === 'joy_express' && <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/vehicle-side-white-express-v2-fhHNuH8veh8LjKV9o5s2wb.webp" alt={selectedRide.name} className="w-full h-full object-contain" />}
                    {selectedRide.id === 'joy_premium' && <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/vehicle-side-premium-gray-pale-3Dt54izWLtYiX6a7rhaXMQ.png" alt={selectedRide.name} className="w-full h-full object-contain" />}
                    {selectedRide.id === 'joy_xl' && <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/vehicle-side-black-xl-phares-bande-Y4wvFEG5hS4zJHrPDMozZy.webp" alt={selectedRide.name} className="w-full h-full object-contain" />}
                    {selectedRide.id === 'joy_parcels' && <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663481567011/LtnsvWcZbxMaRQ4hYCseKv/delivery-box-3d-orange-RHRPuegGaDmXqRnCa68UNw.webp" alt={selectedRide.name} className="w-full h-full object-contain" />}
                    {selectedRide.id === 'joy_moving' && <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663481567011/WbfXbPqLBGHvZyWv.png" alt={selectedRide.name} className="w-full h-full object-contain" />}
                  </div>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#FDB931]">
                        <img src="https://picsum.photos/seed/driver/100/100" className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-[#FDB931] text-black text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        {driverInfo.rating} <Star className="w-2 h-2 fill-current" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-lg">{driverInfo.name}</p>
                      <p className="text-xs opacity-50">{driverInfo.car} • {driverInfo.plate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] opacity-50 uppercase tracking-widest">{t('eta')}</p>
                      <p className="font-display text-2xl font-bold joy-gradient">{eta} {t('min')}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button 
                      onClick={() => setShowCommunicationModal(true)}
                      className="glass py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold hover:bg-white/5 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" /> {t('message')}
                    </button>
                    <button 
                      onClick={() => setShowCommunicationModal(true)}
                      className="glass py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold hover:bg-white/5 transition-colors"
                    >
                      <Phone className="w-4 h-4" /> {t('call')}
                    </button>
                  </div>

                  <button onClick={startSimulation} className={cn("w-full font-bold py-4 rounded-2xl shadow-xl transition-transform active:scale-95", theme === 'dark' ? "bg-white text-black" : "bg-black text-white")}>
                    {t('confirm')}
                  </button>
                  
                  <button 
                    onClick={() => setShowCancelModal(true)}
                    className="w-full font-bold py-3 rounded-2xl mt-3 transition-colors opacity-70 hover:opacity-100"
                  >
                    {lang === 'fr' ? 'Annuler le trajet' : 'Cancel Ride'}
                  </button>
                </motion.div>
              )}

              {appState === 'simulation' && (
                <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-lg glass rounded-3xl p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-[#FDB931]/30"><img src="https://picsum.photos/seed/driver/100/100" className="w-full h-full object-cover" /></div>
                    <div className="flex-1">
                      <p className="font-bold">{driverInfo.name}</p>
                      <p className="text-xs opacity-50">{driverInfo.car} • {driverInfo.plate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] opacity-50 uppercase tracking-widest">{t('eta')}</p>
                      <p className="font-display text-lg font-bold joy-gradient">{eta} {t('min')}</p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
                    <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 15 }} className="h-full bg-[#FDB931]" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          const msg = prompt(lang === 'fr' ? "Entrez votre message pour le chauffeur :" : "Enter your message for the driver:");
                          if (msg) alert(lang === 'fr' ? `Message envoyé : ${msg}` : `Message sent: ${msg}`);
                        }}
                        className="w-10 h-10 glass rounded-full flex items-center justify-center"
                      >
                        <MessageSquare className="w-4 h-4 opacity-70" />
                      </button>
                      <button 
                        onClick={() => {
                          window.location.href = `tel:${driverInfo.phone}`;
                        }}
                        className="w-10 h-10 glass rounded-full flex items-center justify-center"
                      >
                        <Phone className="w-4 h-4 opacity-70" />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setZoom(prev => Math.min(prev + 1, 20))} className="w-10 h-10 glass rounded-full flex items-center justify-center text-xs font-bold">+</button>
                      <button onClick={() => setZoom(prev => Math.max(prev - 1, 10))} className="w-10 h-10 glass rounded-full flex items-center justify-center text-xs font-bold">-</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Compass / Location Button */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-20">
            <motion.button 
              animate={{ rotate: heading + 90 }}
              className="w-12 h-12 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-white"
            >
              <Navigation className="w-5 h-5" />
            </motion.button>
            <button className="w-12 h-12 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
              <ShieldCheck className="w-5 h-5" />
            </button>
          </div>
          {/* Communication Modal */}
          {showCommunicationModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("fixed inset-0 z-[140] backdrop-blur-2xl flex items-center justify-center p-6", theme === 'dark' ? "bg-black/80" : "bg-white/80")}>
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-md glass rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#FDB931]">
                    <img src="https://picsum.photos/seed/driver/100/100" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg">{driverInfo.name}</p>
                    <p className="text-xs opacity-50">{driverInfo.car} • {driverInfo.plate}</p>
                  </div>
                </div>

                <div className="flex gap-3 mb-6">
                  <button onClick={() => setCommunicationMode('message')} className={cn("flex-1 py-3 rounded-xl font-bold transition-all", communicationMode === 'message' ? "bg-[#FDB931] text-black" : "glass")}>
                    <MessageSquare className="w-4 h-4 inline mr-2" /> Message
                  </button>
                  <button onClick={() => setCommunicationMode('call')} className={cn("flex-1 py-3 rounded-xl font-bold transition-all", communicationMode === 'call' ? "bg-[#FDB931] text-black" : "glass")}>
                    <Phone className="w-4 h-4 inline mr-2" /> Call
                  </button>
                </div>

                {communicationMode === 'message' ? (
                  <div className="space-y-4">
                    <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder={lang === 'fr' ? "Tapez votre message..." : "Type your message..."} className="w-full glass p-4 rounded-2xl text-sm resize-none h-24 focus:outline-none" />
                    <button onClick={() => {
                      if (messageText.trim()) {
                        alert(lang === 'fr' ? `Message envoyé : ${messageText}` : `Message sent: ${messageText}`);
                        setMessageText('');
                        setShowCommunicationModal(false);
                      }
                    }} className={cn("w-full font-bold py-4 rounded-2xl transition-colors", theme === 'dark' ? "bg-white text-black" : "bg-black text-white")}>
                      {lang === 'fr' ? "Envoyer" : "Send"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="glass p-6 rounded-2xl text-center">
                      <Phone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="font-bold text-lg">{driverInfo.phone}</p>
                      <p className="text-xs opacity-50 mt-2">{lang === 'fr' ? "Appel manuel" : "Manual call"}</p>
                    </div>
                    <button onClick={() => {
                      window.location.href = `tel:${driverInfo.phone}`;
                      setShowCommunicationModal(false);
                    }} className={cn("w-full font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2", "bg-green-500 text-white")}>
                      <Phone className="w-5 h-5" /> {lang === 'fr' ? "Appeler" : "Call Now"}
                    </button>
                  </div>
                )}

                <button onClick={() => setShowCommunicationModal(false)} className="w-full mt-4 glass py-3 rounded-2xl font-bold">
                  {lang === 'fr' ? "Fermer" : "Close"}
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* Cancel Modal */}
          {showCancelModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("fixed inset-0 z-[120] backdrop-blur-2xl flex items-center justify-center p-6", theme === 'dark' ? "bg-black/80" : "bg-white/80")}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm glass backdrop-blur-3xl rounded-3xl p-8 shadow-2xl">
                <h3 className="text-2xl font-display mb-6 text-center">{lang === 'fr' ? 'Raison de l\'annulation' : 'Cancel Reason'}</h3>
                <div className="space-y-3">
                  {[
                    { en: 'Driver not moving', fr: 'Le chauffeur ne bouge pas' },
                    { en: 'Driver is too far', fr: 'Le chauffeur est trop loin' },
                    { en: 'Driver asked to cancel', fr: 'Le chauffeur m\'a demandé d\'annuler' },
                    { en: 'I changed my mind', fr: 'J\'ai changé d\'avis' },
                    { en: 'Driver taking too long', fr: 'Le chauffeur prend trop de temps' }
                  ].map((reason, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setAppState('vehicle-selection');
                        setShowCancelModal(false);
                        toast.success(lang === 'fr' ? 'Trajet annulé' : 'Ride cancelled');
                      }}
                      className="w-full glass p-4 rounded-2xl text-left hover:bg-white/10 transition-colors font-bold"
                    >
                      {lang === 'fr' ? reason.fr : reason.en}
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowCancelModal(false)} className="w-full mt-6 glass py-3 rounded-2xl font-bold opacity-70 hover:opacity-100">
                  {lang === 'fr' ? 'Fermer' : 'Close'}
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* Payment Modal */}
          <PaymentModal isOpen={showPayment} onClose={() => setShowPayment(false)} theme={theme} />
        </>
      )}
    </div>
  );
}
