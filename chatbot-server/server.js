const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
    crossOriginEmbedderPolicy: false,
}));

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Allow any localhost or 127.0.0.1 with any port (for development)
        if (origin && origin.match(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/)) {
            return callback(null, true);
        }
        
        // Add your Infomaniak domain here
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5500',
            'http://localhost:5501',
            'http://localhost:5502',
            'http://127.0.0.1:5500',
            'http://127.0.0.1:5501',
            'http://127.0.0.1:5502',
            'https://mirasens.com', // Replace with your actual Infomaniak domain
            'https://your-subdomain.infomaniak.website', // Replace with your actual domain
            // Add more domains as needed
        ];
        
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        // For development, allow all origins
        if (process.env.NODE_ENV === 'development') {
            return callback(null, true);
        }
        
        // For production, be more permissive with HTTPS domains
        if (process.env.NODE_ENV === 'production' && origin && origin.startsWith('https://')) {
            return callback(null, true);
        }
        
        // Reject other origins
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    preflightContinue: false,
    optionsSuccessStatus: 200
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        error: 'Too many requests from this IP, please try again later.'
    }
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));

// Initialize Gemini AI
let model = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log('✅ Gemini AI initialized successfully');
} else {
    console.log('⚠️  Gemini API key not configured. Server will run in demo mode.');
}

