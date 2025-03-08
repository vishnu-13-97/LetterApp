import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "../userContext";
import { TextEditor } from "./TextEditor"; // Import the TextEditor component

export function Letters() {
  const user = useUser();
  const [drafts, setDrafts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingDraft, setEditingDraft] = useState(null); // State to track the draft being edited
  const [editedContent, setEditedContent] = useState(""); // State to track edited content


  useEffect(() => {
    if (!user?.id) {
      setError("Session Time Out. Please log in.");
      setLoading(false);
      return;
    }
  
    
  
    const fetchDrafts = async () => {
      try {
        const token = localStorage.getItem("token"); // Get token from localStorage or state
        if (!token) {
          throw new Error("Authentication token not found. Please log in.");
        }
  
        const response = await fetch(`/api/drafts/${user?.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Send token in Authorization header
          },
        });
  
        const data = await response.json();
  
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch drafts");
        }
  
        if (!Array.isArray(data)) {
          throw new Error("Invalid data format: expected an array");
        }
  
        setDrafts(data);
      } catch (error) {
        console.error("Error fetching drafts:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchDrafts();
  }, [user?.id]);
  
  const handleDelete = async (draftId) => {
    if (!window.confirm("Are you sure you want to delete this draft?")) return;
  
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Session expired. Please log in again.");
        return;
      }
  
      const response = await fetch(`/api/drafts/${draftId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`, // ✅ Include JWT token
        },
        credentials: "include",
      });
  
      if (!response.ok) {
        throw new Error("Failed to delete draft");
      }
  
      setDrafts(drafts.filter((draft) => draft._id !== draftId));
    } catch (error) {
      console.error("Error deleting draft:", error);
      setError("Failed to delete draft");
    }
  };
  
  const handleEdit = (draft) => {
    setEditingDraft(draft); // Set the draft to be edited
    setEditedContent(draft.content); // Initialize the edited content with the draft's content
  };
  
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Session expired. Please log in again.");
        return;
      }
  
      const response = await fetch(`/api/drafts/${editingDraft._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Include JWT token
        },
        credentials: "include",
        body: JSON.stringify({ content: editedContent }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to save draft");
      }
  
      // Update the drafts list with the edited draft
      setDrafts((prevDrafts) =>
        prevDrafts.map((draft) =>
          draft._id === editingDraft._id ? { ...draft, content: editedContent } : draft
        )
      );
  
      setEditingDraft(null); // Exit edit mode
    } catch (error) {
      console.error("Error saving draft:", error);
      setError("Failed to save draft");
    }
  };
  
  const handleCancel = () => {
    setEditingDraft(null); // Exit edit mode without saving
  };
  
  const filteredDrafts = drafts.filter((draft) =>
    draft.content.toLowerCase().includes(search.toLowerCase())
  );
  
  const stripHtml = (html) => {
    return html.replace(/<\/?[^>]+(>|$)/g, ""); // Removes all HTML tags
  };
  
  if (editingDraft) {
    return (
      <div className="p-4 ">
        <TextEditor
          content={editedContent}
          setContent={setEditedContent} // Pass the edited content state
        />
        <div className="mt-12 flex gap-2">
          <Button onClick={handleSave}>Save</Button>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="p-4 border-b">
        <Input
          placeholder="Search letters..."
          className="w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex-1 p-4">
        {loading ? (
          <p className="text-center text-gray-500">Loading drafts...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : filteredDrafts.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-3 bg-muted/50 p-2 font-medium">
              <div>Title</div>
              <div>Date Created</div>
              <div>Actions</div>
            </div>
            <div className="divide-y">
              {filteredDrafts.map((draft) => (
                <div key={draft._id} className="grid grid-cols-3 p-2">
                  <div>{stripHtml(draft.content).substring(0, 30)}...</div>
                  <div>{new Date(draft.createdAt).toLocaleDateString()}</div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(draft)} // Handle edit click
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(draft._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">No drafts found.</p>
        )}
      </div>
    </div>
  );
}