import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Home, LayoutDashboard, LogOut, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

const Header = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
    navigate("/");
  };

  const handleHome = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  return (
    <header className="w-full bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleHome}
              className="mr-1 hover:bg-primary/10"
              aria-label="Go to home"
            >
              <Home className="h-5 w-5" />
            </Button>
            <img src={logo} alt="ThriveSpace Logo" className="w-8 h-8 sm:w-12 sm:h-12 object-contain" loading="lazy" />
            <div className="min-w-0">
              <h1 className="text-sm sm:text-xl font-bold text-foreground truncate">ThriveSpace</h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden xs:block">Your Partner in Growth & Healing</p>
            </div>
          </div>
          
          <nav className="hidden lg:flex items-center space-x-6">
            <Link to="/about" className="text-foreground hover:text-primary transition-colors font-medium">
              About
            </Link>
            <Link to="/team" className="text-foreground hover:text-primary transition-colors font-medium">
              Team
            </Link>
            <div className="relative group">
              <button className="text-foreground hover:text-primary transition-colors font-medium flex items-center gap-1">
                <span>Services</span>
                <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 w-64 bg-card border border-border rounded-xl shadow-glow opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 mt-2">
                <div className="py-2 max-h-96 overflow-y-auto">
                  <a href="/clinical-social-work" className="block px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                    Clinical Social Work
                  </a>
                  <a href="/community-social-work" className="block px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                    Community Social Work
                  </a>
                  <a href="/child-family-services" className="block px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                    Child & Family Services
                  </a>
                  <a href="/mental-health-counseling" className="block px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                    Mental Health Counseling
                  </a>
                  <a href="/crisis-intervention" className="block px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                    Crisis Intervention
                  </a>
                  <a href="/school-social-work" className="block px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                    School Social Work
                  </a>
                  <a href="/medical-social-work" className="block px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                    Medical Social Work
                  </a>
                  <a href="/substance-abuse-services" className="block px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                    Substance Abuse Services
                  </a>
                  <a href="/elder-care-services" className="block px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                    Elder Care Services
                  </a>
                  <a href="/policy-advocacy" className="block px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                    Policy & Advocacy
                  </a>
                </div>
              </div>
            </div>
            <Link to="/resources" className="text-foreground hover:text-primary transition-colors font-medium">
              Resources
            </Link>
            {user && (
              <Link to="/appointments" className="text-foreground hover:text-primary transition-colors font-medium">
                Appointments
              </Link>
            )}
            <Link to="/faqs" className="text-foreground hover:text-primary transition-colors font-medium">
              FAQs
            </Link>
            <Link to="/contact" className="text-foreground hover:text-primary transition-colors font-medium">
              Contact
            </Link>
          </nav>
          
          <div className="flex items-center space-x-2">
            {user ? (
              <>
                <Button 
                  variant="gradient"
                  size="sm"
                  className="hidden sm:inline-flex"
                  asChild
                >
                  <Link to="/dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:inline-flex"
                  asChild
                >
                  <Link to="/contact">
                    Book Session
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="hidden md:inline-flex"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="gradient"
                  size="sm"
                  className="hidden sm:inline-flex"
                  asChild
                >
                  <Link to="/contact">
                    Get Started
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate("/login")}
                  className="hidden md:inline-flex"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </>
            )}
            
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                <nav className="flex flex-col space-y-4 mt-8">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Services</h3>
                    <div className="flex flex-col space-y-2 ml-4 max-h-64 overflow-y-auto">
                      <a href="/clinical-social-work" className="text-sm text-foreground hover:text-primary transition-colors">
                        Clinical Social Work
                      </a>
                      <a href="/community-social-work" className="text-sm text-foreground hover:text-primary transition-colors">
                        Community Social Work
                      </a>
                      <a href="/child-family-services" className="text-sm text-foreground hover:text-primary transition-colors">
                        Child & Family Services
                      </a>
                      <a href="/mental-health-counseling" className="text-sm text-foreground hover:text-primary transition-colors">
                        Mental Health Counseling
                      </a>
                      <a href="/crisis-intervention" className="text-sm text-foreground hover:text-primary transition-colors">
                        Crisis Intervention
                      </a>
                      <a href="/school-social-work" className="text-sm text-foreground hover:text-primary transition-colors">
                        School Social Work
                      </a>
                      <a href="/medical-social-work" className="text-sm text-foreground hover:text-primary transition-colors">
                        Medical Social Work
                      </a>
                      <a href="/substance-abuse-services" className="text-sm text-foreground hover:text-primary transition-colors">
                        Substance Abuse Services
                      </a>
                      <a href="/elder-care-services" className="text-sm text-foreground hover:text-primary transition-colors">
                        Elder Care Services
                      </a>
                      <a href="/policy-advocacy" className="text-sm text-foreground hover:text-primary transition-colors">
                        Policy & Advocacy
                      </a>
                    </div>
                  </div>
                  <Link to="/about" className="text-lg text-foreground hover:text-primary transition-colors">
                    About
                  </Link>
                  <Link to="/team" className="text-lg text-foreground hover:text-primary transition-colors">
                    Team
                  </Link>
                  <Link to="/resources" className="text-lg text-foreground hover:text-primary transition-colors">
                    Resources
                  </Link>
                  {user && (
                    <Link to="/appointments" className="text-lg text-foreground hover:text-primary transition-colors">
                      Appointments
                    </Link>
                  )}
                  <Link to="/faqs" className="text-lg text-foreground hover:text-primary transition-colors">
                    FAQs
                  </Link>
                  <Link to="/contact" className="text-lg text-foreground hover:text-primary transition-colors">
                    Contact
                  </Link>
                  {user ? (
                    <>
                      <Button className="bg-gradient-primary hover:opacity-90 mt-6" asChild>
                        <Link to="/dashboard">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </Button>
                      <Button variant="outline" className="mt-2" asChild>
                        <Link to="/contact">Book Consultation</Link>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleSignOut}
                        className="mt-2"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <Button
                      className="bg-gradient-primary hover:opacity-90 mt-6"
                      onClick={() => navigate("/login")}
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </Button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;