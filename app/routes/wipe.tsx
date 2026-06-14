import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

export const links = () => [
  {
    rel: "icon",
    type: "image/png",
    href: "/favicon_io_re/favicon-16x16.png",
  },
];

const WipeApp = () => {
  const { auth, isLoading, error, clearError, fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [files, setFiles] = useState<FSItem[]>([]);

  const loadFiles = async () => {
    const files = (await fs.readDir("./")) as FSItem[];
    console.log("wipe: loaded files:", files);
    setFiles(files);
  };

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate("/auth?next=/wipe");
    }
  }, [isLoading, auth.isAuthenticated, navigate]);

  const handleDelete = async () => {
    try {
      console.log(
        "wipe: deleting files",
        files.map((f) => f.path),
      );
      if (files.length > 0) {
        const results = await Promise.all(
          files.map(async (file) => {
            try {
              const r = await fs.delete(file.path);
              return { path: file.path, ok: true, result: r };
            } catch (e) {
              return { path: file.path, ok: false, error: e };
            }
          }),
        );
        console.log("wipe: delete results", results);
      }
      const flushed = await kv.flush();
      console.log("wipe: kv.flush result", flushed);
      await loadFiles();
    } catch (err) {
      console.error("Wipe failed", err);
      alert("Failed to wipe files. See console for details.");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error {String(error)}</div>;
  }

  return (
    <div>
      Authenticated as: {auth.user?.username}
      <div>Existing files:</div>
      <div className="flex flex-col gap-4">
        {files.map((file) => (
          <div key={file.id} className="flex flex-row gap-4">
            <p>{file.name}</p>
          </div>
        ))}
      </div>
      <div>
        <button
          className="bg-blue-500 text-white px-4 rounded-md"
          onClick={() => handleDelete()}
        >
          Wipe App Data
        </button>
      </div>
    </div>
  );
};

export default WipeApp;
