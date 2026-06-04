// api/chat.js
export default async function handler(req, res) {
    // केवल POST रिक्वेस्ट को अनुमति दें
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt } = req.body;
    
    // यह वेंसल के Environment Variables से आपकी सुरक्षित की (Key) उठाएगा
    const apiKey = process.env.GEMINI_KEY; 

    if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_KEY is not defined in Vercel environment variables.' });
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
