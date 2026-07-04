import Quill from "quill";

const BlockEmbed = Quill.import("blots/block/embed");

class VideoBlot extends BlockEmbed {
  static blotName = "video";
  static tagName = "div"; // wrapper div
  static className = "ql-video-wrapper";

  static create(value) {
    const node = super.create();

    // Wrapper styles
    node.style.position = "relative";
    node.style.width = "100%";
    node.style.display = "flex";
    node.style.justifyContent = "center";

    // iframe
    const iframe = document.createElement("iframe");
    iframe.setAttribute("src", value);
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("allowfullscreen", true);
    iframe.setAttribute(
      "allow",
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    );

    // Responsive video styles
    iframe.style.width = "80%";
    iframe.style.maxWidth = "560px";
    iframe.style.height = "auto"; 
    iframe.style.aspectRatio = "16/9";
    iframe.style.display = "block";

    // remove button
    const removeBtn = document.createElement("span");
    removeBtn.innerHTML = "✖";
    removeBtn.className = "ql-video-remove";

    // position button on top-right of iframe (responsive)
    removeBtn.style.position = "absolute";
    removeBtn.style.top = "5px";
    removeBtn.style.right = "calc(10%)"; 
    removeBtn.style.cursor = "pointer";
    removeBtn.style.fontSize = "14px";
    removeBtn.style.color = "#fff";
    removeBtn.style.background = "red";
    removeBtn.style.borderRadius = "50%";
    removeBtn.style.padding = "2px 6px";
    removeBtn.style.zIndex = "10";

    removeBtn.onclick = () => node.remove();

    node.appendChild(removeBtn);
    node.appendChild(iframe);

    return node;
  }

  static value(node) {
    const iframe = node.querySelector("iframe");
    return iframe ? iframe.getAttribute("src") : "";
  }
}

Quill.register(VideoBlot);
