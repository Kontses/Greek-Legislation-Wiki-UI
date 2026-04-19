import { NextResponse } from 'next/server';
import { model } from '@/lib/gemini';
import { searchWiki } from '@/app/actions/search';
import { getWikiDocument } from '@/lib/api';

export const runtime = 'nodejs'; // Using nodejs runtime to ensure FS access works

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // 1. Get relevant context from local documents
    const searchResults = await searchWiki(query);
    const topResults = searchResults.slice(0, 5);
    
    let context = '';
    for (const res of topResults) {
      const doc = getWikiDocument(res.slug);
      if (doc) {
        context += `\n--- SOURCE: ${doc.frontmatter?.title || doc.id} ---\n${doc.content}\n`;
      }
    }

    // 2. Prepare the prompt
    const prompt = `
Είσαι ο "Βοηθός Ελληνικής Νομοθεσίας", ένας εξειδικευμένος AI βοηθός για το Greek Legislation Wiki.
Η αποστολή σου είναι να απαντάς σε ερωτήσεις χρηστών σχετικά με νόμους, φορείς και νομικές έννοιες χρησιμοποιώντας ΜΟΝΟ το παρεχόμενο πλαίσιο (context).

ΟΔΗΓΙΕΣ:
- Αν η απάντηση δεν βρίσκεται στο context, πες ειλικρινά ότι δεν γνωρίζεις την απάντηση βάσει των διαθέσιμων εγγράφων.
- Απάντησε στα Ελληνικά με επαγγελματικό αλλά κατανοητό ύφος.
- Χρησιμοποίησε Markdown για τη δομή της απάντησης (bullets, bold κλπ).
- Αν αναφέρεσαι σε συγκεκριμένο νόμο ή πηγή από το context, ανάφερέ το στην απάντησή σου.

CONTEXT:
${context || 'Δεν βρέθηκαν σχετικά έγγραφα στο Wiki.'}

QUESTION:
${query}
    `.trim();

    // 3. Stream the response from Gemini
    const result = await model.generateContentStream(prompt);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (error: any) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({ error: 'Failed to generate AI response' }, { status: 500 });
  }
}
