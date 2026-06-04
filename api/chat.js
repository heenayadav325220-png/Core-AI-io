export default async function handler(req, res) {
    // CORS Headers ताकि ब्राउज़र ब्लॉक न करे
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_KEY; 

    // चेक करना कि वेंसल में की (Key) सेट है या नहीं
    if (!apiKey) {
        return res.status(500).json({ 
            error: 'GEMINI_KEY is missing in Vercel Environment Variables.' 
        });
    }

    try {
        // जेमिनी एपीआई का बिल्कुल सही एंडपॉइंट
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ text: prompt }] 
                }]
            })
        });

        const data = await response.json();

        // अगर गूगल की तरफ से कोई एरर आता है तो उसे लॉग करना
        if (data.error) {
            return res.status(response.status).json({ 
                error: "Google API Error", 
                details: data.error.message 
            });
        }

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
