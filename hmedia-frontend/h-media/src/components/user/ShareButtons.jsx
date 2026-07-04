import { useState, useEffect, useRef } from "react";
import { Share2, Facebook, Instagram, Copy } from "lucide-react";

export default function ShareButtons({
  title,
  slug,
  category,
  image,
  description,
  date,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const wrapperRef = useRef(null);


  // changed today 3/26

  /* --------------------------------
     BUILD SHARE URL
  -------------------------------- */
  useEffect(() => {
    if (typeof window !== "undefined") {
      setUrl(`${window.location.origin}/${category}/${slug}`);
    }
  }, [slug, category]);


  //   useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     // Point share URL directly to the backend API domain
  //     setUrl(`https://hmedia-api.channelhmedia.in/${category}/${slug}`);
  //   }
  // }, [slug, category]);



  /* --------------------------------
     CLOSE ON OUTSIDE CLICK
  -------------------------------- */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* --------------------------------
     COPY LINK
  -------------------------------- */
  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed");
    }
  };

  /* --------------------------------
     SOCIAL SHARE LINKS
  -------------------------------- */
  const socialLinks = [
    {
      name: "Facebook",
      icon: <Facebook size={20} />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        url
      )}`,
      className: "hover:bg-blue-700",
    },
    {
      name: "WhatsApp",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          {" "}
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 2.01.491 3.97 1.438 5.724L.001 24l6.256-1.64C7.961 23.322 9.923 23.813 12 23.813c6.627 0 12-5.373 12-12zM12 21.813c-1.796 0-3.562-.484-5.133-1.41l-.367-.218-3.795 1.005 1.013-3.705-.24-.38C2.416 15.534 1.813 13.808 1.813 12c0-5.621 4.572-10.187 10.187-10.187 5.621 0 10.187 4.566 10.187 10.187 0 5.621-4.566 10.187-10.187 10.187zm5.573-7.63c-.305-.153-1.803-.891-2.082-.993-.279-.102-.483-.153-.686.153-.203.305-.787.993-.965 1.196-.178.203-.356.229-.66.076-.305-.153-1.286-.474-2.451-1.513-.916-.817-1.535-1.826-1.713-2.131-.178-.305-.019-.47.134-.622.139-.139.305-.356.457-.534.153-.178.203-.305.305-.509.102-.203.051-.381-.025-.559-.076-.178-.686-1.653-.94-2.263-.246-.593-.496-.512-.686-.521-.178-.008-.381-.008-.584-.008-.203 0-.534.076-.813.381-.279.305-1.067 1.043-1.067 2.543 0 1.5 1.093 2.95 1.245 3.153.153.203 2.15 3.283 5.209 4.605 2.079.898 2.893.898 3.935.843 1.143-.06 2.346-.958 2.676-1.882.33-.924.33-1.716.233-1.882-.097-.166-.356-.267-.66-.419z" />{" "}
        </svg>
      ),
      url: `https://wa.me/?text=${encodeURIComponent(
        `${title}\n\n${description || ""}\n\n${url}`
      )}`,
      className: "hover:bg-green-500",
    },
  ];

  return (
    <div className="relative" ref={wrapperRef}>
      {/* MAIN SHARE BUTTON */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center bg-brand-red text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-dark transition"
      >
        <Share2 size={18} className="mr-2" />
        Share
      </button>

      {/* DROPDOWN */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-3 bg-white border rounded-xl shadow-xl w-72 z-50 overflow-hidden">
          {/* PREVIEW IMAGE */}
          {image && (
            <img src={image} alt={title} className="w-full h-40 object-cover" />
          )}

          <div className="p-3">
            <h3 className="text-sm font-bold line-clamp-2">{title}</h3>

            {date && <p className="text-xs text-gray-500 mt-1">{date}</p>}

            {description && (
              <p className="text-xs text-gray-600 mt-2 line-clamp-3">
                {description}
              </p>
            )}

            {/* ACTION ICONS */}
            <div className="flex justify-end gap-2 mt-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Share on ${social.name}`}
                  className={`p-2 rounded-full bg-brand-dark text-white ${social.className}`}
                >
                  {social.icon}
                </a>
              ))}

              {/* COPY LINK */}
              <button
                onClick={copyToClipboard}
                title="Copy link"
                className="p-2 rounded-full bg-brand-dark text-white hover:bg-brand-red"
              >
                {copied ? (
                  <span className="text-xs px-1">Copied</span>
                ) : (
                  <Copy size={18} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