// MIRASENS Comprehensive Knowledge Base
const MIRASENS_KNOWLEDGE = {
    fr: {
        company: `MIRASENS est une entreprise spécialisée dans l'Internet des Objets (IoT) et les solutions de connectivité M2M basée à Dounia Parc, Dely Brahim, Alger, Algérie.

CONTACT:
Téléphone: (+213) 560-555-300
Email: contact@mirasens.com
Site web: www.mirasens.com

SECTEURS D'ACTIVITÉ DÉTAILLÉS:

🐟 SMART AQUACULTURE:
Technologies: Surveillance qualité eau, croissance poissons, systèmes alimentation automatisés
• Surveillance eau: Température, pH, oxygène dissous, ammoniac, nitrites, turbidité, conductivité
• Gestion alimentation: Systèmes automatisés, optimisation nutriments
• Croissance poissons: Suivi biométrique, analyse comportement
• Plateforme FishFlow dédiée
FAQ Aquaculture:
- Capteurs surveillent température, pH, oxygène, conductivité en temps réel
- Alertes automatiques en cas de dépassement seuils
- Réduction mortalité jusqu'à 30%, amélioration rendements
- Compatible bassins existants, installation simple
- ROI moyen 12-18 mois

🌱 SMART AGRICULTURE:
Technologies: Surveillance sol, optimisation irrigation, analyse santé cultures
• Surveillance sol: Humidité, température, niveaux nutritifs, pH
• Stations météo: Pluie, vent, humidité, pression atmosphérique
• Irrigation intelligente: Contrôle automatisé basé conditions
• Santé cultures: Détection précoce maladies/parasites
FAQ Agriculture:
- Capteurs sol surveillent humidité, température, NPK
- Économies eau 20-40%, amélioration rendements 15-25%
- Installation sans perturbation cultures existantes
- Compatibilité systèmes irrigation actuels
- Support technique et formation inclus

🏭 SMART INDUSTRY:
Technologies: Maintenance prédictive, surveillance équipements, optimisation production
• Capteurs vibration, température, pression, acoustique
• Algorithmes IA pour prédiction pannes
• Tableaux bord temps réel
• Optimisation processus production
FAQ Industrie:
- Réduction pannes non planifiées jusqu'à 50%
- Optimisation maintenance, extension durée vie équipements
- Surveillance continue 24/7 avec alertes
- Intégration ERP/MES existants
- Formation équipes maintenance

🚛 SMART LOGISTIQUE:
Technologies: Suivi d'actifs, optimisation routes, surveillance chaîne froid
• Géolocalisation véhicules/marchandises GPS temps réel
• Surveillance température chaîne froid
• Optimisation routes/livraisons
• Gestion flotte complète
FAQ Logistique:
- Traçabilité complète produits via IoT/RFID/QR codes
- Réduction coûts transport, amélioration délais livraison
- Collecte données: température, humidité, géolocalisation, consommation
- Connectivité entrepôts existants via passerelles/API
- Mise en place: analyse besoins → capteurs → pilote → déploiement

🏢 SMART BUILDING:
Technologies: Gestion énergie, systèmes sécurité, optimisation occupation
• Contrôle éclairage, chauffage, climatisation
• Détection présence, qualité air
• Sécurité accès, surveillance
• Optimisation consommation énergétique

🚗 GESTION DE FLOTTES:
Technologies: Suivi véhicules, optimisation carburant, planification maintenance
• Géolocalisation temps réel
• Consommation carburant, éco-conduite
• Maintenance préventive
• Planification tournées optimales

SOLUTIONS LOGICIELLES DÉTAILLÉES:

🐟 FISHFLOW - Plateforme aquaculture/agriculture:
• Supervision multi-équipements et multi-réseaux
• Analyse données temps réel, aide décision
• Tableaux bord personnalisables
• Système alertes performances
• Widgets: graphiques, jauges, cartes, timelines
• Localisation dynamique objets
• Gestion droits accès utilisateurs
• IA embarquée pour prédictions
• Gestion alimentation automatisée
• Hébergement: SaaS (abonnement) ou On-Premise (licence)

📊 M-IoT - Plateforme tout-en-un:
• Gestion et visualisation multi-objets
• Connectivité multi-protocoles
• Analytics avancés
• Tableaux bord configurables
• Alertes intelligentes

📍 SirGPS - Gestion flottes:
• Application web/mobile
• Géolocalisation temps réel
• Optimisation routes
• Gestion carburant
• Maintenance véhicules
• Rapports détaillés

TECHNOLOGIES SUPPORTÉES:
• Protocoles: LoRaWAN, Sigfox, NB-IoT, LTE-M, WiFi, Bluetooth, RFID
• Capteurs: Température, humidité, pH, oxygène, GPS, présence, vibration, pression
• Connectivité: Cartes SIM M2M, réseaux LPWAN, satellite
• Plateformes: Cloud, On-Premise, analytics temps réel

CONNECTIVITÉ IoT:
Types réseaux:
- LAN (RFID, BLE, Zigbee): courte portée 1-100m, faible consommation
- PAN (Bluetooth): quelques mètres, équipements personnels
- WAN: portée étendue, dizaines mètres
- LPWAN (LoRa, Sigfox): longue portée, faible consommation, coût réduit
- Satellite: couverture mondiale, zones isolées
- Cellulaire (2G/3G/4G): gros volumes données, longue distance

SIM M2M vs téléphone:
- SIM M2M: gestion distance, consommation optimisée, sécurité renforcée
- SIM téléphone: communications mobiles classiques utilisateurs finaux

SERVICES:
• Conseil et accompagnement projet
• Installation et paramétrage
• Formation utilisateurs
• Support technique multilingue
• Maintenance et mises à jour`,

        scenarios: [
            {
                keywords: ['aquaculture', 'poisson', 'élevage', 'bassin', 'eau', 'fishflow'],
                response: `🐟 AQUACULTURE INTELLIGENTE avec MIRASENS

Notre expertise aquacole comprend :

📊 SURVEILLANCE EAU 24/7:
• Température, pH, oxygène dissous
• Ammoniac, nitrites, turbidité, conductivité
• Alertes automatiques dépassement seuils

🤖 GESTION ALIMENTATION:
• Systèmes automatisés programmables
• Optimisation nutriments selon croissance
• Économies nourriture jusqu'à 15%

📈 PLATEFORME FISHFLOW:
• Tableaux bord temps réel personnalisables
• IA prédictive pour anticipation problèmes
• Géolocalisation équipements
• Gestion droits accès multi-utilisateurs

✅ RÉSULTATS CLIENTS:
• Réduction mortalité 20-30%
• Amélioration rendements 15-25%
• ROI moyen 12-18 mois
• Installation sans perturbation

Voulez-vous une démonstration personnalisée de FishFlow ou discuter de votre projet aquacole spécifique ?`
            },
            {
                keywords: ['agriculture', 'ferme', 'culture', 'irrigation', 'sol', 'météo'],
                response: `🌱 AGRICULTURE DE PRÉCISION avec MIRASENS

Solutions complètes pour optimiser vos cultures :

🌡️ SURVEILLANCE SOL:
• Humidité, température, pH, NPK
• Capteurs multi-profondeurs
• Cartes de fertilité détaillées

☔ STATIONS MÉTÉO:
• Pluie, vent, humidité, pression
• Prévisions micro-climatiques
• Alertes conditions défavorables

💧 IRRIGATION INTELLIGENTE:
• Arrosage automatisé selon besoins
• Économies eau 20-40%
• Zonage précis par parcelle

🔬 SANTÉ CULTURES:
• Détection précoce maladies
• Surveillance parasites
• Optimisation traitements

📊 PLATEFORME M-IoT:
• Tableaux bord personnalisés
• Analytics prédictifs
• Gestion multi-exploitations

✅ BÉNÉFICES PROUVÉS:
• +15-25% rendements
• -30% consommation eau
• -20% intrants chimiques
• ROI 10-15 mois

Souhaitez-vous planifier une visite technique pour évaluer vos besoins agricoles ?`
            },
            {
                keywords: ['industrie', 'maintenance', 'équipement', 'production', 'prédictive'],
                response: `🏭 INDUSTRIE 4.0 avec MIRASENS

Transformez votre industrie avec l'IoT :

⚙️ MAINTENANCE PRÉDICTIVE:
• Capteurs vibration, température, acoustique
• IA prédiction pannes 24-72h avance
• Planification maintenance optimale
• Réduction pannes non planifiées 50%

📈 MONITORING PRODUCTION:
• Surveillance équipements temps réel
• OEE (efficacité globale équipements)
• Optimisation processus automatique
• Tableaux bord directionnels

🔧 GESTION ACTIFS:
• Historique complet équipements
• Coûts maintenance prévisionnels
• Extension durée vie machines
• Intégration ERP/MES existants

🎯 RÉSULTATS IMMÉDIATS:
• -50% arrêts non programmés
• +20% efficacité production
• -30% coûts maintenance
• +15% durée vie équipements

Formation équipes et support technique inclus. Voulez-vous une analyse de vos équipements critiques ?`
            },
            {
                keywords: ['logistique', 'transport', 'flotte', 'véhicule', 'suivi', 'chaîne', 'entrepôt'],
                response: `🚛 LOGISTIQUE 4.0 avec MIRASENS

Supply Chain intelligente et optimisée :

📍 TRAÇABILITÉ COMPLÈTE:
• Géolocalisation temps réel GPS
• QR codes, RFID, capteurs IoT
• Suivi produits bout en bout
• Conformité normes sécurité

❄️ CHAÎNE DU FROID:
• Surveillance température/humidité
• Alertes dépassement seuils
• Traçabilité réglementaire
• Réduction pertes 15-25%

🗺️ OPTIMISATION ROUTES:
• Algorithmes calcul trajets optimaux
• Réduction coûts transport 10-20%
• Amélioration délais livraison
• Planification tournées automatique

📊 DONNÉES COLLECTÉES:
• Température, humidité, chocs
• Géolocalisation, temps trajet
• Consommation carburant, CO₂
• Heures chargement/déchargement

🏭 ENTREPÔTS CONNECTÉS:
• Connectivité infrastructures existantes
• Passerelles IoT, intégration API
• Gestion stocks automatisée
• WMS intelligent

✅ BÉNÉFICES MESURÉS:
• -15% coûts logistiques
• +25% visibilité chaîne
• -30% ruptures stock
• +20% satisfaction client

Solution SirGPS pour gestion flottes complète. Souhaitez-vous une analyse de votre chaîne logistique ?`
            },
            {
                keywords: ['building', 'bâtiment', 'énergie', 'smart', 'bureau', 'éclairage', 'chauffage'],
                response: `🏢 SMART BUILDING avec MIRASENS

Bâtiments intelligents et économes :

💡 GESTION ÉNERGIE:
• Contrôle éclairage automatique
• Optimisation chauffage/climatisation
• Détection présence multi-zones
• Économies énergétiques 20-40%

🌡️ CONFORT ENVIRONNEMENTAL:
• Qualité air (CO₂, particules)
• Température, humidité optimales
• Éclairage adaptatif naturel
• Ambiance sonore contrôlée

🔒 SÉCURITÉ INTÉGRÉE:
• Contrôle accès badges/biométrie
• Surveillance périmètre
• Détection intrusion/incendie
• Vidéosurveillance intelligente

📊 OCCUPATION INTELLIGENTE:
• Analyse flux personnes
• Optimisation espaces travail
• Réservation salles automatique
• Nettoyage adaptatif

Transformez vos bâtiments en espaces intelligents et durables !`
            },
            {
                keywords: ['flotte', 'véhicule', 'gps', 'sirgps', 'carburant', 'conducteur'],
                response: `🚗 GESTION DE FLOTTES avec SirGPS

Solution complète de géolocalisation :

📍 SUIVI TEMPS RÉEL:
• Géolocalisation précise GPS
• Historique trajets détaillé
• Zones géographiques programmables
• Alertes sorties périmètre

⛽ OPTIMISATION CARBURANT:
• Consommation par véhicule/conducteur
• Eco-conduite avec scoring
• Détection ralenti excessif
• Économies carburant 15-25%

🔧 MAINTENANCE PRÉVENTIVE:
• Planification selon kilométrage
• Alertes révisions programmées
• Suivi coûts maintenance
• Extension durée vie véhicules

📱 APPLICATION MOBILE:
• Interface conducteurs intuitive
• Validation missions temps réel
• Communication bidirectionnelle
• Rapports activité automatiques

📊 TABLEAUX BORD DIRECTIONNELS:
• Performances flotte globale
• Coûts exploitation détaillés
• Indicateurs sécurité conduite
• ROI et optimisations

SirGPS : la solution de référence pour maîtriser vos coûts de flotte. Démonstration gratuite disponible !`
            },
            {
                keywords: ['connectivité', 'réseau', 'lora', 'sigfox', 'sim', 'm2m', 'lpwan'],
                response: `🌐 CONNECTIVITÉ IoT avec MIRASENS

Guide complet des technologies :

📡 RÉSEAUX DISPONIBLES:
• LAN (RFID, BLE, Zigbee): 1-100m, faible consommation
• PAN (Bluetooth): quelques mètres, équipements personnels  
• LPWAN (LoRa, Sigfox): longue portée, batterie 10+ ans
• Cellulaire (2G/3G/4G): gros volumes, couverture nationale
• Satellite: zones isolées, couverture mondiale

🎯 CHOIX PAR USAGE:
• Bureau: WiFi, Ethernet
• Agriculture: LoRaWAN, Sigfox  
• Industrie: WiFi, cellulaire
• Logistique: GPS, cellulaire
• Maison: Zigbee, WiFi

📱 SIM M2M vs TÉLÉPHONE:
SIM M2M : gestion distance, optimisation données, sécurité
SIM téléphone : communications classiques utilisateurs

🔒 SÉCURITÉ:
• APN privé pour connexions sécurisées
• Chiffrement bout en bout
• Authentification renforcée
• Surveillance flux données

Nous vous accompagnons dans le choix optimal selon vos contraintes techniques et économiques !`
            },
            {
                keywords: ['prix', 'coût', 'tarif', 'budget', 'devis', 'abonnement'],
                response: `💰 TARIFICATION MIRASENS

Pricing transparent et modulaire :

📊 FACTEURS TARIFAIRES:
• Nombre capteurs/objets connectés
• Type connectivité (LoRa, cellulaire, WiFi)
• Fonctionnalités plateforme requises
• Services accompagnement souhaités
• Mode hébergement (SaaS/On-Premise)

💡 MODÈLES ÉCONOMIQUES:
• SaaS : Abonnement mensuel, maintenance incluse
• On-Premise : Licence unique, serveurs clients
• Hybride : Mix cloud/local selon besoins

🎯 EXEMPLES INDICATIFS:
• Starter (5-20 capteurs) : 200-500€/mois
• Business (50-200 capteurs) : 800-2000€/mois  
• Enterprise (500+ capteurs) : Sur devis

✅ INCLUS SYSTÉMATIQUEMENT:
• Formation utilisateurs
• Support technique multilingue
• Mises à jour régulières
• Garantie matériel 2-3 ans

📞 DEVIS PERSONNALISÉ:
Chaque projet étant unique, je peux vous mettre en contact avec notre équipe commerciale pour une analyse détaillée et un devis sur mesure.

Pouvez-vous me préciser votre secteur d'activité et le nombre approximatif d'objets à connecter ?`
            },
            {
                keywords: ['fishflow', 'plateforme', 'aquaculture', 'supervision'],
                response: `🐟 PLATEFORME FISHFLOW

Solution dédiée aquaculture/agriculture :

🎯 FONCTIONNALITÉS CLÉS:
• Supervision multi-équipements et réseaux
• Analyse données temps réel
• Tableaux bord personnalisables
• Système alertes avancé
• IA prédictive embarquée

📊 WIDGETS DISPONIBLES:
• Graphiques temporels, jauges analogiques
• Cartes géographiques dynamiques
• Timelines événements
• Indicateurs chiffrés colorés
• Alarmes visuelles/sonores

🤖 INTELLIGENCE ARTIFICIELLE:
• Prédiction paramètres eau
• Anticipation problèmes équipements
• Optimisation alimentation automatique
• Algorithmes apprentissage adaptatifs

🏗️ HÉBERGEMENT AU CHOIX:
• SaaS : Accès cloud, abonnement mensuel
• On-Premise : Serveurs locaux, licence unique
• Hybride : Combinaison selon besoins

🔐 SÉCURITÉ & ACCÈS:
• Gestion droits utilisateurs granulaire
• Authentification multi-facteurs
• Sauvegarde données automatique
• Conformité RGPD

✅ AVANTAGES CLIENTS:
• Réduction mortalité 20-30%
• Optimisation croissance
• Économies ressources 15-25%
• ROI 12-18 mois

Démonstration live disponible ! Souhaitez-vous voir FishFlow en action ?`
            },
            {
                keywords: ['miot', 'm-iot', 'plateforme', 'multi-objets'],
                response: `📊 PLATEFORME M-IoT

Solution universelle multi-objets :

🌐 CONNECTIVITÉ UNIVERSELLE:
• Support tous protocoles (LoRa, Sigfox, WiFi, 4G)
• Passerelles multi-réseaux
• Intégration objets hétérogènes
• APIs ouvertes standard

📈 VISUALISATION AVANCÉE:
• Tableaux bord configurables
• Graphiques temps réel interactifs
• Cartes géographiques
• Alertes intelligentes
• Rapports automatisés

🔧 GESTION SIMPLIFIÉE:
• Interface intuitive drag & drop
• Configuration capteurs distance
• Mise à jour OTA (Over The Air)
• Supervision état équipements

🎯 SECTEURS COMPATIBLES:
• Agriculture : irrigation, météo, sol
• Industrie : machines, maintenance
• Ville : éclairage, déchets, parking
• Environnement : qualité air, eau

⚙️ INTÉGRATIONS:
• ERP/CRM existants
• Bases données externes
• Systèmes tiers via API
• Export formats standards

Solution évolutive adaptée à tous projets IoT !`
            },
            {
                keywords: ['sirgps', 'gestion', 'flotte', 'géolocalisation', 'gps'],
                response: `📍 APPLICATION SirGPS

Gestion de flottes nouvelle génération :

🚗 SUIVI VÉHICULES:
• Géolocalisation temps réel précise
• Historique trajets détaillé
• Vitesses, arrêts, kilométrage
• Zones géographiques programmables

⛽ ÉCONOMIES CARBURANT:
• Consommation par véhicule/conducteur
• Score éco-conduite personnalisé
• Détection ralenti excessif
• Optimisation trajets automatique

📱 APPLICATION MOBILE:
• Interface conducteurs ergonomique
• Validation missions terrain
• Communication instant
• Géolocalisation précise

🔧 MAINTENANCE INTELLIGENTE:
• Planification selon usage réel
• Alertes révisions automatiques
• Suivi coûts détaillé
• Historique interventions

📊 REPORTING AVANCÉ:
• Tableaux bord temps réel
• Analyses performances flotte
• Coûts exploitation détaillés
• Indicateurs sécurité

🎯 BÉNÉFICES MESURÉS:
• -15% coûts carburant
• -25% temps administratif
• +30% efficacité tournées
• ROI 6-12 mois

Version démo gratuite 30 jours ! Testez SirGPS sans engagement.`
            }
        ]
    },
    en: {
        company: `MIRASENS is a company specialized in Internet of Things (IoT) and M2M connectivity solutions based in Dounia Parc, Dely Brahim, Algiers, Algeria.

CONTACT:
Phone: (+213) 560-555-300
Email: contact@mirasens.com
Website: www.mirasens.com

DETAILED BUSINESS SECTORS:

🐟 SMART AQUACULTURE:
Technologies: Water quality monitoring, fish growth tracking, automated feeding systems
• Water monitoring: Temperature, pH, dissolved oxygen, ammonia, nitrites, turbidity, conductivity
• Feed management: Automated programmable systems, nutrient optimization
• Fish growth: Biometric tracking, behavior analysis
• Dedicated FishFlow platform
Aquaculture FAQ:
- Sensors monitor temperature, pH, oxygen, conductivity in real-time
- Automatic alerts when thresholds exceeded
- Mortality reduction up to 30%, improved yields
- Compatible with existing ponds, simple installation
- Average ROI 12-18 months

🌱 SMART AGRICULTURE:
Technologies: Soil monitoring, irrigation optimization, crop health analysis
• Soil monitoring: Moisture, temperature, nutrient levels, pH
• Weather stations: Rain, wind, humidity, atmospheric pressure
• Smart irrigation: Automated control based on conditions
• Crop health: Early detection of diseases/pests
Agriculture FAQ:
- Soil sensors monitor moisture, temperature, NPK
- Water savings 20-40%, yield improvements 15-25%
- Installation without disrupting existing crops
- Compatibility with current irrigation systems
- Technical support and training included

🏭 SMART INDUSTRY:
Technologies: Predictive maintenance, equipment monitoring, production optimization
• Vibration, temperature, pressure, acoustic sensors
• AI algorithms for failure prediction
• Real-time dashboards
• Production process optimization
Industry FAQ:
- Reduce unplanned failures up to 50%
- Optimize maintenance, extend equipment life
- 24/7 continuous monitoring with alerts
- Integration with existing ERP/MES
- Maintenance team training

🚛 SMART LOGISTICS:
Technologies: Asset tracking, route optimization, cold chain monitoring
• Real-time GPS vehicle/goods tracking
• Cold chain temperature monitoring
• Route/delivery optimization
- Complete fleet management
Logistics FAQ:
- Complete product traceability via IoT/RFID/QR codes
- Reduce transport costs, improve delivery times
- Data collection: temperature, humidity, geolocation, consumption
- Connect existing warehouses via gateways/APIs
- Implementation: needs analysis → sensors → pilot → deployment

🏢 SMART BUILDING:
Technologies: Energy management, security systems, occupancy optimization
• Lighting, heating, air conditioning control
• Presence detection, air quality
• Access security, surveillance
• Energy consumption optimization

🚗 FLEET MANAGEMENT:
Technologies: Vehicle tracking, fuel optimization, maintenance planning
• Real-time geolocation
• Fuel consumption, eco-driving
• Preventive maintenance
• Optimal route planning

DETAILED SOFTWARE SOLUTIONS:

🐟 FISHFLOW - Aquaculture/agriculture platform:
• Multi-equipment and multi-network supervision
• Real-time data analysis, decision support
• Customizable dashboards
• Performance alert system
• Widgets: charts, gauges, maps, timelines
• Dynamic object location
• User access rights management
• Embedded AI for predictions
• Automated feed management
• Hosting: SaaS (subscription) or On-Premise (license)

📊 M-IoT - All-in-one platform:
• Multi-object management and visualization
• Multi-protocol connectivity
• Advanced analytics
• Configurable dashboards
• Smart alerts

📍 SirGPS - Fleet management:
• Web/mobile application
• Real-time geolocation
• Route optimization
• Fuel management
• Vehicle maintenance
• Detailed reports

SUPPORTED TECHNOLOGIES:
• Protocols: LoRaWAN, Sigfox, NB-IoT, LTE-M, WiFi, Bluetooth, RFID
• Sensors: Temperature, humidity, pH, oxygen, GPS, presence, vibration, pressure
• Connectivity: M2M SIM cards, LPWAN networks, satellite
• Platforms: Cloud, On-Premise, real-time analytics

IoT CONNECTIVITY:
Network types:
- LAN (RFID, BLE, Zigbee): short range 1-100m, low consumption
- PAN (Bluetooth): few meters, personal equipment
- WAN: extended range, tens of meters
- LPWAN (LoRa, Sigfox): long range, low consumption, reduced cost
- Satellite: worldwide coverage, isolated areas
- Cellular (2G/3G/4G): large data volumes, long distance

M2M vs phone SIM:
- M2M SIM: remote management, optimized consumption, enhanced security
- Phone SIM: classic mobile communications for end users

SERVICES:
• Project consulting and support
• Installation and configuration
• User training
• Multilingual technical support
• Maintenance and updates`,

        scenarios: [
            {
                keywords: ['aquaculture', 'fish', 'farming', 'pond', 'water', 'fishflow'],
                response: `🐟 SMART AQUACULTURE with MIRASENS

Our aquaculture expertise includes:

📊 24/7 WATER MONITORING:
• Temperature, pH, dissolved oxygen
• Ammonia, nitrites, turbidity, conductivity
• Automatic threshold alerts

🤖 FEED MANAGEMENT:
• Programmable automated systems
• Nutrient optimization for growth
• Feed savings up to 15%

📈 FISHFLOW PLATFORM:
• Real-time customizable dashboards
• Predictive AI for problem anticipation
• Equipment geolocation
• Multi-user access management

✅ CLIENT RESULTS:
• 20-30% mortality reduction
• 15-25% yield improvement
• Average ROI 12-18 months
• Installation without disruption

Would you like a personalized FishFlow demonstration or to discuss your specific aquaculture project?`
            },
            {
                keywords: ['agriculture', 'farm', 'crop', 'irrigation', 'soil', 'weather'],
                response: `🌱 PRECISION AGRICULTURE with MIRASENS

Complete solutions to optimize your crops:

🌡️ SOIL MONITORING:
• Moisture, temperature, pH, NPK
• Multi-depth sensors
• Detailed fertility maps

☔ WEATHER STATIONS:
• Rain, wind, humidity, pressure
• Micro-climate predictions
• Adverse condition alerts

💧 SMART IRRIGATION:
• Automated watering based on needs
• 20-40% water savings
• Precise zoning per plot

🔬 CROP HEALTH:
• Early disease detection
• Pest monitoring
• Treatment optimization

📊 M-IoT PLATFORM:
• Customized dashboards
• Predictive analytics
• Multi-farm management

✅ PROVEN BENEFITS:
• +15-25% yields
• -30% water consumption
• -20% chemical inputs
• ROI 10-15 months

Would you like to schedule a technical visit to assess your agricultural needs?`
            },
            {
                keywords: ['industry', 'maintenance', 'equipment', 'production', 'predictive'],
                response: `🏭 INDUSTRY 4.0 with MIRASENS

Transform your industry with IoT:

⚙️ PREDICTIVE MAINTENANCE:
• Vibration, temperature, acoustic sensors
• AI failure prediction 24-72h advance
• Optimal maintenance planning
• 50% unplanned failure reduction

📈 PRODUCTION MONITORING:
• Real-time equipment monitoring
• OEE (Overall Equipment Effectiveness)
• Automatic process optimization
• Executive dashboards

🔧 ASSET MANAGEMENT:
• Complete equipment history
• Predictive maintenance costs
• Extended machine life
• ERP/MES integration

🎯 IMMEDIATE RESULTS:
• -50% unscheduled downtime
• +20% production efficiency
• -30% maintenance costs
• +15% equipment lifespan

Team training and technical support included. Would you like an analysis of your critical equipment?`
            },
            {
                keywords: ['logistics', 'transport', 'fleet', 'vehicle', 'tracking', 'chain', 'warehouse'],
                response: `🚛 LOGISTICS 4.0 with MIRASENS

Intelligent and optimized supply chain:

📍 COMPLETE TRACEABILITY:
• Real-time GPS geolocation
• QR codes, RFID, IoT sensors
• End-to-end product tracking
• Safety standards compliance

❄️ COLD CHAIN:
• Temperature/humidity monitoring
• Threshold alerts
• Regulatory traceability
• 15-25% loss reduction

🗺️ ROUTE OPTIMIZATION:
• Optimal path calculation algorithms
• 10-20% transport cost reduction
• Improved delivery times
• Automatic route planning

📊 DATA COLLECTED:
• Temperature, humidity, shocks
• Geolocation, travel time
• Fuel consumption, CO₂
• Loading/unloading hours

🏭 CONNECTED WAREHOUSES:
• Existing infrastructure connectivity
• IoT gateways, API integration
• Automated inventory management
• Intelligent WMS

✅ MEASURED BENEFITS:
• -15% logistics costs
• +25% chain visibility
• -30% stock-outs
• +20% customer satisfaction

SirGPS solution for complete fleet management. Would you like an analysis of your logistics chain?`
            },
            {
                keywords: ['building', 'energy', 'smart', 'office', 'lighting', 'heating'],
                response: `🏢 SMART BUILDING with MIRASENS

Intelligent and economical buildings:

💡 ENERGY MANAGEMENT:
• Automatic lighting control
• Heating/air conditioning optimization
• Multi-zone presence detection
• 20-40% energy savings

🌡️ ENVIRONMENTAL COMFORT:
• Air quality (CO₂, particles)
• Optimal temperature, humidity
• Adaptive natural lighting
• Controlled sound environment

🔒 INTEGRATED SECURITY:
• Badge/biometric access control
• Perimeter surveillance
• Intrusion/fire detection
• Intelligent video surveillance

📊 SMART OCCUPANCY:
• People flow analysis
• Workspace optimization
• Automatic room booking
• Adaptive cleaning

Transform your buildings into intelligent and sustainable spaces!`
            },
            {
                keywords: ['fleet', 'vehicle', 'gps', 'sirgps', 'fuel', 'driver'],
                response: `🚗 FLEET MANAGEMENT with SirGPS

Complete geolocation solution:

📍 REAL-TIME TRACKING:
• Precise GPS geolocation
• Detailed route history
• Programmable geographic zones
• Perimeter exit alerts

⛽ FUEL OPTIMIZATION:
• Consumption per vehicle/driver
• Eco-driving with scoring
• Excessive idling detection
• 15-25% fuel savings

🔧 PREVENTIVE MAINTENANCE:
• Mileage-based planning
• Scheduled service alerts
• Maintenance cost tracking
• Extended vehicle life

📱 MOBILE APPLICATION:
• Intuitive driver interface
• Real-time mission validation
• Bidirectional communication
• Automatic activity reports

📊 EXECUTIVE DASHBOARDS:
• Global fleet performance
• Detailed operating costs
• Driving safety indicators
• ROI and optimizations

SirGPS: the reference solution for controlling your fleet costs. Free demonstration available!`
            },
            {
                keywords: ['connectivity', 'network', 'lora', 'sigfox', 'sim', 'm2m', 'lpwan'],
                response: `🌐 IoT CONNECTIVITY with MIRASENS

Complete technology guide:

📡 AVAILABLE NETWORKS:
• LAN (RFID, BLE, Zigbee): 1-100m, low consumption
• PAN (Bluetooth): few meters, personal equipment
• LPWAN (LoRa, Sigfox): long range, 10+ year battery
• Cellular (2G/3G/4G): large volumes, national coverage
• Satellite: isolated areas, worldwide coverage

🎯 CHOICE BY USE:
• Office: WiFi, Ethernet
• Agriculture: LoRaWAN, Sigfox
• Industry: WiFi, cellular
• Logistics: GPS, cellular
• Home: Zigbee, WiFi

📱 M2M vs PHONE SIM:
M2M SIM: remote management, data optimization, security
Phone SIM: classic user communications

🔒 SECURITY:
• Private APN for secure connections
• End-to-end encryption
• Enhanced authentication
• Data flow monitoring

We support you in choosing optimally according to your technical and economic constraints!`
            },
            {
                keywords: ['price', 'cost', 'pricing', 'budget', 'quote', 'subscription'],
                response: `💰 MIRASENS PRICING

Transparent and modular pricing:

📊 PRICING FACTORS:
• Number of sensors/connected objects
• Connectivity type (LoRa, cellular, WiFi)
• Required platform features
• Desired support services
• Hosting mode (SaaS/On-Premise)

💡 ECONOMIC MODELS:
• SaaS: Monthly subscription, maintenance included
• On-Premise: One-time license, client servers
• Hybrid: Cloud/local mix per needs

🎯 INDICATIVE EXAMPLES:
• Starter (5-20 sensors): €200-500/month
• Business (50-200 sensors): €800-2000/month
• Enterprise (500+ sensors): Custom quote

✅ ALWAYS INCLUDED:
• User training
• Multilingual technical support
• Regular updates
• 2-3 year hardware warranty

📞 PERSONALIZED QUOTE:
Each project being unique, I can connect you with our sales team for detailed analysis and custom quote.

Can you specify your business sector and approximate number of objects to connect?`
            },
            {
                keywords: ['fishflow', 'platform', 'aquaculture', 'supervision'],
                response: `🐟 FISHFLOW PLATFORM

Dedicated aquaculture/agriculture solution:

🎯 KEY FEATURES:
• Multi-equipment and network supervision
• Real-time data analysis
• Customizable dashboards
• Advanced alert system
• Embedded predictive AI

📊 AVAILABLE WIDGETS:
• Temporal charts, analog gauges
• Dynamic geographic maps
• Event timelines
• Colored numerical indicators
• Visual/audio alarms

🤖 ARTIFICIAL INTELLIGENCE:
• Water parameter prediction
• Equipment problem anticipation
• Automatic feed optimization
• Adaptive learning algorithms

🏗️ HOSTING OPTIONS:
• SaaS: Cloud access, monthly subscription
• On-Premise: Local servers, one-time license
• Hybrid: Combination per needs

🔐 SECURITY & ACCESS:
• Granular user rights management
• Multi-factor authentication
• Automatic data backup
• GDPR compliance

✅ CLIENT BENEFITS:
• 20-30% mortality reduction
• Growth optimization
• 15-25% resource savings
• 12-18 month ROI

Live demonstration available! Would you like to see FishFlow in action?`
            },
            {
                keywords: ['miot', 'm-iot', 'platform', 'multi-objects'],
                response: `📊 M-IoT PLATFORM

Universal multi-object solution:

🌐 UNIVERSAL CONNECTIVITY:
• Support all protocols (LoRa, Sigfox, WiFi, 4G)
• Multi-network gateways
• Heterogeneous object integration
• Open standard APIs

📈 ADVANCED VISUALIZATION:
• Configurable dashboards
• Interactive real-time charts
• Geographic maps
• Smart alerts
• Automated reports

🔧 SIMPLIFIED MANAGEMENT:
• Intuitive drag & drop interface
• Remote sensor configuration
• OTA (Over The Air) updates
• Equipment status supervision

🎯 COMPATIBLE SECTORS:
• Agriculture: irrigation, weather, soil
• Industry: machines, maintenance
• City: lighting, waste, parking
• Environment: air quality, water

⚙️ INTEGRATIONS:
• Existing ERP/CRM
• External databases
• Third-party systems via API
• Standard format export

Scalable solution adapted to all IoT projects!`
            },
            {
                keywords: ['sirgps', 'management', 'fleet', 'geolocation', 'gps'],
                response: `📍 SirGPS APPLICATION

Next-generation fleet management:

🚗 VEHICLE TRACKING:
• Precise real-time geolocation
• Detailed route history
• Speeds, stops, mileage
• Programmable geographic zones

⛽ FUEL SAVINGS:
• Consumption per vehicle/driver
• Personalized eco-driving score
• Excessive idling detection
• Automatic route optimization

📱 MOBILE APPLICATION:
• Ergonomic driver interface
• Field mission validation
• Instant communication
• Precise geolocation

🔧 INTELLIGENT MAINTENANCE:
• Planning based on actual usage
• Automatic service alerts
• Detailed cost tracking
• Intervention history

📊 ADVANCED REPORTING:
• Real-time dashboards
• Fleet performance analysis
• Detailed operating costs
• Safety indicators

🎯 MEASURED BENEFITS:
• -15% fuel costs
• -25% administrative time
• +30% route efficiency
• 6-12 month ROI

30-day free demo version! Test SirGPS without commitment.`
            }
        ]
    }
};

