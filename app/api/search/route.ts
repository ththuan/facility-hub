import { NextResponse } from "next/server";
// import { supabaseAdmin } from "../_supabaseAdmin";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  
  if (!q) {
    return NextResponse.json({ results: [] });
  }

  try {
    // Temporary mock search results until Supabase is connected
    const mockResults = [
      {
        type: "device",
        id: "1",
        title: "Máy tính để bàn Dell OptiPlex",
        description: "Mã: DEV001, Trạng thái: Tốt",
        url: "/devices/1"
      },
      {
        type: "room",
        id: "1", 
        title: "Phòng Giám đốc",
        description: "Mã: R001, Tầng 3",
        url: "/rooms/1"
      },
      {
        type: "document",
        id: "1",
        title: "Hợp đồng mua máy tính Dell",
        description: "Loại: contract, Tags: hợp đồng, Dell",
        url: "/documents/1"
      }
    ].filter(item => 
      item.title.toLowerCase().includes(q.toLowerCase()) ||
      item.description.toLowerCase().includes(q.toLowerCase())
    );

    // Future Supabase implementation:
    // const { data, error } = await supabaseAdmin.rpc("search_all", { search_term: q });
    // if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    // return NextResponse.json({ results: data });

    return NextResponse.json({ results: mockResults });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
