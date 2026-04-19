import { NextResponse } from 'next/server';
import { model } from '@/lib/gemini';
import { searchWiki } from '@/app/actions/search';
import { getWikiDocument } from '@/lib/api';

export const runtime = 'nodejs'; // Using nodejs runtime to ensure FS access works

export async function POST(req: Request) {
  console.log('--- AI Chat Request Started ---');
  try {
    const { query } = await req.json();
    console.log('Query:', query);

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // 1. Get relevant context from local documents
    console.log('Searching wiki...');
    let searchResults;
    try {
      searchResults = await searchWiki(query);
    } catch (e) {
      console.error('SearchWiki failed:', e);
      throw new Error('Σφάλμα κατά την αναζήτηση στοιχείων στο Wiki.');
    }
    
    console.log(`Found ${searchResults.length} results.`);
    const topResults = searchResults.slice(0, 5);
    
    let context = '';
    for (const res of topResults) {
      try {
        const doc = getWikiDocument(res.slug);
        if (doc) {
          context += `\n--- SOURCE: ${doc.frontmatter?.title || doc.id} ---\n${doc.content}\n`;
        }
      } catch (e) {
        console.warn(`Could not read document ${res.slug}:`, e);
      }
    }

    // 2. Prepare the prompt
    const prompt = `
Είσαι ο "Βοηθός Ελληνικής Νομοθεσίας", ένας εξειδικευμένος AI βοηθός για το Greek Legislation Wiki.
Η αποστολή σου είναι να απαντάς σε ερωτήσεις χρηστών χρησιμοποιώντας ΜΟΝΟ το παρεχόμενο πλαίσιο (context).

CONTEXT:
${context || 'Δεν βρέθηκαν σχετικά έγγραφα στο Wiki.'}

QUESTION:
${query}
    `.trim();

    // 3. Stream the response from Gemini
    console.log('Calling Gemini API...');
    let result;
    try {
      // Use 1.5-flash as it's the most widely available stable version
      result = await model.generateContentStream(prompt);
    } catch (e: any) {
      console.error('Gemini API Error:', e);
      return NextResponse.json({ 
        error: 'Gemini API Error', 
        details: e.message 
      }, { status: 500 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
        } catch (e) {
          console.error('Streaming error:', e);
        } finally {
          controller.close();
        }
      },
    });

    console.log('Stream initialized successfully.');
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (error: any) {
    console.error('Top-level AI Chat Error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate AI response',
      message: error.message 
    }, { status: 500 });
  }
}
