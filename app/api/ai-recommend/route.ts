import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const BUDGET_RANGES: Record<string, [number, number]> = {
  "Under ₦50,000":        [0,       50000],
  "₦50,000 – ₦150,000":  [50000,   150000],
  "₦150,000 – ₦300,000": [150000,  300000],
  "Above ₦300,000":       [300000,  99999999],
};

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { budget, useCase, existing } = await req.json();

  if (!budget || !useCase || !existing) {
    return NextResponse.json({ error: "Missing answers" }, { status: 400 });
  }

  // Fetch all in-stock products
  const { data: products } = await supabase
    .from("products")
    .select("id, name, description, price_naira, category, slug, image_url, variants")
    .eq("in_stock", true);

  if (!products?.length) {
    return NextResponse.json({ error: "No products available" }, { status: 500 });
  }

  const [minBudget, maxBudget] = BUDGET_RANGES[budget] ?? [0, 99999999];

  // Filter to affordable products
  const affordable = products.filter(p => {
    if (p.price_naira) return p.price_naira <= maxBudget;
    // variant-priced — include and let AI decide
    return true;
  });

  const productList = affordable.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price_naira ? `₦${p.price_naira.toLocaleString()}` : "Variant priced",
    category: p.category,
    slug: p.slug,
  }));

  const prompt = `You are a Nigerian tech setup expert for KaizenSetup, a workspace and gaming setup brand based in Ibadan, Nigeria.

A customer has answered these questions:
- Budget: ${budget}
- Primary use: ${useCase}
- What they already have: ${existing}

Here are the EXACT available in-stock products. You MUST only recommend products from this exact list, using the EXACT id and slug values provided:
${JSON.stringify(productList, null, 2)}

Recommend the best 3-5 products for this customer from the list above. Be practical and budget-conscious.

CRITICAL RULES:
- Only use products from the list above
- Copy the id and slug EXACTLY as they appear in the list — do not modify or generate new ones
- Give a one-sentence reason for each product tailored to this customer

Respond ONLY with a valid JSON array, no markdown backticks, no extra text:
[
  {
    "id": "exact-id-from-list",
    "slug": "exact-slug-from-list",
    "name": "exact-name-from-list",
    "reason": "One sentence why this suits them"
  }
]`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const aiData = await response.json();
  const text = aiData.content?.[0]?.text ?? "[]";
  console.log("AI raw response:", text);
  console.log("Products in DB:", products.map(p => ({ id: p.id, slug: p.slug, name: p.name })));

  let recommendations: { id: string; slug: string; name: string; reason: string }[] = [];
  try {
    recommendations = JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return NextResponse.json({ error: "AI response parsing failed" }, { status: 500 });
  }

  // Enrich with full product data — match by id, slug, or name
  const enriched = recommendations.map(rec => {
    const product = products.find(p =>
      p.id === rec.id ||
      p.slug === rec.slug ||
      p.name.toLowerCase() === rec.name?.toLowerCase()
    );
    if (!product) return null;
    return {
      ...rec,
      id: product.id,
      slug: product.slug,
      name: product.name,
      image_url: product.image_url ?? null,
      price_naira: product.price_naira ?? null,
      category: product.category ?? "",
    };
  }).filter(Boolean);

  return NextResponse.json({ recommendations: enriched });
}