const fs = require("fs");
const path = require("path");
const { marked } = require("marked");

const DOCS = "docs";
const STATIC = "static";
const OUT = "dist";

// Map each source filename (without extension) to its output slug.
const SLUGS = {
  "Privacy Statement": "privacy",
  "Terms of Service": "terms",
};

function slugFor(title) {
  if (SLUGS[title])
    return SLUGS[title];
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function pageShell(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} — Grasp It</title>
<link rel="stylesheet" href="/legal.css">
</head>
<body>
<div class="legal-doc">
<h1>${title}</h1>
${bodyHtml}</div>
</body>
</html>
`;
}

// The "Last updated" line is authored as bold text; promote it to a styled class.
function styleUpdatedLine(html) {
  return html.replace(
    /<p><strong>(Last updated:.*?)<\/strong><\/p>/,
    '<p class="updated">$1</p>'
  );
}

function build() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  // Copy static assets verbatim.
  for (const file of fs.readdirSync(STATIC))
    fs.copyFileSync(path.join(STATIC, file), path.join(OUT, file));

  const entries = [];

  for (const file of fs.readdirSync(DOCS)) {
    if (!file.endsWith(".md"))
      continue;

    const title = path.basename(file, ".md");
    const slug = slugFor(title);
    const md = fs.readFileSync(path.join(DOCS, file), "utf8");
    const body = styleUpdatedLine(marked.parse(md));
    const page = pageShell(title, body);

    fs.writeFileSync(path.join(OUT, slug + ".html"), page);
    entries.push({ title, slug });
    console.log("built", slug + ".html", "from", file);
  }

  writeIndex(entries);

  // Custom domain for GitHub Pages.
  fs.writeFileSync(path.join(OUT, "CNAME"), "legal.grasp.it\n");
}

function writeIndex(entries) {
  const links = entries
    .map(function (e) { return `<li><a href="/${e.slug}">${e.title}</a></li>`; })
    .join("\n");

  const body = `<p class="updated">Grasp It — Augmented Haptics Ltd</p>
<h2>Documents</h2>
<ul>
${links}
</ul>
<p>For any questions, contact us at <a href="mailto:support@grasp.it">support@grasp.it</a>.</p>
`;

  fs.writeFileSync(path.join(OUT, "index.html"), pageShell("Legal", body));
  console.log("built index.html");
}

build();
