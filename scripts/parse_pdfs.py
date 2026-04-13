"""
PDF-to-Markdown converter for the Greek Legislation Wiki.

Uses the docling library to convert PDF files from raw/ into markdown
files in raw/parsed/. The LLM then ingests from raw/parsed/.

Usage:
    python scripts/parse_pdfs.py                      # Convert all new PDFs in raw/
    python scripts/parse_pdfs.py raw/some-file.pdf     # Convert a specific file
    python scripts/parse_pdfs.py --force               # Re-convert all, even if already parsed
    python scripts/parse_pdfs.py --ocr                 # Enable OCR (for scanned documents)
"""

import argparse
import sys
from pathlib import Path

from docling.document_converter import DocumentConverter, PdfFormatOption
from docling.datamodel.base_models import InputFormat
from docling.datamodel.pipeline_options import PdfPipelineOptions


# Paths relative to project root
PROJECT_ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = PROJECT_ROOT / "raw"
PARSED_DIR = RAW_DIR / "parsed"
ASSETS_DIR = RAW_DIR / "assets"


def create_converter(ocr: bool = False) -> DocumentConverter:
    """Create a DocumentConverter configured for Greek legislation PDFs."""
    pipeline_options = PdfPipelineOptions(do_ocr=ocr)

    converter = DocumentConverter(
        allowed_formats=[InputFormat.PDF],
        format_options={
            InputFormat.PDF: PdfFormatOption(pipeline_options=pipeline_options),
        },
    )
    return converter


def convert_pdf(converter: DocumentConverter, pdf_path: Path) -> Path:
    """Convert a single PDF to markdown. Returns the output path."""
    output_path = PARSED_DIR / f"{pdf_path.stem}.md"

    result = converter.convert(str(pdf_path))
    markdown = result.document.export_to_markdown()

    output_path.write_text(markdown, encoding="utf-8")
    return output_path


def main():
    parser = argparse.ArgumentParser(
        description="Convert legislation PDFs to markdown using docling."
    )
    parser.add_argument(
        "file",
        nargs="?",
        help="Specific PDF file to convert (default: all PDFs in raw/)",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Re-convert even if markdown already exists",
    )
    parser.add_argument(
        "--ocr",
        action="store_true",
        help="Enable OCR (for scanned documents; off by default)",
    )
    args = parser.parse_args()

    # Ensure output directories exist
    PARSED_DIR.mkdir(parents=True, exist_ok=True)
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)

    # Collect PDFs to process
    if args.file:
        pdf_path = Path(args.file).resolve()
        if not pdf_path.exists():
            print(f"Error: file not found: {pdf_path}", file=sys.stderr)
            sys.exit(1)
        if pdf_path.suffix.lower() != ".pdf":
            print(f"Error: not a PDF file: {pdf_path}", file=sys.stderr)
            sys.exit(1)
        pdfs = [pdf_path]
    else:
        pdfs = sorted(RAW_DIR.glob("*.pdf"))
        if not pdfs:
            print("No PDF files found in raw/. Drop your PDFs there and try again.")
            sys.exit(0)

    # Create converter
    print(f"Initializing docling converter (OCR: {'on' if args.ocr else 'off'})...")
    converter = create_converter(ocr=args.ocr)

    converted = 0
    skipped = 0

    for pdf in pdfs:
        output_path = PARSED_DIR / f"{pdf.stem}.md"

        if output_path.exists() and not args.force:
            print(f"  skip: {pdf.name} (already parsed)")
            skipped += 1
            continue

        print(f"  converting: {pdf.name} ...", end=" ", flush=True)
        try:
            convert_pdf(converter, pdf)
            print("done")
            converted += 1
        except Exception as e:
            print(f"FAILED: {e}", file=sys.stderr)

    print(f"\nDone. Converted: {converted}, Skipped: {skipped}, Total: {len(pdfs)}")


if __name__ == "__main__":
    main()
