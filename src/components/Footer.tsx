import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-secondary text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <span className="font-bold text-lg">BASIS Cedar Park</span>
                <p className="text-primary text-xs font-medium">NJHS</p>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Honoring scholarship, service, leadership, character, and citizenship since 1929.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-white/70 text-sm">
              <li><Link to="/about" className="hover:text-primary transition-colors">About</Link></li>
              <li><Link to="/members" className="hover:text-primary transition-colors">Membership</Link></li>
              <li><Link to="/calendar" className="hover:text-primary transition-colors">Calendar</Link></li>
              <li><Link to="/newsletter" className="hover:text-primary transition-colors">Newsletter</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold mb-4">Contact</h3>
            <p className="text-white/70 text-sm">
              BASIS Cedar Park<br />
              Cedar Park, Texas
            </p>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/50 text-sm">
          <p>© {new Date().getFullYear()} BASIS Cedar Park NJHS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;