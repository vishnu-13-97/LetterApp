import { Route, Routes} from "react-router-dom";
import "./App.css";

import { HomePage } from "./components/Authentication/Home";
import { LoginForm } from "./components/Authentication/Login";
import { SignupForm } from "./components/Authentication/SignUp";
import { Dashboard } from "./components/Dashboard/Dashboard";
import { Letters } from "./components/Dashboard/Letters";
import { TextEditor } from "./components/Dashboard/TextEditor";
import { Drive } from "./components/Dashboard/Drive";



function App() {



  return (
 
    
 <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/signup" element={<SignupForm />} />

      {/* Dashboard with Nested Routes */}
      <Route path="/dashboard" element={<Dashboard />}>
        <Route index element={<TextEditor />} /> {/* Default child component */}
        <Route path="letters" element={<Letters />} />
        <Route path="drive" element={<Drive />} />
        <Route path="textEditor/:id?" element={<TextEditor />} />
      </Route>
    </Routes>


  );
}

export default App;
