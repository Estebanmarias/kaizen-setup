"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import TourForm from "../../TourForm";

export default function EditTourPage() {
  const { id } = useParams();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) return;
    supabase.from("workspace_tours").select("*").eq("id", id).single()
      .then(({ data }) => { setTour(data); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div className="p-6 max-w-4xl mx-auto space-y-4 animate-pulse">
      <div className="h-8 bg-white/[0.03] rounded w-1/3" />
      <div className="h-64 bg-white/[0.03] rounded-2xl" />
    </div>
  );

  if (!tour) return <div className="p-6 text-center text-gray-500">Tour not found.</div>;

  return <TourForm initial={tour} />;
}