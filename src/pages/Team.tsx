import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Mail, Linkedin, Award, GraduationCap, Heart } from "lucide-react";


const Team = () => {
  const founder = {
    name: "Japheth Billy",
    role: "Founder & Social Work Professional",
    credentials: "Bachelor of Arts in Sociology & Social Work (Maasai Mara University)",
    image: "/founder.jpg",
    bio: "Japheth Billy is a dedicated social work professional based in Narok County, Kenya. A graduate of Maasai Mara University with a Bachelor of Arts in Sociology and Social Work, Japheth brings comprehensive expertise in community development, counseling, and social welfare. With strong analytical abilities and excellent interpersonal skills, Japheth founded ThriveSpace to provide accessible mental health and social work services that address the unique needs of individuals and communities. Passionate about advocacy and client-centered care, Japheth is committed to creating positive change through professional, compassionate support.",
    specializations: [
      "Community Development",
      "Counseling & Guidance",
      "Social Welfare Services",
      "Advocacy & Client Support"
    ],
    email: "billyjapheth85@gmail.com",
    linkedin: "#"
  };

  const teamMembers = [
    {
      name: "Dr. Sarah Kamau",
      role: "Clinical Psychologist",
      credentials: "PhD, Clinical Psychology",
      image: "/placeholder.svg",
      bio: "Dr. Kamau specializes in cognitive behavioral therapy and anxiety disorders. With 8 years of experience, she helps clients develop practical strategies for managing anxiety, depression, and stress.",
      specializations: ["Anxiety Disorders", "CBT", "Stress Management", "Depression Treatment"],
      email: "sarah@thrivespace.com"
    },
    {
      name: "Michael Omondi",
      role: "Child & Family Therapist",
      credentials: "MA, LMFT",
      image: "/placeholder.svg",
      bio: "Michael brings warmth and expertise to working with children and families. His play therapy and family systems approach helps families build stronger connections and resolve conflicts.",
      specializations: ["Child Therapy", "Play Therapy", "Family Counseling", "Parenting Support"],
      email: "michael@thrivespace.com"
    },
    {
      name: "Grace Wanjiru",
      role: "Substance Abuse Counselor",
      credentials: "MSW, CADC",
      image: "/placeholder.svg",
      bio: "Grace is a certified addiction counselor with a passion for helping individuals and families affected by substance use. Her evidence-based, compassionate approach supports lasting recovery.",
      specializations: ["Addiction Treatment", "Recovery Support", "Family Education", "Relapse Prevention"],
      email: "grace@thrivespace.com"
    },
    {
      name: "James Kipchoge",
      role: "Community Social Worker",
      credentials: "BSW, Community Development Specialist",
      image: "/placeholder.svg",
      bio: "James leads our community outreach initiatives, connecting individuals with vital resources and advocating for systemic change. His grassroots approach empowers communities to thrive.",
      specializations: ["Community Organizing", "Resource Navigation", "Social Advocacy", "Program Development"],
      email: "james@thrivespace.com"
    },
    {
      name: "Dr. Amina Hassan",
      role: "Geriatric Social Worker",
      credentials: "PhD, Gerontology",
      image: "/placeholder.svg",
      bio: "Dr. Hassan specializes in elder care and supports older adults and their families through aging transitions, chronic illness, and end-of-life planning with dignity and compassion.",
      specializations: ["Elder Care", "Dementia Support", "Caregiver Counseling", "End-of-Life Planning"],
      email: "amina@thrivespace.com"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Meet Our Team - ThriveSpace Professional Therapists & Social Workers</title>
        <meta name="description" content="Meet the compassionate professionals at ThriveSpace. Our licensed therapists and social workers bring diverse expertise to support your mental health journey." />
        <meta property="og:title" content="Our Professional Team - ThriveSpace" />
        <meta property="og:description" content="Expert mental health professionals dedicated to your wellbeing" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
                Meet Our Professional Team
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Compassionate, licensed professionals dedicated to supporting your mental health and wellbeing
              </p>
            </div>
          </div>
        </section>

        {/* Founder Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12 animate-fade-in">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                  Our Founder
                </h2>
              </div>

              <Card className="border-0 shadow-elegant hover-lift overflow-hidden animate-fade-in">
                <div className="grid md:grid-cols-5 gap-8">
                  <div className="md:col-span-2 bg-gradient-to-br from-primary/10 to-secondary/10 p-8 flex flex-col items-center justify-center">
                    <div className="w-48 h-48 rounded-full bg-primary/20 mb-6 flex items-center justify-center relative overflow-hidden">
                    
                      <img className="absolute inset-0 w-full h-full rounded-full object-cover" src={founder.image} alt={founder.name} />
                    </div>
                    <h3 className="text-2xl font-bold text-center mb-2">{founder.name}</h3>
                    <p className="text-primary font-semibold mb-1">{founder.role}</p>
                    <p className="text-sm text-muted-foreground mb-4">{founder.credentials}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="gap-2">
                        <Mail className="h-4 w-4" />
                        Contact
                      </Button>
                      <Button size="sm" variant="outline" className="gap-2">
                        <Linkedin className="h-4 w-4" />
                        Connect
                      </Button>
                    </div>
                  </div>
                  
                  <CardContent className="md:col-span-3 p-8">
                    <div className="space-y-6">
                      <p className="text-muted-foreground leading-relaxed">
                        {founder.bio}
                      </p>
                      
                      <div>
                        <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <Award className="h-5 w-5 text-primary" />
                          Specializations
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {founder.specializations.map((spec, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                              {spec}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground italic">
                          "My mission is to create accessible, culturally-sensitive mental health services that empower individuals and communities to thrive."
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Team Members Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                Our Professional Team
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Each team member brings unique expertise and a shared commitment to your wellbeing
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {teamMembers.map((member, index) => (
                <Card key={index} className="border-0 shadow-card hover-lift group animate-fade-in h-full flex flex-col">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="text-center mb-4">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 mx-auto mb-4 flex items-center justify-center">
                        <GraduationCap className="h-16 w-16 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                        {member.name}
                      </h3>
                      <p className="text-primary font-semibold text-sm mb-1">{member.role}</p>
                      <p className="text-xs text-muted-foreground">{member.credentials}</p>
                    </div>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                      {member.bio}
                    </p>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Specializations:</h4>
                        <div className="flex flex-wrap gap-1">
                          {member.specializations.map((spec, idx) => (
                            <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <Button size="sm" variant="outline" className="w-full gap-2 group-hover:text-primary">
                        <Mail className="h-4 w-4" />
                        Contact {member.name.split(' ')[0]}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Join Our Team CTA */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <Card className="max-w-4xl mx-auto border-0 shadow-elegant bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 animate-fade-in">
              <CardContent className="p-8 md:p-12 text-center">
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                  Join Our Team
                </h2>
                <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Are you a passionate mental health professional? We're always looking for compassionate, skilled therapists and social workers to join ThriveSpace.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="hover-lift">
                    <Link to="/contact">Send Your Application</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="hover-lift">
                    <Link to="/about">Learn About ThriveSpace</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Footer />
        <BackToTop />
      </div>
    </>
  );
};

export default Team;