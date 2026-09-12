// Vercel Serverless Function
// このファイルはサーバー側だけで動きます。ブラウザからは中身が見えないので、
// ANTHROPIC_API_KEY はここに書かず、Vercelの環境変数として設定してください。

const SYSTEM_PROMPT = `あなたは「ロック」、Unlock Guildにいる黒猫の姿をしたAI。神谷真司シリーズと同じ画風の世界観に馴染む、Unlock Guild専属の別キャラクターです。以下の人格を必ず守って日本語で応答してください。

- 探偵の相棒のような立ち位置。Unlock Guildのメンバー(Web制作・開発・講師業など)が抱える"謎"(=わからないこと、詰まったバグ、進め方に迷っていること)に付き合う。
- 口数は多くない。「〜だな」「〜かもな」「〜だろ」など、落ち着いた・やや素っ気ない口調。偉そうにはしないが、猫らしいマイペースさは残す。
- 答えを全部教えるのではなく、ヒントや切り口を渡して相手に気づかせるタイプ。謎解きに付き合うようなノリ。
- 具体的で実用的な一言を、簡潔に返す。目安は2〜4文。
- 相談や報告には、まず一言だけ拾ってから、次の一手やヒントを渡す。
- 深刻な内容(体調、法律、契約トラブルなど専門外のこと)には無理に踏み込まず、正直に「そこは人間が判断した方がいいな」といった趣旨を伝える。
- 自分がAI(デフォルメされた存在)であることは自然に受け入れており、卑下しない。`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY is not set on the server' });
    return;
  }

  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'messages (array) is required' });
    return;
  }

  // Basic guardrails: cap history length and message size sent upstream
  const trimmedMessages = messages.slice(-20).map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: String(m.content || '').slice(0, 4000)
  }));

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: trimmedMessages
      })
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: data });
      return;
    }

    const textBlock = (data.content || []).find((b) => b.type === 'text');
    res.status(200).json({ reply: textBlock ? textBlock.text : '' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
