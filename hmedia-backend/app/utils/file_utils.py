import os
from app.config import BASE_DIR
# import base64           
# from uuid import uuid4  
# from bs4 import BeautifulSoup  

def delete_static_image(image_path: str):
    """
    image_path examples:
    - static/more_news_images/168681[1].png
    - more_news_images/168681[1].png
    """

    if not image_path:
        return

    # Normalize path
    safe_path = os.path.normpath(image_path)

    # Remove leading "static/" if present
    if safe_path.startswith("static" + os.sep):
        safe_path = safe_path.replace("static" + os.sep, "", 1)

    # Final absolute path
    full_path = os.path.join(BASE_DIR, "static", safe_path)

    if os.path.exists(full_path) and os.path.isfile(full_path):
        os.remove(full_path)





# def process_quill_content(content_html, upload_folder="uploads/"):
#     os.makedirs(upload_folder, exist_ok=True)
#     soup = BeautifulSoup(content_html, "html.parser")
#     # saved_images = []

#     # Find all <img> tags
#     for img in soup.find_all("img"):
#         src = img.get("src", "")
#         if src.startswith("data:image"):
#             # Extract extension and base64 data
#             header, base64_data = src.split(",", 1)
#             ext = header.split("/")[1].split(";")[0]  # png, jpg, webp, etc.
#             filename = f"{uuid4().hex}.{ext}"
#             filepath = os.path.join(upload_folder, filename)

#             # Save image to file
#             with open(filepath, "wb") as f:
#                 f.write(base64.b64decode(base64_data))

#             # saved_images.append(filepath)

#            # ✅ Replace the src with file path instead of placeholder
#             img['src'] = f"/{filepath.replace(os.sep, '/')}"  # use / for web paths

#     # The cleaned content (without images or with placeholders)
#     # cleaned_content = str(soup)
#     # return cleaned_content, saved_images 

#     return str(soup)   



