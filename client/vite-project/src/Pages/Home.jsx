import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { axiosInstance } from "../axiosCalls/axios";


const stories = [
  { name: "Your Story", initials: "You", tone: "from-indigo-500 to-violet-500" },
  { name: "Ananya", initials: "AN", tone: "from-pink-500 to-rose-500" },
  { name: "Rohan", initials: "RO", tone: "from-cyan-500 to-blue-500" },
  { name: "Priya", initials: "PR", tone: "from-amber-400 to-orange-500" },
  { name: "Arjun", initials: "AR", tone: "from-emerald-400 to-teal-500" },
];

function Avatar({ initials, tone = "from-slate-700 to-slate-900", size = "h-11 w-11" }) {
  return (
    <div className={`flex ${size} shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${tone} text-xs font-bold text-white ring-2 ring-white`}>
      {initials}
    </div>
  );
}

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contentType, setContentType] = useState("post");
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedItems, setFeedItems] = useState([]);
  const [fetchingFeed, setFetchingFeed] = useState(true);

  const getInitials = (name) =>
    name?.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "U";

  // Fetch both posts and reels concurrently and combine them into one feed
  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const [postsRes, reelsRes] = await Promise.all([
          axiosInstance.get("/post/getAllPosts"),
          axiosInstance.get("/reel/getAllReels"),
        ]);

        const posts = (postsRes.data.posts || []).map((post) => ({
          ...post,
          type: "post",
        }));

        const reels = (reelsRes.data.reels || []).map((reel) => ({
          ...reel,
          type: "reel",
        }));

        // Merge posts and reels, then sort by newest date
        const combined = [...posts, ...reels].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setFeedItems(combined);
      } catch (error) {
        console.error("Error fetching feed items:", error);
      } finally {
        setFetchingFeed(false);
      }
    };

    fetchFeed();
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleContentTypeChange = (type) => {
    setContentType(type);
    setSelectedFile(null);
  };

  const handleCreateContent = async () => {
    if (!caption && !selectedFile) {
      alert(`Please provide a caption or select a ${contentType === "post" ? "image" : "video"}.`);
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("caption", caption);

      if (selectedFile) {
        const fieldName = contentType === "post" ? "image" : "video";
        formData.append(fieldName, selectedFile);
      }

      const endpoint = contentType === "post" ? "/post/createPost" : "/reel/createReel";

      const response = await axiosInstance.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const newItem = response.data.post || response.data.reel;
      console.log(newItem)
      const createdType = contentType;

      // Prepend newly created item directly to the top of the feed
      setFeedItems((prev) => [{ ...newItem, type: createdType }, ...prev]);

      // Reset form controls
      setCaption("");
      setSelectedFile(null);
    } catch (error) {
      console.error("Error creating content:", error);
      alert(error.response?.data?.message || "Failed to create content");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <button onClick={() => navigate("/home")} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-black text-white shadow-sm">
              S
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-base font-black tracking-tight">SST Social</p>
              <p className="text-[11px] text-slate-500">Your circle, your feed.</p>
            </div>
          </button>

          <div className="hidden w-72 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500 md:flex">
            <span className="text-base">⌕</span>
            <span>Search people or posts</span>
          </div>

          <div className="flex items-center gap-2">
            <button className="rounded-full p-2.5 text-slate-500 transition hover:bg-slate-100" aria-label="Notifications">♡</button>
            <button
              onClick={() => navigate(`/profile/${user?.username}`)}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 transition hover:border-slate-300 hover:shadow-sm"
            >
              <Avatar initials={getInitials(user?.name)} tone="from-indigo-500 to-violet-500" size="h-8 w-8" />
              <span className="hidden text-sm font-semibold sm:block">{user?.name || user?.username || "You"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)_280px]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
              <button className="flex w-full items-center gap-3 rounded-2xl bg-indigo-50 px-4 py-3 text-left">
                <span className="text-lg">⌂</span>
                <span className="text-sm font-bold text-indigo-700">Home Feed</span>
              </button>
              <button
                onClick={() => navigate(`/profile/${user?.username}`)}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-slate-600 transition hover:bg-slate-50"
              >
                <span className="text-lg">◉</span>
                <span className="text-sm font-semibold">My Profile</span>
              </button>
              <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-slate-600 transition hover:bg-slate-50">
                <span className="text-lg">♡</span>
                <span className="text-sm font-semibold">Notifications</span>
              </button>
              <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-slate-600 transition hover:bg-slate-50">
                <span className="text-lg">⌁</span>
                <span className="text-sm font-semibold">Explore</span>
              </button>
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <h1 className="text-xl font-black tracking-tight">Your Feed</h1>
                <p className="mt-1 text-xs text-slate-500">See what your circle is up to.</p>
              </div>
              <button className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600">Latest ↓</button>
            </div>
            <div className="flex gap-4 overflow-x-auto border-t border-slate-100 px-5 py-4 scrollbar-hide">
              {stories.map((story, index) => (
                <button key={story.name} className="group flex w-[76px] shrink-0 flex-col items-center gap-2">
                  <div className={`rounded-full bg-gradient-to-br ${story.tone} p-[3px] transition group-hover:scale-105`}>
                    <div className="rounded-full bg-white p-[2px]">
                      <Avatar initials={index === 0 ? getInitials(user?.name) : story.initials} tone={story.tone} size="h-12 w-12" />
                    </div>
                  </div>
                  <span className="w-full truncate text-center text-[11px] font-semibold text-slate-600">
                    {index === 0 ? "Your Story" : story.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <Avatar initials={getInitials(user?.name)} tone="from-indigo-500 to-violet-500" />
              <textarea
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                maxLength={500}
                rows={2}
                placeholder={`What's on your mind, ${user?.name?.split(" ")[0] || "there"}?`}
                className="flex-1 resize-none rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:bg-slate-100"
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => handleContentTypeChange("post")}
                className={contentType === "post" ? "rounded-xl bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700" : "rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50"}
              >
                ▧ Post
              </button>

              <button
                type="button"
                onClick={() => handleContentTypeChange("reel")}
                className={contentType === "reel" ? "rounded-xl bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700" : "rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50"}
              >
                ▶ Reel
              </button>

              <label className="cursor-pointer rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-50">
                {contentType === "post" ? "Choose Image" : "Choose Video"}
                <input
                  type="file"
                  accept={contentType === "post" ? "image/*" : "video/*"}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                disabled={loading}
                onClick={handleCreateContent}
                className="ml-auto rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? "Posting..." : contentType === "post" ? "Create Post" : "Create Reel"}
              </button>
            </div>

            {selectedFile && (
              <p className="mt-2 text-xs text-slate-500">Selected: {selectedFile.name}</p>
            )}
          </div>

          <div className="space-y-5">
            {fetchingFeed ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                Loading feed...
              </div>
            ) : feedItems.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                No posts or reels to show yet. Be the first to share!
              </div>
            ) : (
              feedItems.map((item) => (
                <article key={item._id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar initials={getInitials(item.author?.name)} tone="from-indigo-500 to-violet-500" />
                      <div>
                        <p className="text-sm font-bold">{item.author?.name || "User"}</p>
                        <p className="text-xs text-slate-400">
                          @{item.author?.username || "username"}
                          {item.createdAt && ` · ${new Date(item.createdAt).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    {item.type === "reel" && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">Reel</span>
                    )}
                  </div>

                  {item.type === "post" ? (
                    item.image && (
                      <img src={item.image} alt="Post content" className="w-full max-h-[520px] object-cover" />
                    )
                  ) : (
                    item.video && (
                      <video src={item.video} controls className="w-full max-h-[520px] object-cover bg-black" />
                    )
                  )}

                  <div className="px-5 pb-5 pt-4">
                    {item.caption && (
                      <p className="text-sm text-slate-700 mb-3">{item.caption}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>0 likes</span>
                      <span>0 comments</span>
                    </div>
                    <div className="mt-4 flex border-t border-slate-100 pt-3">
                      <button className="flex-1 rounded-xl py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">♡ Like</button>
                      <button className="flex-1 rounded-xl py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">◌ Comment</button>
                      <button className="flex-1 rounded-xl py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">↗ Share</button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black">People to follow</h2>
                <button className="text-xs font-bold text-indigo-600">See all</button>
              </div>
              <div className="mt-4 space-y-4">
                {[
                  ["Priya Nair", "priyanair", "PN", "from-amber-400 to-orange-500"],
                  ["Arjun Kapoor", "arjunk", "AK", "from-emerald-400 to-teal-500"],
                  ["Meera Das", "meerad", "MD", "from-fuchsia-500 to-purple-500"],
                ].map(([name, handle, initials, tone]) => (
                  <div key={handle} className="flex items-center gap-3">
                    <Avatar initials={initials} tone={tone} size="h-10 w-10" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{name}</p>
                      <p className="truncate text-xs text-slate-400">@{handle}</p>
                    </div>
                    <button className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">Follow</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Next class</p>
              <p className="mt-2 text-sm font-bold text-slate-700">Connect feed APIs</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Posts, reels, likes and comments can be wired without changing this UI structure.</p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default Home;