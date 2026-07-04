import React, { useState, useEffect, useMemo, useRef } from "react";
import DatePicker from "react-datepicker";
import { UploadCloud, X } from "lucide-react";
import ReactQuill from "react-quill-new";
import "../../videoBlot";

import "react-quill-new/dist/quill.snow.css";
import "react-datepicker/dist/react-datepicker.css";

const formatSlug = (value) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
};

function AddArticle({
  heading,
  initialData = null,
  onSubmit,
  buttonText = "Submit",
  serverError,
}) {
  const quillRef = useRef(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [author, setAuthor] = useState("");
  const [publishedDate, setPublishedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trending, setTrending] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  const handleQuillImage = () => {
    const input = document.createElement("input");
    input.type = "file";

    // allow ALL image formats
    input.accept = "image/*,.jpg,.jpeg,.png,.gif,.webp,.svg,.bmp,.avif";

    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be under 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, "image", reader.result);
      };
      reader.readAsDataURL(file);
    };
  };

  const handleAddTag = (value) => {
    const tag = String(value || "").trim();
    if (!tag) return;
    if (tags.includes(tag)) return;
    if (tags.length >= 10) return;
    setTags((t) => [...t, tag]);
    setTagInput("");
  };

  const handleRemoveTag = (index) => {
    setTags((t) => t.filter((_, i) => i !== index));
  };

  const handleEditTag = (index) => {
    setTagInput(tags[index]);
    setTags((t) => t.filter((_, i) => i !== index));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag(tagInput);
    } else if (e.key === "Backspace" && !tagInput) {
      setTags((t) => t.slice(0, -1));
    }
  };
  

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ font: [] }],
          [{ size: ["small", false, "large", "huge"] }],
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ script: "sub" }, { script: "super" }],
          ["blockquote", "code-block"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ indent: "-1" }, { indent: "+1" }],
          [{ direction: "rtl" }],
          [{ align: [] }],
          ["link", "image", "video"],
          ["clean"],
        ],
        handlers: {
          image: handleQuillImage, 
        },
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "script",
    "blockquote",
    "code-block",
    "list",
    "indent",
    "direction",
    "align",
    "link",
    "image",
    "video",
  ];

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setSlug(initialData.slug || "");
      setAuthor(initialData.author || "");
      setPublishedDate(initialData.publishedDate || "");
      setContent(initialData.content || "");
      if (initialData.imageUrl) setImagePreviewUrl(initialData.imageUrl);
      setImageFile(null);
      setTrending(Boolean(initialData.trending));

      let initTags = initialData.tags || [];
      if (typeof initTags === "string") {
        initTags = initTags.replace(/[\[\]"]/g, "").split(",");
      } else if (
        Array.isArray(initTags) &&
        initTags.length === 1 &&
        typeof initTags[0] === "string"
      ) {
        const tagStr = initTags[0];
        if (tagStr.includes(",") || tagStr.includes("[")) {
          initTags = tagStr.replace(/[\[\]"]/g, "").split(",");
        }
      }
      setTags(
        Array.isArray(initTags)
          ? initTags.map((t) => String(t).trim()).filter(Boolean)
          : []
      );
    } else {
      // Reset to default for a new article form
      setTitle("");
      setSlug("");
      setPublishedDate(new Date().toISOString().split("T")[0]);
      setTrending(false);
      setTags([]);
    }
  }, [initialData]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreviewUrl("");
  };

  const checkOrientation = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const { width, height } = img;
        if (width > height) resolve("landscape");
        else if (height > width) resolve("portrait");
        else resolve("square");
      };
    });
  };

  const compressImage = (file, maxSizeKB = 500) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const MAX_WIDTH = 1280;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.9;

        const compress = () => {
          canvas.toBlob(
            (blob) => {
              if (blob.size / 1024 <= maxSizeKB || quality <= 0.3) {
                resolve(blob);
              } else {
                quality -= 0.1;
                compress();
              }
            },
            "image/jpeg",
            quality
          );
        };

        if (
          file.type === "image/png" ||
          file.type === "image/jpg" ||
          file.type === "image/jpeg"
        ) {
          compress();
        } else {
          resolve(file);
        }
      };
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setErrors((prev) => ({ ...prev, image: undefined }));

    const orientation = await checkOrientation(file);
    if (orientation !== "landscape") {
      setErrors((prev) => ({
        ...prev,
        image: "Please upload a landscape image.",
      }));
      setImageFile(null);
      setImagePreviewUrl("");
      return;
    }

    const compressedBlob = await compressImage(file, 500);
    const compressedFile = new File([compressedBlob], file.name, {
      type: compressedBlob.type,
    });

    setImageFile(compressedFile);
    setImagePreviewUrl(URL.createObjectURL(compressedFile));
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!title.trim()) newErrors.title = "Title is required";
    if (!slug.trim()) newErrors.slug = "Slug is required";
    if (!author.trim()) newErrors.author = "Author is required";
    if (!publishedDate) newErrors.publishedDate = "Published date is required";
    if (!content || content.trim() === "" || content === "<p><br></p>")
      newErrors.content = "Content is required";
    if (!imageFile && !imagePreviewUrl) newErrors.image = "Image is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const articleData = {
      title,
      slug,
      content,
      author,
      date: new Date(publishedDate).toISOString(),
      imageFile,
      trending,
      tags,
      id: initialData?.id,
    };

    try {
      await onSubmit(articleData);
    } catch (err) {
      console.error("News submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm w-full mx-auto">
      <div className="p-4 sm:p-6 md:p-8 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">{heading}</h2>
      </div>

      <form onSubmit={handleSubmitForm} className="p-4 sm:p-6 md:p-8 space-y-6">
        {/* TITLE */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            className="mt-1 block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 focus:outline-none focus:ring-0 focus:border-brand-red rounded-lg"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Write Title"
          />
          {errors.title && (
            <p className="text-red-600 text-sm mt-2">{errors.title}</p>
          )}
        </div>

        {/* SLUG */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Slug
          </label>
          <input
            type="text"
            className="mt-1 block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 focus:outline-none focus:ring-0 focus:border-brand-red rounded-lg"
            value={slug}
            onChange={(e) => setSlug(formatSlug(e.target.value))}
            placeholder="Write Slug"
          />
          {errors.slug && (
            <p className="text-red-600 text-sm mt-2">{errors.slug}</p>
          )}
        </div>

        {/* CONTENT */}
        <div className="mb-12">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content
          </label>

          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            formats={formats}
            className="h-96"
            placeholder="Write your content here..."
          />

          {errors.content && (
            <p className="text-red-600 text-sm mt-14">{errors.content}</p>
          )}
        </div>

        {/* IMAGE */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mt-20">
            Image
          </label>

          {imagePreviewUrl ? (
            <div className="mt-2 relative w-full max-w-full sm:max-w-md rounded-lg overflow-hidden shadow-md">
              <img
                src={imagePreviewUrl}
                alt="Preview"
                className="w-full h-auto object-cover"
              />

              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="mt-2 flex justify-center px-4 sm:px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg w-full">
              <div className="space-y-1 text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 justify-center">
                  <label
                    htmlFor="image"
                    className="cursor-pointer bg-white font-medium text-brand-red hover:text-brand-dark"
                  >
                    <span>Upload a file</span>
                    <input
                      id="image"
                      type="file"
                      className="sr-only"
                      onChange={handleImageChange}
                      accept="image/*"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG</p>
              </div>
            </div>
          )}

          {errors.image && (
            <p className="text-red-600 text-sm mt-2">{errors.image}</p>
          )}
        </div>

        {/* AUTHOR + DATE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AUTHOR */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Author
            </label>
            <input
              type="text"
              className="mt-1 block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 focus:outline-none focus:ring-0 focus:border-brand-red rounded-lg"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Write Author"
            />
            {errors.author && (
              <p className="text-red-600 text-sm mt-2">{errors.author}</p>
            )}
          </div>

          {/* DATE */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Published Date
            </label>

            <DatePicker
              selected={publishedDate ? new Date(publishedDate) : null}
              onChange={(date) =>
                setPublishedDate(date ? date.toISOString().split("T")[0] : "")
              }
              dateFormat="yyyy-MM-dd"
              className="mt-1 block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 focus:outline-none focus:ring-0 focus:border-brand-red rounded-lg"
              wrapperClassName="w-full"
              placeholderText="Select a date"
            />

            {errors.publishedDate && (
              <p className="text-red-600 text-sm mt-2">
                {errors.publishedDate}
              </p>
            )}
          </div>
        </div>

        {/* TAGS */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tags{" "}
            <span className="text-xs text-gray-400">
              (press Enter or comma to add)
            </span>
          </label>
          <div className="mt-2">
            <div className="flex gap-2 flex-wrap">
              {tags.map((t, i) => (
                <span
                  key={t + i}
                  className="inline-flex items-center gap-2 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                >
                  <span
                    onClick={() => handleEditTag(i)}
                    className="cursor-pointer hover:text-brand-red"
                    title="Click to edit"
                  >
                    {t}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(i)}
                    className="ml-1 text-gray-500 hover:text-gray-800 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-brand-red"
                placeholder="Add a tag and press Enter"
                aria-label="Add tag"
              />
              <button
                type="button"
                onClick={() => handleAddTag(tagInput)}
                className="px-3 py-2 bg-brand-red hover:bg-brand-dark text-white rounded-lg cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* TRENDING TOGGLE */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Trending
          </label>
          <div className="mt-2 flex items-center">
            <button
              type="button"
              onClick={() => setTrending((s) => !s)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                trending ? "bg-brand-red" : "bg-gray-200"
              }`}
              aria-pressed={trending}
              aria-label="Toggle trending"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  trending ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="ml-3 text-sm text-gray-600">
              {trending ? "Yes" : "No"}
            </span>
          </div>
        </div>

        {/* SERVER ERROR */}
        {serverError && (
          <p className="mt-3 text-sm text-red-600 text-center">{serverError}</p>
        )}

        {/* SUBMIT BUTTON */}
        <div className="pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 sm:px-6 rounded-lg shadow-sm text-sm font-medium text-white bg-brand-red hover:bg-brand-dark transition cursor-pointer disabled:bg-brand-dark disabled:cursor-wait"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              buttonText
            )}
          </button>
        </div>
      </form>

      
    </div>
  );
}

export default AddArticle;