// Language detection function
function detectLanguage(message) {
    const frenchWords = ['je', 'vous', 'le', 'la', 'les', 'un', 'une', 'et', 'de', 'du', 'des', 'avec', 'pour', 'dans', 'sur', 'être', 'avoir', 'faire', 'aller', 'pouvoir', 'vouloir', 'savoir', 'devoir', 'prendre', 'venir', 'voir', 'donner', 'parler', 'aimer', 'passer', 'mettre', 'dire', 'partir', 'sortir', 'entrer', 'rester', 'tomber', 'devenir', 'tenir', 'sembler', 'laisser', 'porter', 'suivre', 'vivre', 'mourir', 'naître', 'connaître', 'paraître', 'choisir', 'réussir', 'finir', 'grandir', 'sentir', 'dormir', 'servir', 'mentir', 'partir', 'sortir'];
    const englishWords = ['i', 'you', 'he', 'she', 'it', 'we', 'they', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'among', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'get', 'go', 'come', 'take', 'give', 'make', 'know', 'think', 'see', 'look', 'want', 'need', 'try', 'work', 'use', 'find', 'help', 'ask', 'seem', 'feel', 'try', 'leave', 'call'];
    
    const messageLower = message.toLowerCase();
    const words = messageLower.split(/\s+/);
    
    let frenchScore = 0;
    let englishScore = 0;
    
    words.forEach(word => {
        if (frenchWords.includes(word)) frenchScore++;
        if (englishWords.includes(word)) englishScore++;
    });
    
    return frenchScore > englishScore ? 'fr' : 'en';
}

