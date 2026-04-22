import sys
import docx

def extract_headings(filename):
    doc = docx.Document(filename)
    for i, para in enumerate(doc.paragraphs):
        if para.style.name.startswith('Heading') or len(para.text.strip()) > 0 and len(para.text) < 100 and para.runs and para.runs[0].bold:
            print(f"[{i}] {para.style.name}: {para.text[:100]}")

if __name__ == "__main__":
    extract_headings(sys.argv[1])
