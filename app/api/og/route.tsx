import { ImageResponse } from 'next/og';
import { getManifestoState } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customWord = searchParams.get('word');
    const customHandle = searchParams.get('handle');

    const state = await getManifestoState();
    const chapter = state.activeChapter;
    const words = state.words;

    const wordsText = customWord
      ? `"${customWord}" etched by @${customHandle || 'anonymous'}`
      : words.slice(-12).map((w) => w.wordText).join(' ');

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#FBF9F5',
            padding: '60px 70px',
            border: '16px solid #181716',
            fontFamily: 'monospace',
          }}
        >
          {/* Masthead Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid #181716', paddingBottom: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '18px', letterSpacing: '4px', textTransform: 'uppercase', color: '#BA2D25', fontWeight: 'bold' }}>
                LIVE ARCHIVAL DISPATCH
              </span>
              <span style={{ fontSize: '38px', fontWeight: '900', textTransform: 'uppercase', color: '#181716' }}>
                The Single-Sentence Manifesto
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#181716', color: '#FBF9F5', padding: '8px 16px', fontSize: '18px', fontWeight: 'bold' }}>
              VOLUME #{chapter.chapterNumber}
            </div>
          </div>

          {/* Living Sentence Centerpiece */}
          <div style={{ display: 'flex', flexDirection: 'column', padding: '20px 0' }}>
            <span style={{ fontSize: '18px', color: '#59544D', textTransform: 'uppercase', marginBottom: '10px' }}>
              Current Sentence Tip:
            </span>
            <div
              style={{
                fontSize: '44px',
                fontWeight: 'bold',
                color: '#181716',
                lineHeight: 1.3,
                wordBreak: 'break-word',
              }}
            >
              &ldquo;...{wordsText}
              <span style={{ color: '#BA2D25', marginLeft: '8px' }}>▌</span>&rdquo;
            </div>
          </div>

          {/* Footer Card Seal */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '3px solid #D6CEBF', paddingTop: '20px' }}>
            <span style={{ fontSize: '20px', color: '#59544D' }}>
              {words.length} Words Etched by Strangers Across the Globe
            </span>
            <div style={{ display: 'flex', backgroundColor: '#BA2D25', color: '#FBF9F5', padding: '8px 20px', fontSize: '20px', fontWeight: 'bold', letterSpacing: '2px' }}>
              $1.00 / ₦100 PER WORD
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (err) {
    console.error('Error generating OG image:', err);
    return new Response('Failed to generate OG image', { status: 500 });
  }
}
