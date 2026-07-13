const fs = require('fs');
const path = require('path');

const mhDir = path.join(__dirname, 'MH');
const pagesDir = path.join(__dirname, 'frontend_client', 'src', 'pages');

if (!fs.existsSync(pagesDir)) {
  fs.mkdirSync(pagesDir, { recursive: true });
}

const files = fs.readdirSync(mhDir).filter(f => f.endsWith('.html'));

for (const file of files) {
  const filePath = path.join(mhDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract body
  const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let htmlBody = bodyMatch ? bodyMatch[1] : content;
  
  // Basic JSX conversions
  htmlBody = htmlBody.replace(/class=/g, 'className=');
  htmlBody = htmlBody.replace(/for=/g, 'htmlFor=');
  htmlBody = htmlBody.replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}');
  
  // Self closing tags fix
  const voidElements = ['img', 'input', 'br', 'hr', 'meta', 'link'];
  voidElements.forEach(tag => {
    const regex = new RegExp(`<${tag}\\b([^>]*?)(?<!/)>`, 'gi');
    htmlBody = htmlBody.replace(regex, `<${tag}$1 />`);
  });

  // Remove script tags
  htmlBody = htmlBody.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Style fixes (very basic)
  htmlBody = htmlBody.replace(/style="([^"]*)"/g, (match, p1) => {
    return `style={{}}`; // Just strip inline styles for now to avoid JSX compilation errors, or we can parse it, but let's strip to be safe since tailwind is used mostly.
  });
  
  // Some inline events
  htmlBody = htmlBody.replace(/onclick="([^"]*)"/g, 'onClick={() => {}}');
  htmlBody = htmlBody.replace(/onchange="([^"]*)"/g, 'onChange={() => {}}');

  let componentName = file.replace('.html', '');
  componentName = componentName.charAt(0).toUpperCase() + componentName.slice(1);
  componentName = componentName.replace(/[^a-zA-Z0-9]/g, '');
  
  const componentCode = `import React from 'react';

const ${componentName} = () => {
  return (
    <>
      ${htmlBody}
    </>
  );
};

export default ${componentName};
`;
  
  fs.writeFileSync(path.join(pagesDir, `${componentName}.tsx`), componentCode);
  console.log(`Converted ${file} to ${componentName}.tsx`);
}
