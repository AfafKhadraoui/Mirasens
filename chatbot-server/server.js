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
        
        // Allow any localhost or 127.0.0.1 with any port
        if (origin.match(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/)) {
            return callback(null, true);
        }
        
        // Allow specific domains
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5500',
            'http://localhost:5501',
            'http://localhost:5502',
            'http://127.0.0.1:5500',
            'http://127.0.0.1:5501',
            'http://127.0.0.1:5502',
            'https://your-domain.com' // Replace with your actual domain
        ];
        
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        // For development, allow all origins
        if (process.env.NODE_ENV === 'development') {
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

// MIRASENS Knowledge Base
const MIRASENS_KNOWLEDGE = {
    fr: {
        company: `MIRASENS est une entreprise spécialisée dans l'Internet des Objets (IoT) et les solutions de connectivité M2M basée à Dounia Parc, Dely Brahim, Alger, Algérie.
        
SECTEURS D'ACTIVITÉ:
• Smart Aquaculture: Surveillance qualité eau, croissance poissons, systèmes alimentation automatisés
• Smart Agriculture: Surveillance sol, optimisation irrigation, analyse santé cultures
• Smart Industry: Maintenance prédictive, surveillance équipements, optimisation production
• Smart Logistique: Suivi d'actifs, optimisation routes, surveillance chaîne froid
• Smart Building: Gestion énergie, systèmes sécurité, optimisation occupation
• Gestion de Flottes: Suivi véhicules, optimisation carburant, planification maintenance

TECHNOLOGIES:
• Protocoles: LoRaWAN, Sigfox, NB-IoT, WiFi, Bluetooth
• Capteurs: Température, humidité, pH, GPS, présence, vibration
• Plateformes: Surveillance temps réel, analytics, algorithmes prédictifs

SOLUTIONS LOGICIELLES:
• FishFlow: Plateforme supervision multi-équipements pour aquaculture/agriculture
• M-IoT: Plateforme tout-en-un gestion et visualisation multi-objets
• SirGPS: Application web/mobile gestion flottes GPS

CONTACT:
Téléphone: (+213) 560-555-300
Email: contact@mirasens.com
Site web: www.mirasens.com`,

        scenarios: [
            {
                keywords: ['aquaculture', 'poisson', 'élevage', 'bassin', 'eau'],
                response: `Excellente question ! MIRASENS propose des solutions IoT spécialisées pour l'aquaculture intelligente. Nos capteurs connectés surveillent en temps réel :
• Température et pH de l'eau
• Taux d'oxygène dissous  
• Niveaux d'ammoniac et nitrites
• Turbidité et conductivité

Notre plateforme FishFlow vous permet de recevoir des alertes instantanées et d'optimiser les conditions d'élevage. Souhaitez-vous que je vous mette en contact avec notre expert aquaculture pour une démonstration personnalisée ?`
            },
            {
                keywords: ['agriculture', 'ferme', 'culture', 'irrigation', 'sol'],
                response: `MIRASENS offre des solutions IoT complètes pour l'agriculture de précision qui optimisent les rendements et réduisent la consommation de ressources :
• Surveillance Sol: Humidité, température et niveaux nutritifs en temps réel
• Stations Météo: Surveillance microclimat avec capteurs pluie, vent, humidité
• Contrôle Irrigation: Systèmes arrosage automatisés basés sur conditions sol
• Santé Cultures: Détection précoce maladies et problèmes parasitaires

Notre plateforme M-IoT intègre toutes les données pour fournir des insights exploitables. Voulez-vous planifier une consultation pour discuter de vos besoins agricoles spécifiques ?`
            },
            {
                keywords: ['industrie', 'maintenance', 'équipement', 'production'],
                response: `Nos solutions Smart Industry incluent :
• Maintenance prédictive avec capteurs vibration et température
• Surveillance équipements temps réel
• Optimisation processus production
• Alertes anomalies automatiques
• Tableaux de bord personnalisés

Comment puis-je vous aider avec votre projet industriel spécifique ?`
            },
            {
                keywords: ['logistique', 'transport', 'flotte', 'véhicule', 'suivi'],
                response: `Pour la logistique intelligente, MIRASENS propose :
• Géolocalisation véhicules et marchandises
• Surveillance chaîne du froid
• Optimisation des routes
• Gestion de flotte complète avec SirGPS
• Suivi temps réel des livraisons

Quel type de solution logistique vous intéresse ?`
            },
            {
                keywords: ['prix', 'coût', 'tarif', 'budget'],
                response: `Nos tarifs dépendent de plusieurs facteurs :
• Nombre de capteurs/objets connectés
• Type de connectivité choisie
• Fonctionnalités plateforme requises
• Services d'accompagnement

Je peux vous mettre en contact avec notre équipe commerciale pour un devis personnalisé. Pouvez-vous me donner plus de détails sur votre projet ?`
            }
        ]
    },
    en: {
        company: `MIRASENS is a company specialized in Internet of Things (IoT) and M2M connectivity solutions based in Dounia Parc, Dely Brahim, Algiers, Algeria.

BUSINESS SECTORS:
• Smart Aquaculture: Water quality monitoring, fish growth tracking, automated feeding systems
• Smart Agriculture: Soil monitoring, irrigation optimization, crop health analytics  
• Smart Industry: Predictive maintenance, equipment monitoring, production optimization
• Smart Logistics: Asset tracking, route optimization, cold chain monitoring
• Smart Buildings: Energy management, security systems, occupancy optimization
• Fleet Management: Vehicle tracking, fuel optimization, maintenance scheduling

TECHNOLOGIES:
• Protocols: LoRaWAN, Sigfox, NB-IoT, WiFi, Bluetooth
• Sensors: Temperature, humidity, pH, GPS, presence, vibration
• Platforms: Real-time monitoring, analytics, predictive algorithms

SOFTWARE SOLUTIONS:
• FishFlow: Multi-equipment supervision platform for aquaculture/agriculture
• M-IoT: All-in-one platform for multi-object management and visualization
• SirGPS: Web/mobile application for GPS fleet management

CONTACT:
Phone: (+213) 560-555-300
Email: contact@mirasens.com
Website: www.mirasens.com`,

        scenarios: [
            {
                keywords: ['aquaculture', 'fish', 'farming', 'pond', 'water'],
                response: `Great question! MIRASENS offers specialized IoT solutions for smart aquaculture. Our connected sensors monitor in real-time:
• Water temperature and pH
• Dissolved oxygen levels
• Ammonia and nitrite levels  
• Turbidity and conductivity

Our FishFlow platform allows you to receive instant alerts and optimize farming conditions. Would you like me to connect you with our aquaculture expert for a personalized demonstration?`
            },
            {
                keywords: ['agriculture', 'farm', 'crop', 'irrigation', 'soil'],
                response: `MIRASENS offers comprehensive IoT solutions for precision agriculture that help optimize crop yields and reduce resource consumption:
• Soil Monitoring: Real-time soil moisture, temperature, and nutrient levels
• Weather Stations: Microclimate monitoring with rain, wind, and humidity sensors
• Irrigation Control: Automated watering systems based on soil conditions
• Crop Health: Early detection of diseases and pest issues

Our M-IoT platform integrates all data to provide actionable insights and recommendations. Would you like to schedule a consultation to discuss your specific farming needs?`
            },
            {
                keywords: ['industry', 'maintenance', 'equipment', 'production'],
                response: `Our Smart Industry solutions include:
• Predictive maintenance with vibration and temperature sensors
• Real-time equipment monitoring
• Production process optimization
• Automatic anomaly alerts
• Customized dashboards

How can I help you with your specific industrial project?`
            },
            {
                keywords: ['logistics', 'transport', 'fleet', 'vehicle', 'tracking'],
                response: `For smart logistics, MIRASENS offers:
• Vehicle and goods geolocation
• Cold chain monitoring
• Route optimization
• Complete fleet management with SirGPS
• Real-time delivery tracking

What type of logistics solution interests you?`
            },
            {
                keywords: ['price', 'cost', 'pricing', 'budget'],
                response: `Our pricing depends on several factors:
• Number of sensors/connected objects
• Type of connectivity chosen
• Required platform features
• Support services

I can connect you with our sales team for a personalized quote. Can you give me more details about your project?`
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
        const { message, conversationHistory = [] } = req.body;
        
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ 
                error: 'Message is required and must be a string' 
            });
        }

        // Detect language
        const language = detectLanguage(message);
        const knowledge = MIRASENS_KNOWLEDGE[language];
        
        // Check for relevant scenario first
        const scenarioResponse = findRelevantScenario(message, language);
        if (scenarioResponse) {
            return res.json({
                response: scenarioResponse,
                language: language
            });
        }

        // If no Gemini API available, provide demo response
        if (!model) {
            const demoResponse = language === 'fr' 
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
                language: language
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
- Always respond in ${language === 'fr' ? 'French' : 'English'}
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
            language: language
        });

    } catch (error) {
        console.error('Chat API Error:', error);
        
        // Language-specific error messages
        const errorMessage = detectLanguage(req.body.message || '') === 'fr' 
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
