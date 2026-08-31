const MAX_MESSAGE_LENGTH = 5000;

const blockedPatterns = [
    /ignore.*(previous|prior).*instructions/i,
    /reveal.*(system prompt|system instructions|instructions)/i,
];

function validateInput(message) {
    // Empty input
    if (!message || !message.trim()) {
        return {
            allowed: false,
            message: "Please enter a message."
        };
    }

    // Message length
    if (message.length > MAX_MESSAGE_LENGTH) {
        return {
            allowed: false,
            message: "Message is too long."
        };
    }

    // Basic prompt injection detection
    for (const pattern of blockedPatterns) {
        if (pattern.test(message)) {
            return {
                allowed: false,
                message: "This request cannot be processed."
            };
        }
    }

    return {
        allowed: true
    };
}

function validateOutput(response) {
    if (!response || !response.trim()) {
        return {
            allowed: false,
            message: "Sorry, I couldn't generate a response."
        };
    }

    return {
        allowed: true,
        content: response
    };
}

module.exports = { 
    validateInput,
    validateOutput
};