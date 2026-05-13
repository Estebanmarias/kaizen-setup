import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import Image from "next/image";
import { MapPin, ArrowRight } from "lucide-react";

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Tour = {
  id: string;
  slug: string;
  name: string;
  occupation: string | null;
  location: string | null;
  cover_image: string | null;
  published_at: string;
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });
}

export default async function WorkspaceToursPage() {
  const { data: tours } = await supabaseServer
    .from("workspace_tours")
    .select("id, slug, name, occupation, location, cover_image, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false }) as { data: Tour[] | null };

  return (
    <main className="min-h-screen bg-white pt-24 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-sm text-blue-500 hover:underline mb-8 inline-block">← Back to Home</Link>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 mb-4 border-b border-gray-100">
          <Link
            href="/blog"
            className="text-sm font-medium text-gray-400 hover:text-gray-700 border-b-2 border-transparent pb-3 px-1 mr-2 transition-colors"
          >
            Articles
          </Link>
          <button className="text-sm font-semibold text-gray-900 border-b-2 border-blue-500 pb-3 px-1">
            Workspace Tours
          </button>
        </div>

        <p className="text-xs font-semibold tracking-widest uppercase text-blue-500 mb-3">Workspace Tours</p>
        <h1 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">Inside the Setups</h1>
        <p className="text-gray-500 max-w-xl mb-12">
          Real workspaces from Nigerian creators, designers, and techies. Their gear, their workflow, their story.
        </p>

        {!tours?.length ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-4">🖥️</p>
            <p className="font-medium">Tours coming soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map(tour => (
              <Link key={tour.id} href={`/workspace-tours/${tour.slug}`}
                className="group bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-500 transition-colors flex flex-col">
                <div className="relative h-52 bg-gray-100 overflow-hidden">
                  {tour.cover_image ? (
                    <Image src={tour.cover_image} alt={tour.name} fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🖥️</div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-xs font-semibold text-blue-500 mb-1">{tour.occupation}</p>
                  <h2 className="font-bold text-lg text-gray-900 group-hover:text-blue-500 transition-colors mb-2">{tour.name}</h2>
                  {tour.location && (
                    <p className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                      <MapPin size={11} /> {tour.location}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">{formatDate(tour.published_at)}</span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-blue-500 group-hover:gap-2 transition-all">
                      Read Tour <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}