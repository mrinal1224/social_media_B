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

  // Handle Like/Unlike with Optimistic UI updates
  const handleToggleLike = async (itemId, type) => {
    if (type !== "post") return; // Extend to reels when reel like endpoint is ready

    // Save previous state for rollback on error
    const previousItems = [...feedItems];

    setFeedItems((prevItems) =>
      prevItems.map((item) => {
        if (item._id === itemId) {
          const likesArray = item.likes || [];
          const isLiked = likesArray.includes(user?._id);
          const updatedLikes = isLiked
            ? likesArray.filter((id) => id !== user?._id)
            : [...likesArray, user?._id];

          return { ...item, likes: updatedLikes };
        }
        return item;
      })
    );

    try {
      const response = await axiosInstance.post(`/post/like/${itemId}`);
      const { likes } = response.data;

      console.log(response)

      // Sync backend like array length
      setFeedItems((prevItems) =>
        prevItems.map((item) => {
          if (item._id === itemId) {
            return {
              ...item,
              likesCount: likes,
            };
          }
          return item;
        })
      );
    } catch (error) {
      console.error("Error toggling like:", error);
      setFeedItems(previousItems); // Rollback on API error
    }
  };

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
      alert(`Please provide a caption or select an ${contentType === "post" ? "image" : "video"}.`);
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("caption", caption);

      if (selectedFile) {
        const fieldName = contentType === "post" ? "image" : "file";
        formData.append(fieldName, selectedFile);
      }

      const endpoint = contentType === "post" ? "/post/createPost" : "/reel/create";

      const response = await axiosInstance.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newItem = response.data.post || response.data.reel;
      const createdType = contentType;

      setFeedItems((prev) => [{ ...newItem, type: createdType, likes: newItem.likes || [] }, ...prev]);

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
            {selectedFile && <p className="mt-2 text-xs text-slate-500">Selected: {selectedFile.name}</p>}
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
              feedItems.map((item) => {
                const isLiked = item.likes?.includes(user?._id);
                const likesCount = item.likesCount ?? item.likes?.length ?? 0;

                return (
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
                      item.image && <img src={item.image} alt="Post content" className="w-full max-h-[520px] object-cover" />
                    ) : (
                      item.video && <video src={item.video} controls className="w-full max-h-[520px] object-cover bg-black" />
                    )}

                    <div className="px-5 pb-5 pt-4">
                      {item.caption && <p className="text-sm text-slate-700 mb-3">{item.caption}</p>}
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>{likesCount} {likesCount === 1 ? "like" : "likes"}</span>
                        <span>0 comments</span>
                      </div>
                      <div className="mt-4 flex border-t border-slate-100 pt-3">
                        <button
                          onClick={() => handleToggleLike(item._id, item.type)}
                          className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
                            isLiked
                              ? "text-rose-600 bg-rose-50"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {isLiked ? "♥ Liked" : "♡ Like"}
                        </button>
                        <button className="flex-1 rounded-xl py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">◌ Comment</button>
                        <button className="flex-1 rounded-xl py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">↗ Share</button>
                      </div>
                    </div>
                  </article>
                );
              })
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
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default Home;