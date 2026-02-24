from fpdf import FPDF
import re

# ── Sanitize any character that isn't printable latin-1 ──────────────────────
def s(text):
    REPLACEMENTS = {
        '\u2019':"'", '\u2018':"'", '\u201c':'"', '\u201d':'"',
        '\u2014':'--', '\u2013':'-', '\u2192':'->', '\u2190':'<-',
        '\u2022':'*',  '\u2026':'...', '\u00b0':'',
        '\u2714':'[v]', '\u274c':'[x]', '\u2705':'[v]',
        '\u25b6':'>', '\u25c0':'<', '\u25bc':'v',
    }
    for k, v in REPLACEMENTS.items():
        text = text.replace(k, v)
    # Strip emoji (anything > U+00FF)
    text = ''.join(c if ord(c) < 256 else '' for c in text)
    return text.encode('latin-1', 'replace').decode('latin-1')

def clean(line):
    line = re.sub(r'\*\*(.+?)\*\*', r'\1', line)
    line = re.sub(r'\*(.+?)\*',     r'\1', line)
    line = re.sub(r'`(.+?)`',       r'\1', line)
    line = re.sub(r'\[(.+?)\]\(.*?\)', r'\1', line)
    return s(line.strip())


class PDF(FPDF):
    def header(self):
        self.set_fill_color(20, 50, 110)
        self.rect(0, 0, 210, 15, 'F')
        self.set_font('Helvetica', 'B', 11)
        self.set_text_color(255, 255, 255)
        self.set_y(3)
        self.cell(0, 9, 'Loan Prediction AI - Project Documentation', align='C', ln=True)
        self.set_text_color(0, 0, 0)
        self.set_y(20)

    def footer(self):
        self.set_y(-12)
        self.set_fill_color(20, 50, 110)
        self.rect(0, 285, 210, 12, 'F')
        self.set_font('Helvetica', '', 8)
        self.set_text_color(255, 255, 255)
        self.cell(0, 10, f'Page {self.page_no()}', align='C', ln=True)
        self.set_text_color(0, 0, 0)


pdf = PDF()
pdf.set_auto_page_break(auto=True, margin=20)
pdf.set_margins(15, 22, 15)
pdf.add_page()

PAGE_W = pdf.w - pdf.l_margin - pdf.r_margin  # usable width

with open('PROJECT_EXPLANATION.md', 'r', encoding='utf-8') as f:
    raw_lines = f.readlines()

in_code  = False
in_table = False
tbl_rows = []


def flush_table(pdf, rows):
    if not rows:
        return
    cols = len(rows[0])
    cw   = PAGE_W / cols
    for ri, row in enumerate(rows):
        # header row
        if ri == 0:
            pdf.set_fill_color(20, 50, 110)
            pdf.set_text_color(255, 255, 255)
            pdf.set_font('Helvetica', 'B', 7.5)
            fill = True
        elif ri % 2 == 1:
            pdf.set_fill_color(235, 241, 255)
            pdf.set_text_color(0, 0, 0)
            pdf.set_font('Helvetica', '', 7.5)
            fill = True
        else:
            pdf.set_fill_color(255, 255, 255)
            pdf.set_text_color(0, 0, 0)
            pdf.set_font('Helvetica', '', 7.5)
            fill = True
        for cell in row:
            txt = s(cell)[:45]
            pdf.cell(cw, 6, txt, border=1, fill=fill)
        pdf.ln()
    pdf.set_text_color(0, 0, 0)
    pdf.ln(3)


