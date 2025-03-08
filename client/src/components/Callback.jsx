import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      localStorage.setItem("token", token);

      navigate("/dashboard");
    } else {
      console.error("No token received");
      navigate("/login");
    }
  }, [navigate]);

  return <div>Loading...</div>; // Show a loading message while processing
};

export default CallbackPage;
