import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
export function HomePage() {


  const googleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <nav className="flex items-center justify-between p-4 border-b">
        <div className="text-xl font-bold">Logo</div>
        <div className="flex items-center gap-4">

    <Link to={"/login"}>
    <Button variant="ghost">Login</Button>
    </Link>
         
          
        
          <Link to="/signup">
          <Button>Sign Up</Button>
          </Link>
         
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-4xl font-bold mb-4">Welcome to Letter App</h1>
        <p className="text-muted-foreground mb-8">
          Create and save letters effortlessly. Sign up now to get started!
        </p>
        <Button className="flex items-center gap-2" onClick={googleLogin}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-5 w-5"
          >
            <path
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              fill="currentColor"
            />
          </svg>
          Sign Up with Google
        </Button>
      </section>

      {/* Footer */}
      <footer className="flex items-center justify-center gap-6 p-4 border-t text-sm text-muted-foreground">
        <a href="#" className="hover:text-primary">
          About
        </a>
        <a href="#" className="hover:text-primary">
          Contact
        </a>
        <a href="#" className="hover:text-primary">
          Privacy
        </a>
      </footer>
    </div>
  );
}
