import filetype
from PyPDF2 import PdfReader
from docx import Document
from io import BytesIO

async def extract_file_content(file):
    """
    Read + extract file contents differently based on file type.
    Always returns raw bytes for hashing/encryption.
    """

    raw_bytes = await file.read()

    # Detect file type using MIME
    content_type = file.content_type.lower()

    # TXT
    if content_type == "text/plain":
        text = raw_bytes.decode("utf-8", errors="ignore")
        print("Extracted TEXT:", text[:200])
        return (raw_bytes,text[:200])

    # PDF
    if content_type == "application/pdf":
        try:
            pdf = PdfReader(BytesIO(raw_bytes))
            text = ""
            for page in pdf.pages:
                text += page.extract_text() or ""
            print("Extracted PDF text:", text[:200])
        except:
            print("PDF extraction failed")
        return (raw_bytes,text[:200])

    # DOCX
    if content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        try:
            doc = Document(BytesIO(raw_bytes))
            text = "\n".join([p.text for p in doc.paragraphs])
            print("Extracted DOCX text:", text[:200])
        except:
            print("DOCX extraction failed")
        return (    raw_bytes,text[:200])

    # IMAGES
    if content_type.startswith("image/"):
        print("Image detected:", content_type)
        return (raw_bytes,None)

    # Fallback
    print("Unknown file type:", content_type)
    return  (raw_bytes,None)
