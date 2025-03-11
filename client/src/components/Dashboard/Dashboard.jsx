import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import { TextEditor } from "./TextEditor";
import { UserContext } from "../userContext";

export function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation(); // Get current route
  const [user, setUser] = useState(null);
  const [content, setContent] = useState(" "); // State to store the editor content
  


  useEffect(() => {
    const token = localStorage.getItem("token");

  
    if (!token) {
      console.error("No token found! Redirecting...");
      navigate("/login");
      return;
    }
  
    const fetchUser = async () => {
      try {
        const response = await fetch("https://letterapp-0uug.onrender.com/api/users/dashboard", {
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
  
        if (!response.ok) {
          throw new Error(`Failed to fetch user: ${response.status}`);
        }
  
        const data = await response.json();
        
  
        if (data.user) {
          setUser({
            id: data.user._id,
            name: data.user.name,
            email: data.user.email,
          });
        } else {
          console.error("User object not found in response:", data);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
  
    fetchUser();
  }, []);
  
  
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };



  const handleSaveDraft = async () => {
    if (!user) {
      alert("You must be logged in to save a draft.");
      return;
    }
  
    const strippedContent = content.replace(/<(.|\n)*?>/g, "").trim();
    if (!strippedContent) {
      alert("Cannot save an empty draft.");
      return;
    }
  
    try {
      const token = localStorage.getItem("token"); // Retrieve token from localStorage
  
      if (!token) {
        alert("Session expired. Please log in again.");
        return;
      }
  
      const response = await fetch("https://letterapp-0uug.onrender.com/api/drafts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Include the token
        },
        credentials: "include",
        body: JSON.stringify({
          userId: user.id,
          content: content,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Failed to save draft");
      }
  
      alert("Draft saved successfully!");
      setContent("");
      navigate("/dashboard/letters");
    } catch (error) {
      console.error("Error saving draft:", error);
      alert(error.message);
    }
  };
  

  return (
    <UserContext.Provider value={user}>
      <div className="flex flex-col min-h-screen bg-background">
        {/* Top Navigation Bar */}
        <nav className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-6">
            <div className="text-xl font-bold">Logo</div>

            <Link to="/dashboard">
              <Button variant="ghost">
                {user ? user.name : "Loading..."}
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleLogout}>
              Log Out
            </Button>
            <div className="h-8 w-8 rounded-full bg-muted"></div>
          </div>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 p-4 border-b">
          <Link to="/dashboard/textEditor">
            <Button variant="default">New Letter</Button>
          </Link>
          <Link to="/dashboard/letters">
            <Button variant="secondary">Saved Letters</Button>
          </Link>
          <Link to="/dashboard/drive">
          <Button variant="secondary" >Google Drive</Button>
          </Link>
        </div>

        {/* Nested Route Content */}
        <div className="flex-1 p-4">
          {/* Only show the TextEditor when the route is /dashboard/textEditor */}
          {location.pathname === "/dashboard/textEditor" ? (
            <TextEditor content={content} setContent={setContent} />
          ) : (
            <Outlet  />
          )}
        </div>

        {/* Bottom Action Buttons */}
        {(location.pathname === "/dashboard/textEditor" || location.pathname === "/dashboard") && (
  <div className="flex items-center gap-4 p-4 border-t">
    <Button variant="secondary" onClick={handleSaveDraft}>
      Save Draft
    </Button>
    <Button variant="default">Save to Google Drive</Button>
  </div>
)}

      </div>
    </UserContext.Provider>
  );
}
