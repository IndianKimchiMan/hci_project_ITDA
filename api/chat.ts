import { Pinecone } from "@pinecone-database/pinecone";

export default async function handler(req, res) {
  // 1. 보안: POST 요청만 받음
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message } = req.body;
    
    // 키 2개 다 가져오기 (구글: 검색용 / OpenAI: 대답용)
    const googleApiKey = process.env.GOOGLE_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!googleApiKey || !openaiApiKey) {
        throw new Error("API 키가 설정되지 않았습니다. (GOOGLE 또는 OPENAI)");
    }

    // ============================================================
    // 2. 임베딩 (파인콘 호환을 위해 구글 모델 사용)
    // ============================================================
    const embeddingResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${googleApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "models/text-embedding-004",
          content: { parts: [{ text: message }] }
        })
      }
    );

    if (!embeddingResponse.ok) throw new Error("구글 임베딩 실패");

    const embeddingData = await embeddingResponse.json();
    const queryVector = embeddingData.embedding.values;

    // ============================================================
    // 3. 파인콘 검색 (기억 찾아오기)
    // ============================================================
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME);
    
    const queryResponse = await index.query({
      vector: queryVector,
      topK: 3,
      includeMetadata: true,
    });

    const context = queryResponse.matches.map((match) => match.metadata.text).join("\n\n");
    console.log("RAG 검색 성공:", context);

    // ============================================================
    // 4. OpenAI 답변 생성 (GPT-4o-mini)
    // ============================================================
    const systemPrompt = `
    당신은 데일 카네기 인간관계론 전문가입니다.
    아래 [참고 자료]를 바탕으로 사용자의 질문에 친절하게 조언해주세요.
    
    [참고 자료]
    ${context}
    
    답변 끝에 "🥕(OpenAI)"를 꼭 붙여주세요.
    `;

    const chatResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // 가성비 최고 모델
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.7
      })
    });

    if (!chatResponse.ok) {
        const err = await chatResponse.text();
        throw new Error(`OpenAI Error: ${err}`);
    }

    const chatData = await chatResponse.json();
    const aiText = chatData.choices[0].message.content;

    // ============================================================
    // 5. ★ 프론트엔드 맞춤 포장 (하얀 화면 방지!)
    // ============================================================
    const result = {
      intimacyScore: 88, 
      balanceRatio: { speaker1: 50, speaker2: 50 },
      sentiment: { positive: 70, neutral: 20, negative: 10 },
      averageResponseTime: { speaker1: 5, speaker2: 10 },
      summary: "카네기 챗봇의 분석 결과입니다.",
      recommendation: aiText, // 여기에 OpenAI 답변이 들어감
      sentimentFlow: Array(20).fill(null).map((_, i) => ({ time_percentage: i * 5, sentiment_score: 0.5 })),
      responseHeatmap: Array(24).fill(0),
      suggestedReplies: ["감사합니다.", "노력해볼게요.", "그렇군요."],
      suggestedTopics: ["대화법", "취미", "공통 관심사"]
    };

    return res.status(200).json(result);

  } catch (error) {
    console.error("서버 에러:", error);
    return res.status(500).json({ error: error.message });
  }
}
