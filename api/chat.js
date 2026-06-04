export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method not allowed'
        });
    }

    try {
        const { prompt } = req.body;

        if (!prompt || !prompt.trim()) {
            return res.status(400).json({
                error: 'Prompt is required'
            });
        }

        const apiKey = process.env.GEMINI_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: 'GEMINI_KEY is missing in Vercel Environment Variables'
            });
        }

        const googleResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ]
                })
            }
        );

        const data = await googleResponse.json();

        console.log(
            'Gemini Response:',
            JSON.stringify(data, null, 2)
        );

        if (!googleResponse.ok) {
            return res.status(googleResponse.status).json({
                error: 'Google API Error',
                details: data?.error?.message || 'Unknown Google API error',
                raw: data
            });
        }

        if (
            !data.candidates ||
            !data.candidates[0] ||
            !data.candidates[0].content ||
            !data.candidates[0].content.parts ||
            !data.candidates[0].content.parts[0]
        ) {
            return res.status(500).json({
                error: 'Invalid Gemini response format',
                raw: data
            });
        }

        return res.status(200).json({
            reply: data.candidates[0].content.parts[0].text
        });
    } catch (error) {
        console.error('Server Error:', error);

        return res.status(500).json({
            error: 'Internal Server Error',
            details: error.message
        });
    }
} 
