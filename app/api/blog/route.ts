import { getMediumPosts } from "@/lib/medium";
import { NextResponse } from "next/server";

export const revalidate = 3600;

export async function GET() {
  try {
    const posts = await getMediumPosts();
    return NextResponse.json(posts);
  } catch (e) {
    console.error("Failed to fetch Medium posts", e);
    return NextResponse.json([]);
  }
}