idx = 0
while idx < len(raw_lines):
    line = raw_lines[idx].rstrip('\n').rstrip('\r')

    # ── code block ─────────────────────────────────────────────────────────
    if line.startswith('```'):
        in_code = not in_code
        if in_code:
            pdf.ln(2)
        else:
            pdf.ln(3)
        idx += 1
        continue

    if in_code:
        pdf.set_font('Courier', '', 7.5)
        pdf.set_fill_color(245, 245, 248)
        pdf.cell(PAGE_W, 4.8, s(line), fill=True, ln=True)
        idx += 1
        continue

    # ── table ──────────────────────────────────────────────────────────────
    if line.startswith('|'):
        cells = [c.strip() for c in line.strip('|').split('|')]
        # separator row?
        if all(re.match(r'^[-:| ]+$', c) for c in cells if c):
            idx += 1
            continue
        if not in_table:
            in_table  = True
            tbl_rows  = []
        tbl_rows.append([clean(c) for c in cells])
        idx += 1
        if idx >= len(raw_lines) or not raw_lines[idx].startswith('|'):
            flush_table(pdf, tbl_rows)
            tbl_rows  = []
            in_table  = False
        continue
    elif in_table:
        flush_table(pdf, tbl_rows)
        tbl_rows  = []
        in_table  = False

    # ── blank ──────────────────────────────────────────────────────────────
    if not line.strip():
        pdf.ln(2)
        idx += 1
        continue

    # ── horizontal rule ────────────────────────────────────────────────────
    if re.match(r'^[-*_]{3,}\s*$', line.strip()):
        pdf.set_draw_color(20, 50, 110)
        pdf.set_line_width(0.4)
        pdf.line(15, pdf.get_y() + 1, 195, pdf.get_y() + 1)
        pdf.set_line_width(0.2)
        pdf.ln(5)
        idx += 1
        continue

    # ── H1 ─────────────────────────────────────────────────────────────────
    if re.match(r'^# [^#]', line):
        txt = clean(line[2:])
        pdf.ln(4)
        pdf.set_font('Helvetica', 'B', 15)
        pdf.set_text_color(20, 50, 110)
        pdf.cell(0, 10, txt, ln=True)
        pdf.set_draw_color(20, 50, 110)
        pdf.set_line_width(0.5)
        pdf.line(15, pdf.get_y(), 195, pdf.get_y())
        pdf.set_line_width(0.2)
        pdf.set_text_color(0, 0, 0)
        pdf.ln(2)

    # ── H2 ─────────────────────────────────────────────────────────────────
    elif re.match(r'^## [^#]', line):
        txt = clean(line[3:])
        pdf.ln(4)
        pdf.set_font('Helvetica', 'B', 12)
        pdf.set_text_color(255, 255, 255)
        pdf.set_fill_color(20, 50, 110)
        pdf.cell(0, 8, '  ' + txt, fill=True, ln=True)
        pdf.set_text_color(0, 0, 0)
        pdf.ln(1)

    # ── H3 ─────────────────────────────────────────────────────────────────
    elif re.match(r'^### [^#]', line):
        txt = clean(line[4:])
        pdf.ln(3)
        pdf.set_font('Helvetica', 'B', 10.5)
        pdf.set_text_color(20, 50, 110)
        pdf.set_fill_color(220, 228, 255)
        pdf.cell(0, 7, '  ' + txt, fill=True, ln=True)
        pdf.set_text_color(0, 0, 0)
        pdf.ln(1)

    # ── H4 ─────────────────────────────────────────────────────────────────
    elif re.match(r'^#### ', line):
        txt = clean(line[5:])
        pdf.ln(2)
        pdf.set_font('Helvetica', 'BI', 9.5)
        pdf.set_text_color(40, 70, 150)
        pdf.cell(0, 6, txt, ln=True)
        pdf.set_text_color(0, 0, 0)

    # ── bullet ─────────────────────────────────────────────────────────────
    elif re.match(r'^[-*] ', line):
        txt = clean(line[2:])
        pdf.set_font('Helvetica', '', 9.5)
        pdf.set_x(pdf.l_margin + 4)
        pdf.cell(5, 6, chr(149))
        pdf.multi_cell(PAGE_W - 9, 6, txt)

    # ── numbered list ──────────────────────────────────────────────────────
    elif re.match(r'^\d+\. ', line):
        txt = clean(re.sub(r'^\d+\. ', '', line))
        num = re.match(r'^(\d+)\.', line).group(1) + '.'
        pdf.set_font('Helvetica', '', 9.5)
        pdf.set_x(pdf.l_margin + 4)
        pdf.cell(6, 6, num)
        pdf.multi_cell(PAGE_W - 10, 6, txt)

    # ── paragraph ──────────────────────────────────────────────────────────
    else:
        txt = clean(line)
        if txt:
            pdf.set_font('Helvetica', '', 9.5)
            pdf.multi_cell(PAGE_W, 6, txt)

    idx += 1


pdf.output('PROJECT_EXPLANATION.pdf')
print('PDF saved: PROJECT_EXPLANATION.pdf')
