import React, { useMemo } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export function TextEditor({ content, setContent }) {
  
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link"], // Removed "image" from the toolbar
          ["clean"],
        ],
      },
    }),
    []
  );

  // Memoized formats array
  const formats = useMemo(
    () => [
      "header",
      "bold",
      "italic",
      "underline",
      "strike",
      "list",
      "bullet",
      "link", 
    ],
    []
  );

  return (
    <div className="h-[300px]">
      <ReactQuill
        theme="snow"
        value={content}
       onChange={setContent}
        modules={modules}
        formats={formats}
        placeholder="Start typing your letter..."
        style={{ height: "100%" }}
      />
    </div>
  );
}