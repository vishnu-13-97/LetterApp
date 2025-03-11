import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "../userContext";

export function Drive() {
  const user = useUser();
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);

  // Debounced Search for Performance Optimization
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300); // 300ms delay to prevent unnecessary re-renders
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch Files from API
  useEffect(() => {
    if (!user?.id) {
      setError("Session Timed Out. Please log in.");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found. Please log in.");
      setLoading(false);
      return;
    }

    const fetchFiles = async () => {
      try {
        const response = await fetch("https://letterapp-0uug.onrender.com/api/drive/list", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          localStorage.removeItem("token");
          setError("Session expired. Please log in again.");
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch files");
        }

        const data = await response.json();
        setFiles(data);
      } catch (error) {
        console.error("Error fetching files:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [user?.id]);

  // Delete File
  const handleDelete = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    setDeleting(fileId); // Track deletion state

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`https://letterapp-0uug.onrender.com/api/drive/delete/${fileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete file");
      }

      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
    } catch (error) {
      console.error("Error deleting file:", error);
      setError("Failed to delete file");
    } finally {
      setDeleting(null);
    }
  };

  // Filter files based on search input
  const filteredFiles = useMemo(
    () =>
      files.filter((file) =>
        file.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      ),
    [files, debouncedSearch]
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="p-4 border-b">
        <Input
          placeholder="Search files..."
          className="w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex-1 p-4">
        {loading ? (
          // Skeleton Loader for better UX
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : filteredFiles.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-4 bg-muted/50 p-2 font-medium">
              <div>Title</div>
              <div>Date Created</div>
              <div>Size</div>
              <div>Actions</div>
            </div>
            {/* File List */}
            <div className="divide-y">
              {filteredFiles.map((file) => (
                <div key={file.id} className="grid grid-cols-4 p-2">
                  <div>{file.name}</div>
                  <div>{new Date(file.createdTime).toLocaleDateString()}</div>
                  <div>{file.size ? (file.size / 1024).toFixed(2) + " KB" : "—"}</div>
                  <div className="flex gap-2">
                    <a
                      href={file.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </a>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={deleting === file.id}
                      onClick={() => handleDelete(file.id)}
                    >
                      {deleting === file.id ? <span className="animate-spin">⏳</span> : "Delete"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">No files found.</p>
        )}
      </div>
    </div>
  );
}
