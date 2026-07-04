import React from "react";
import { Facebook, Youtube, Instagram, X } from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <div>
      <footer className="bg-brand-dark text-gray-400 mt-16">
        <div className="container mx-auto px-4">
         

          {/* Copyright */}
          <div className=" border-gray-800 py-8 text-center text-xs text-gray-400 flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row gap-4 md:gap-10 items-center">
              {/* Social Icons */}
              <div className="flex items-center gap-6">
                {/* Facebook */}
                <Link
                  to="https://www.facebook.com/channelhmedia"
                  target="_blank"
                  aria-label="Facebook"
                  className="transition transform hover:scale-110"
                >
                  <Facebook
                    size={22}
                    className="text-white hover:text-[#1877F2] transition-colors"
                  />
                </Link>

                {/* Instagram */}
                <Link
                  to="https://www.instagram.com/channel_hmedia"
                  target="_blank"
                  aria-label="Instagram"
                  className="transition transform hover:scale-110"
                >
                  <Instagram
                    size={22}
                    className="text-white  transition duration-300 hover:text-[#E4405F]"
                  />
                </Link>

                {/* YouTube */}
                <Link
                  to="https://www.youtube.com/@ChannelHmediaOfficial"
                  target="_blank"
                  aria-label="YouTube"
                  className="transition transform hover:scale-110"
                >
                  <Youtube
                    size={22}
                    className="text-white hover:text-[#FF0000] transition-colors"
                  />
                </Link>
              </div>
              <div className="flex items-center">
                <span className="text-sm md:text-base text-white">
                  Contact Us :
                </span>
                <a
                  href="mailto:admin@channelhmedia.in"
                  className="ml-2 text-sm md:text-base text-brand-gold hover:underline"
                >
                  admin@channelhmedia.in
                </a>
              </div>
            </div>
            <div className="text-center lg:text-right">
              <p>
                © {new Date().getFullYear()}
                <span className="text-brand-gold"> CHANNEL HMEDIA</span>. All
                Rights Reserved.
              </p>
              <div className="mt-3 text-[11px] opacity-70 flex items-center justify-center lg:justify-end gap-1">
                Designed by
                <img
                  src="/copyright-logo.png"
                  alt="Company Name"
                  className="h-4 w-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Footer;
