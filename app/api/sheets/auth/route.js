export async function POST(request) {
  try {
    const body = await request.json();
    const { pin } = body;

    if (!pin) {
      return Response.json(
        { success: false, error: 'PIN is required' },
        { status: 400 }
      );
    }

    const correctPin = process.env.EDITOR_PIN || 'cloud10';

    if (pin === correctPin) {
      return Response.json({ success: true, role: 'editor' });
    }

    return Response.json({ success: false, error: 'Invalid PIN' }, { status: 401 });
  } catch (error) {
    console.error('Auth error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
