from __future__ import annotations

import csv
import html
import json
import re
import shutil
from pathlib import Path
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parent
PRODUCT_PDF = Path('/tmp/arena-coding-uploads/Product_26Nov26_02_23_SVA.pdf')
PRICE_PDF = Path('/tmp/arena-coding-uploads/PriceList_26Nov26_02_21_SVA.pdf')
IMAGE_DIR = ROOT / 'images'
IMAGE_DIR.mkdir(parents=True, exist_ok=True)

FIRM_ID = 'shree-vinayak-agency'
FIRM_NAME = 'Shree Vinayak Agency'
CATALOG_DATE = '2026-11-26'

CATEGORY_COLORS = {
    'DRIP': ('#c5e9df', '#23786f', '#e7f8f3'),
    'MINI': ('#c8d9f4', '#3d679b', '#eef4fc'),
    'MINI SPRINKLER': ('#d8c8ef', '#765193', '#f4effb'),
    'PVC PIPE & FITTING': ('#f3d0ac', '#a9692e', '#fff5e8'),
    'POTATO SEED': ('#f0c5a9', '#9b5a40', '#fff0e8'),
    'SPRAY PIPE': ('#e4c8de', '#87537b', '#f9eff7'),
}


def pdf_text(path: Path) -> str:
    reader = PdfReader(str(path))
    return '\n'.join((page.extract_text() or '') for page in reader.pages)


def money(value: str) -> float:
    return float(value.replace(',', '').strip())


def clean_name(value: str) -> str:
    return re.sub(r'\s+', ' ', value).strip()


def parse_products(text: str) -> list[dict]:
    products = []
    pattern = re.compile(
        r'^(\d+)\s+Shree Vinayak Agency\s+(.+?)\s+(PC100)\s+(.+?)\s+(\d+)\s+(nos|m)\s+₹([\d.,]+)\s+₹([\d.,]+)\s+(In Stock|Out of Stock)$',
        re.MULTILINE,
    )
    for match in pattern.finditer(text):
        number, name, code, category, quantity, unit, buying, selling, stock = match.groups()
        products.append({
            'id': f'prod-import-{int(number):03d}',
            'sourceNo': int(number),
            'firmId': FIRM_ID,
            'firmName': FIRM_NAME,
            'name': clean_name(name),
            'code': code,
            'category': clean_name(category),
            'categoryId': f"cat-{re.sub(r'[^a-z0-9]+', '-', category.lower()).strip('-')}",
            'quantity': int(quantity),
            'unit': unit,
            'buyingPrice': money(buying),
            'sellingPrice': money(selling),
            'stockStatus': 'in-stock' if stock == 'In Stock' else 'out-of-stock',
            'status': 'active',
            'sourceDate': CATALOG_DATE,
            'image': f"product-images/{int(number):03d}-{slugify(name)}.svg",
        })
    return products


def parse_price_list(text: str) -> dict[str, float]:
    prices = {}
    pattern = re.compile(
        r'^\d+\s+Shree Vinayak Agency\s+(.+?)\s+PC100\s+(.+?)\s+₹\s*([\d.,]+)$',
        re.MULTILINE,
    )
    for match in pattern.finditer(text):
        name, _category, price = match.groups()
        prices[clean_name(name)] = money(price)
    return prices


def slugify(value: str) -> str:
    value = value.lower().replace('&', ' and ')
    return re.sub(r'[^a-z0-9]+', '-', value).strip('-')[:72]


def short_type(name: str, category: str) -> str:
    upper = name.upper()
    if 'SEED' in upper:
        return 'SEED'
    if 'SOLVENT' in upper:
        return 'SOLVENT'
    if 'GAUGE' in upper:
        return 'GAUGE'
    if 'DRILER' in upper or 'BIT' in upper:
        return 'DRILL BIT'
    if 'SPRINKLER' in upper or 'NOZAL' in upper or 'NOZZLE' in upper:
        return 'SPRINKLER'
    for token in ('ELBOW', 'REDUCER', 'TEE', 'COUPLER', 'JOINER', 'UNION', 'VALVE', 'TAP', 'COCK', 'END CAP', 'CAP', 'TUBE', 'PIPE', 'GROMATE', 'SOKET', 'SOCKET', 'SEDAL', 'FLUSH'):
        if token in upper:
            return token
    return category


