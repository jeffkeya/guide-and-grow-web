import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import ServicesOverview from "./pages/ServicesOverview";
import Team from "./pages/Team";
import Resources from "./pages/Resources";
import FAQs from "./pages/FAQs";
import Contact from "./pages/Contact";
import Appointments from "./pages/Appointments";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ClinicalSocialWork from "./pages/ClinicalSocialWork";
import CommunitySocialWork from "./pages/CommunitySocialWork";
import ChildFamilyServices from "./pages/ChildFamilyServices";
import MentalHealthCounseling from "./pages/MentalHealthCounseling";
import CrisisIntervention from "./pages/CrisisIntervention";
import SchoolSocialWork from "./pages/SchoolSocialWork";
import MedicalSocialWork from "./pages/MedicalSocialWork";
import SubstanceAbuseServices from "./pages/SubstanceAbuseServices";
import ElderCareServices from "./pages/ElderCareServices";
import PolicyAdvocacy from "./pages/PolicyAdvocacy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<ServicesOverview />} />
        <Route path="/team" element={<Team />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clinical-social-work" element={<ClinicalSocialWork />} />
        <Route path="/community-social-work" element={<CommunitySocialWork />} />
        <Route path="/child-family-services" element={<ChildFamilyServices />} />
        <Route path="/mental-health-counseling" element={<MentalHealthCounseling />} />
        <Route path="/crisis-intervention" element={<CrisisIntervention />} />
        <Route path="/school-social-work" element={<SchoolSocialWork />} />
        <Route path="/medical-social-work" element={<MedicalSocialWork />} />
        <Route path="/substance-abuse-services" element={<SubstanceAbuseServices />} />
        <Route path="/elder-care-services" element={<ElderCareServices />} />
        <Route path="/policy-advocacy" element={<PolicyAdvocacy />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