// Find relevant scenario
function findRelevantScenario(message, language) {
    const knowledge = MIRASENS_KNOWLEDGE[language];
    const messageLower = message.toLowerCase();
    
    for (const scenario of knowledge.scenarios) {
        if (scenario.keywords.some(keyword => messageLower.includes(keyword))) {
            return scenario.response;
        }
    }
    return null;
}

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, conversationHistory = [], language } = req.body;
        
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ 
                error: 'Message is required and must be a string' 
            });
        }

        // Use provided language or detect it from message
        const detectedLanguage = language && ['fr', 'en'].includes(language) 
            ? language 
            : detectLanguage(message);
        const knowledge = MIRASENS_KNOWLEDGE[language];
        
        // Check for relevant scenario first
        const scenarioResponse = findRelevantScenario(message, detectedLanguage);
        if (scenarioResponse) {
            return res.json({
                response: scenarioResponse,
                language: detectedLanguage
            });
        }

        // If no Gemini API available, provide demo response
        if (!model) {
            const demoResponse = detectedLanguage === 'fr' 
                ? `Merci pour votre message ! Je suis actuellement en mode démonstration. Pour une réponse personnalisée de l'IA, veuillez configurer une clé API Google Gemini.

Cependant, je peux vous dire que MIRASENS propose des solutions IoT innovantes pour :
• Smart Aquaculture avec FishFlow
• Smart Agriculture et surveillance des sols
• Smart Industry et maintenance prédictive
• Smart Logistique et gestion de flotte

Contactez-nous au (+213) 560-555-300 ou contact@mirasens.com pour plus d'informations !`
                : `Thank you for your message! I'm currently in demo mode. For personalized AI responses, please configure a Google Gemini API key.

However, I can tell you that MIRASENS offers innovative IoT solutions for:
• Smart Aquaculture with FishFlow
• Smart Agriculture and soil monitoring
• Smart Industry and predictive maintenance
• Smart Logistics and fleet management

Contact us at (+213) 560-555-300 or contact@mirasens.com for more information!`;

            return res.json({
                response: demoResponse,
                language: detectedLanguage
            });
        }

        // Build conversation context
        let conversationContext = '';
        if (conversationHistory.length > 0) {
            conversationContext = '\n\nPrevious conversation:\n' + 
                conversationHistory.slice(-6).map(msg => 
                    `${msg.role}: ${msg.content}`
                ).join('\n');
        }

        // Create prompt for Gemini
        const prompt = `You are MIRASENS AI Assistant, a helpful chatbot for MIRASENS company. 

IMPORTANT INSTRUCTIONS:
- Always respond in ${detectedLanguage === 'fr' ? 'French' : 'English'}
- Be professional, helpful, and knowledgeable about IoT solutions
- Keep responses concise but informative (max 300 words)
- Always offer to connect the user with experts for detailed discussions
- Focus on MIRASENS solutions and expertise

COMPANY KNOWLEDGE:
${knowledge.company}

USER MESSAGE: ${message}
${conversationContext}

Provide a helpful response about MIRASENS IoT solutions. If you don't have specific information, offer to connect them with our experts.`;

        // Generate response using Gemini
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiResponse = response.text();

        res.json({
            response: aiResponse,
            language: detectedLanguage
        });

    } catch (error) {
        console.error('Chat API Error:', error);
        
        // Language-specific error messages
        const errorMessage = detectedLanguage === 'fr' 
            ? 'Désolé, je rencontre un problème technique. Veuillez réessayer dans quelques instants.'
            : 'Sorry, I\'m experiencing a technical issue. Please try again in a few moments.';
            
        res.status(500).json({ 
            error: errorMessage 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'MIRASENS Chatbot API'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ 
        error: 'Internal server error' 
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Endpoint not found' 
    });
});

app.listen(PORT, () => {
    console.log(`MIRASENS Chatbot Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