def icon_svg(name: str, category: str, number: int) -> str:
    bg, ink, soft = CATEGORY_COLORS.get(category, ('#d7e6e6', '#376b6b', '#edf8f7'))
    kind = short_type(name, category)
    # Small, original vector illustrations are deliberately used instead of
    # invented photographs: they stay consistent across a catalogue of 90
    # irrigation, pipe-fitting, and seed products.
    if kind == 'SEED':
        art = '''<g fill="#b8784c" stroke="#754936" stroke-width="4"><ellipse cx="252" cy="220" rx="70" ry="46" transform="rotate(-18 252 220)"/><ellipse cx="347" cy="246" rx="72" ry="48" transform="rotate(22 347 246)"/><ellipse cx="298" cy="310" rx="63" ry="42" transform="rotate(-7 298 310)"/></g><g fill="none" stroke="#e7b57e" stroke-width="5" opacity=".8"><path d="M220 211c15 7 22 19 24 34M329 226c-9 14-11 26-7 40M284 293c13 7 20 16 22 29"/></g>'''
    elif kind == 'SOLVENT':
        art = '''<g stroke="#5f4b55" stroke-width="5" stroke-linejoin="round"><path d="M244 151h112v174H244z" fill="#b6d7d1"/><path d="M260 151v-33h80v33" fill="#f1c98e"/><path d="M270 211h60v56h-60z" fill="#fff5dd" stroke="none"/><path d="M277 228h46M277 243h33" fill="none"/></g>'''
    elif kind == 'GAUGE':
        art = '''<circle cx="300" cy="244" r="88" fill="#f4e7ca" stroke="#5a5661" stroke-width="8"/><path d="M300 244 354 199" stroke="#bb6859" stroke-width="8" stroke-linecap="round"/><circle cx="300" cy="244" r="10" fill="#5a5661"/><path d="M239 287h122v25H239z" fill="#9aaeb0" stroke="#5a5661" stroke-width="6"/>'''
    elif kind in {'ELBOW'}:
        art = '''<path d="M230 156v108c0 39 31 70 70 70h91" fill="none" stroke="#b6c6c9" stroke-width="55" stroke-linecap="round" stroke-linejoin="round"/><path d="M230 156v108c0 39 31 70 70 70h91" fill="none" stroke="#6d8990" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M201 150h59M360 304h62" stroke="#5a7278" stroke-width="10" stroke-linecap="round"/>'''
    elif kind in {'TEE'}:
        art = '''<path d="M302 145v190M208 238h188" stroke="#b7c7ca" stroke-width="57" stroke-linecap="round"/><path d="M302 145v190M208 238h188" stroke="#718b92" stroke-width="6" stroke-linecap="round"/><path d="M302 115v58M178 238h59M367 238h59" stroke="#506970" stroke-width="9" stroke-linecap="round"/>'''
    elif kind in {'REDUCER'}:
        art = '''<path d="M205 193h91l85 45-85 45h-91z" fill="#b7c8ca" stroke="#60777c" stroke-width="6"/><path d="M218 193h-28v90h28M381 238h42" stroke="#526a70" stroke-width="10" stroke-linecap="round"/>'''
    elif kind in {'COUPLER', 'JOINER', 'UNION', 'SOKET', 'SOCKET'}:
        art = '''<rect x="190" y="198" width="220" height="80" rx="18" fill="#b8c9ca" stroke="#5e777d" stroke-width="6"/><path d="M230 198v80M370 198v80" stroke="#738c91" stroke-width="8"/><path d="M166 238h48M406 238h48" stroke="#536b71" stroke-width="10" stroke-linecap="round"/>'''
    elif kind in {'END CAP', 'CAP'}:
        art = '''<path d="M225 178h151v121H225z" fill="#b8c9ca" stroke="#61787d" stroke-width="6"/><path d="M225 196h151M225 278h151" stroke="#7b9295" stroke-width="8"/><path d="M202 187v104" stroke="#506970" stroke-width="10" stroke-linecap="round"/>'''
    elif kind in {'PIPE', 'TUBE'} or 'PIPE' in category:
        art = '''<path d="M161 290 390 174" stroke="#8fb1b4" stroke-width="63" stroke-linecap="round"/><path d="M161 290 390 174" stroke="#5c8087" stroke-width="6" stroke-linecap="round"/><path d="M150 272 175 309M377 155l25 38" stroke="#506970" stroke-width="10" stroke-linecap="round"/>'''
    elif kind in {'VALVE', 'TAP', 'COCK', 'FLUSH'}:
        art = '''<path d="M302 314V224" stroke="#6d878b" stroke-width="34" stroke-linecap="round"/><path d="M249 215h106" stroke="#6d878b" stroke-width="18" stroke-linecap="round"/><path d="M268 175c0-36 64-36 64 0v45h-64z" fill="#b8ccca" stroke="#567177" stroke-width="6"/><circle cx="300" cy="175" r="17" fill="#efc17e" stroke="#6c575a" stroke-width="5"/><path d="M278 314h48" stroke="#506970" stroke-width="10" stroke-linecap="round"/>'''
    elif kind == 'DRILL BIT':
        art = '''<path d="M268 305 348 166" stroke="#9aaeb0" stroke-width="23" stroke-linecap="round"/><path d="m251 305 35 18 89-154-35-18z" fill="#d6e0dc" stroke="#586f75" stroke-width="5"/><path d="m280 281 39 17M295 255l38 16M310 228l39 16" stroke="#7b9091" stroke-width="6"/>'''
    elif kind == 'SPRINKLER':
        art = '''<path d="M300 309v-68M264 309h72" stroke="#607b81" stroke-width="12" stroke-linecap="round"/><path d="M246 241h108" stroke="#8fb7b2" stroke-width="25" stroke-linecap="round"/><path d="M270 228c-19-42-35-50-57-58M303 225v-64M336 228c19-42 35-50 57-58" fill="none" stroke="#5f8b89" stroke-width="8" stroke-linecap="round"/>'''
    elif kind == 'GROMATE':
        art = '''<ellipse cx="300" cy="240" rx="81" ry="64" fill="#536c70"/><ellipse cx="300" cy="240" rx="37" ry="28" fill="{soft}" stroke="#d9dfd7" stroke-width="7"/>'''.format(soft=soft)
    else:
        art = '''<path d="M218 184h164v110H218z" fill="#b8c9ca" stroke="#5e777d" stroke-width="6"/><path d="M243 184v110M357 184v110" stroke="#788f92" stroke-width="7"/><path d="M190 239h220" stroke="#526a70" stroke-width="9"/>'''
    safe_type = html.escape(kind)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480" role="img" aria-label="{html.escape(name)} product illustration"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="{soft}"/><stop offset="1" stop-color="{bg}"/></linearGradient></defs><rect width="640" height="480" rx="38" fill="url(#g)"/><circle cx="518" cy="92" r="83" fill="{bg}" opacity=".55"/><circle cx="104" cy="392" r="96" fill="{bg}" opacity=".38"/><g>{art}</g><text x="32" y="422" fill="{ink}" font-family="system-ui,sans-serif" font-size="18" font-weight="800" letter-spacing="2">{safe_type}</text><text x="608" y="422" text-anchor="end" fill="{ink}" opacity=".7" font-family="system-ui,sans-serif" font-size="14" font-weight="700">PC100 · {number:03d}</text></svg>'''


def write_outputs(products: list[dict], price_list: dict[str, float]) -> None:
    categories = []
    seen = set()
    for product in products:
        if product['category'] not in seen:
            seen.add(product['category'])
            categories.append({
                'id': product['categoryId'],
                'firmId': FIRM_ID,
                'name': product['category'],
                'code': product['category'].replace(' ', '-')[:12].upper(),
                'status': 'active',
                'sourceDate': CATALOG_DATE,
            })

    for product in products:
        product['priceListSellingPrice'] = price_list.get(product['name'], product['sellingPrice'])
        file_name = f"{product['sourceNo']:03d}-{slugify(product['name'])}.svg"
        (IMAGE_DIR / file_name).write_text(icon_svg(product['name'], product['category'], product['sourceNo']), encoding='utf-8')

    (ROOT / 'products.json').write_text(json.dumps(products, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    (ROOT / 'categories.json').write_text(json.dumps(categories, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    with (ROOT / 'products.csv').open('w', newline='', encoding='utf-8') as handle:
        fields = ['sourceNo', 'firmName', 'name', 'code', 'category', 'quantity', 'unit', 'buyingPrice', 'sellingPrice', 'stockStatus', 'image']
        writer = csv.DictWriter(handle, fieldnames=fields, lineterminator='\n')
        writer.writeheader()
        writer.writerows({field: product[field] for field in fields} for product in products)
    (ROOT / 'source-product-list.pdf').write_bytes(PRODUCT_PDF.read_bytes())
    (ROOT / 'source-price-list.pdf').write_bytes(PRICE_PDF.read_bytes())
    summary = {
        'firm': FIRM_NAME,
        'firmId': FIRM_ID,
        'sourceDate': CATALOG_DATE,
        'productCount': len(products),
        'categoryCount': len(categories),
        'categories': categories,
        'sourceFiles': ['Product_26Nov26_02_23_SVA.pdf', 'PriceList_26Nov26_02_21_SVA.pdf'],
        'imageNote': 'Original, category-aware vector illustrations generated from each product name. They are not photographs and do not alter source product data.',
    }
    (ROOT / 'README.md').write_text(
        '# Shree Vinayak Agency product asset bundle\n\n'
        f"- Products parsed: **{len(products)}**\n"
        f"- Categories parsed: **{len(categories)}**\n"
        f"- Source date: **{CATALOG_DATE}**\n\n"
        'The JSON and CSV preserve the product rows from the supplied PDF. The SVG files are original lightweight illustrations generated from each product name and category so they can be used as catalogue thumbnails without inventing photographic details.\n',
        encoding='utf-8',
    )


if __name__ == '__main__':
    products = parse_products(pdf_text(PRODUCT_PDF))
    prices = parse_price_list(pdf_text(PRICE_PDF))
    if len(products) != 90:
        raise SystemExit(f'Expected 90 products, parsed {len(products)}')
    write_outputs(products, prices)
    print(json.dumps({'products': len(products), 'priceRows': len(prices), 'images': len(list(IMAGE_DIR.glob('*.svg')))}, indent=2))