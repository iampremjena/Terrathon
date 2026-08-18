import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('Missing URL', { status: 400 });
  }

  try {
    // Fetch the image pretending to be a verified backend server
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'TerrathonApp/1.0 (Contact: admin@terrathon.com)',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
    });

    if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Stream it back to your frontend with proper caching
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 24 hours to make it blazing fast
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new NextResponse('Error proxying image', { status: 500 });
  }
}