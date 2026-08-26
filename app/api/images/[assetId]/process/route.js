const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(_request, { params }) {
  const { assetId } = await params;
  if (!UUID.test(assetId)) return Response.json({ error: "Invalid asset ID." }, { status: 400 });
  if (!process.env.FUNCTION_URL || !process.env.FUNCTION_AUTH_TOKEN) return Response.json({ error: "Function integration is not configured." }, { status: 500 });
  try {
    const response = await fetch(process.env.FUNCTION_URL, { method: "POST", headers: { "Content-Type": "application/json", "X-Require-Whisk-Auth": process.env.FUNCTION_AUTH_TOKEN }, body: JSON.stringify({ assetId }), cache: "no-store" });
    const body = await response.json();
    return Response.json(body, { status: response.status });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Could not reach the image Function." }, { status: 502 });
  }
}
