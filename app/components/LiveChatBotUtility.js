// ChatbotManager class to handle conversations with Gemini
class GeminiChatbot {
    constructor(apiKey, websiteInfo) {
        this.apiKey = apiKey;
        this.websiteInfo = websiteInfo;
        this.conversations = new Map();
        // Updated API URL to use the latest endpoint
        this.API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent';
    }

    // Initialize context for the chatbot
    #createContext() {
        const uniqueWork = Array.from(new Set(this.websiteInfo.work.map(item => item.name)))
            .map(name => ({ name }));
        return {
            websiteName: this.websiteInfo.name,
            description: this.websiteInfo.description,
            features: this.websiteInfo.features,
            faq: this.websiteInfo.faq,
            work: {
                data: uniqueWork,
                searchTerms: ['client', 'partner', 'work', 'portfolio', 'collaborator'],
                getClientList: () => uniqueWork.map(item => item.name).join(', '),
                isClientQuery: (query) => {
                    return this.work.searchTerms.some(term =>
                        query.toLowerCase().includes(term.toLowerCase())
                    );
                }
            },
            contact: this.websiteInfo.contact,
        };
    }

    // Format context into a system message
    #formatContextMessage() {
        const context = this.#createContext();
        const clientsList = context.work.data.map(item => item.name).join(', ');

        return `You are a helpful assistant for ${context.websiteName}. 
        Website Information:
        - Description: ${context.description}
        - Features/Functionalities/Functionality: ${context.features.join(', ')}
        - Contact/Inquiry/Submission/Form: ${context.contact}

        Client Information:
        We have worked with several distinguished clients including: ${clientsList}

        Instructions for client-related queries:
        - When users ask about clients, partners, or work, list all clients
        - Mention that we have worked with: ${clientsList}
        - If asked about specific clients, confirm if they are in our list
        - Please help users with their questions about our website. If you don't know something, direct them to ${context.contact}

        Common FAQs:
        ${Object.entries(context.faq).map(([q, a]) => `Q: ${q}\nA: ${a}`).join('\n')}

        Please help users with their questions about our website. If you don't know something, direct them to ${context.contact}.`;
    }

    // Start a new conversation
    startConversation(userId) {
        const conversationId = `conv_${Date.now()}`;
        this.conversations.set(conversationId, {
            userId,
            messages: [{
                role: 'model',
                parts: [{ text: this.#formatContextMessage() }]
            }],
            startTime: new Date()
        });
        return conversationId;
    }

    // Process message with Gemini API
    async sendMessage(conversationId, userMessage) {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            throw new Error('Conversation not found');
        }

        // Add user message to conversation
        conversation.messages.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });

        try {
            const response = await fetch(`${this.API_URL}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: conversation.messages,
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    },
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_HATE_SPEECH",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        }
                    ]
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('API Error:', data);
                throw new Error(data.error?.message || 'Gemini API error');
            }

            const botResponse = data.candidates[0].content.parts[0].text;

            // Add bot response to conversation history
            conversation.messages.push({
                role: 'model',
                parts: [{ text: botResponse }]
            });

            return {
                message: botResponse,
                conversationId
            };

        } catch (error) {
            console.error('Error calling Gemini API:', error);
            return {
                message: "I'm having trouble connecting right now. Please try again or contact our support team.",
                error: true
            };
        }
    }

    // Get conversation history
    getConversationHistory(conversationId) {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            return null;
        }

        return conversation.messages.filter(msg =>
            msg.role !== 'model' ||
            !msg.parts[0].text.includes('You are a helpful assistant')
        );
    }

    // End conversation
    endConversation(conversationId) {
        if (this.conversations.has(conversationId)) {
            this.conversations.get(conversationId).endTime = new Date();
            // In a real implementation, you might want to store the conversation
            // in a database before deleting it from memory
            this.conversations.delete(conversationId);
            return true;
        }
        return false;
    }
}

export default GeminiChatbot;