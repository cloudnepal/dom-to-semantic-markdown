import {JSDOM} from 'jsdom';
import {
    convertHtmlToMarkdown,
    convertElementToMarkdown,
    ConversionOptions
} from '../src';

// Helper function to create a DOM element
function createElement(html: string): Element {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.firstElementChild as Element;
}

describe('HTML to Markdown conversion', () => {
    let dom: JSDOM;

    beforeEach(() => {
        dom = new JSDOM('<!doctype html><html><body></body></html>');
        global.document = dom.window.document;
    });


    test('converts simple paragraph', () => {
        const html = '<p>This is a simple paragraph.</p>';
        const expected = 'This is a simple paragraph.';
        expect(convertHtmlToMarkdown(html, {overrideDOMParser: new dom.window.DOMParser()}).trim()).toBe(expected);
    });

    test('converts headings', () => {
        const html = '<h1>Heading 1</h1><h2>Heading 2</h2><h3>Heading 3</h3>';
        const expected = '# Heading 1\n\n## Heading 2\n\n### Heading 3';
        expect(convertHtmlToMarkdown(html, {overrideDOMParser: new dom.window.DOMParser()}).trim()).toBe(expected);
    });

    test('converts unordered list', () => {
        const html = '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>';
        const expected = '- Item 1\n- Item 2\n- Item 3';
        expect(convertHtmlToMarkdown(html, {overrideDOMParser: new dom.window.DOMParser()}).trim()).toBe(expected);
    });

    test('converts ordered list', () => {
        const html = '<ol><li>First</li><li>Second</li><li>Third</li></ol>';
        const expected = '1. First\n2. Second\n3. Third';
        expect(convertHtmlToMarkdown(html, {overrideDOMParser: new dom.window.DOMParser()}).trim()).toBe(expected);
    });

    test('converts links', () => {
        const html = '<a href="https://example.com">Example</a>';
        const expected = '[Example](https://example.com/)';
        expect(convertHtmlToMarkdown(html, {overrideDOMParser: new dom.window.DOMParser()}).trim()).toBe(expected);
    });

    test('converts images', () => {
        const html = '<img src="image.jpg" alt="An image">';
        const expected = '![An image](image.jpg)';
        expect(convertHtmlToMarkdown(html, {overrideDOMParser: new dom.window.DOMParser()}).trim()).toBe(expected);
    });

    test('converts bold and italic text', () => {
        const html = '<p><strong>Bold</strong> and <em>italic</em> text</p>';
        const expected = '**Bold** and *italic* text';
        expect(convertHtmlToMarkdown(html, {overrideDOMParser: new dom.window.DOMParser()}).trim()).toBe(expected);
    });

    test('converts blockquotes', () => {
        const html = '<blockquote><p>This is a quote.</p></blockquote>';
        const expected = '> This is a quote.';
        expect(convertHtmlToMarkdown(html, {overrideDOMParser: new dom.window.DOMParser()}).trim()).toBe(expected);
    });

    test('converts code blocks', () => {
        const html = `<pre><code>function example() {\n  return true;\n}</code></pre>`;
        const expected = '```\nfunction example() {\n  return true;\n}\n```';
        expect(convertHtmlToMarkdown(html, {overrideDOMParser: new dom.window.DOMParser()}).trim()).toBe(expected);
    });

    test('converts code blocks with language', () => {
        const html = `<pre><code class="language-javascript">function example() {\n  return true;\n}</code></pre>`;
        const expected = '```javascript\nfunction example() {\n  return true;\n}\n```';
        expect(convertHtmlToMarkdown(html, {overrideDOMParser: new dom.window.DOMParser()}).trim()).toBe(expected);
    });

    test('converts inline code', () => {
        const html = '<p>Use the <code>example()</code> function.</p>';
        const expected = 'Use the `example()` function.';
        expect(convertHtmlToMarkdown(html, {overrideDOMParser: new dom.window.DOMParser()}).trim()).toBe(expected);
    });

    test('converts code block with html inside', () => {
        const html = '<p>Use the <code><span>example()</span></code> function.</p>';
        const expected = 'Use the `example()` function.';
        expect(convertHtmlToMarkdown(html, {overrideDOMParser: new dom.window.DOMParser()}).trim()).toBe(expected);
    });


    test('converts tables', () => {
        const html = `
      <table>
        <thead>
          <tr><th>Header 1</th><th>Header 2</th></tr>
        </thead>
        <tbody>
          <tr><td>Row 1, Cell 1</td><td>Row 1, Cell 2</td></tr>
          <tr><td>Row 2, Cell 1</td><td>Row 2, Cell 2</td></tr>
        </tbody>
      </table>
    `;
        const expected =
            '| Header 1 | Header 2 |\n' +
            '| --- | --- |\n' +
            '| Row 1, Cell 1 | Row 1, Cell 2 |\n' +
            '| Row 2, Cell 1 | Row 2, Cell 2 |';
        expect(convertHtmlToMarkdown(html, {overrideDOMParser: new dom.window.DOMParser()}).trim()).toBe(expected);
    });

    test('converts tables with corelative ids', () => {
        const html = `
      <table>
        <thead>
          <tr><th>Header 1</th><th>Header 2</th></tr>
        </thead>
        <tbody>
          <tr><td>Row 1, Cell 1</td><td>Row 1, Cell 2</td></tr>
          <tr><td>Row 2, Cell 1</td><td>Row 2, Cell 2</td></tr>
        </tbody>
      </table>
    `;
        const expected =
            '| Header 1 <!-- col-0 --> | Header 2 <!-- col-1 --> |\n' +
            '| --- | --- |\n' +
            '| Row 1, Cell 1 <!-- col-0 --> | Row 1, Cell 2 <!-- col-1 --> |\n' +
            '| Row 2, Cell 1 <!-- col-0 --> | Row 2, Cell 2 <!-- col-1 --> |';
        expect(convertHtmlToMarkdown(html, {
                enableTableColumnTracking: true,
                overrideDOMParser: new dom.window.DOMParser()
            }
        ).trim()).toBe(expected);
    });

    test('converts nested structures', () => {
        const html = `
      <div>
        <h1>Main Title</h1>
        <p>Here's a paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
        <ul>
          <li>Item 1</li>
          <li>Item 2
            <ol>
              <li>Subitem 2.1</li>
              <li>Subitem 2.2</li>
            </ol>
          </li>
          <li>Item 3</li>
        </ul>
      </div>
    `;
        const expected =
            '# Main Title\n\n' +
            'Here\'s a paragraph with **bold** and *italic* text.\n\n' +
            '- Item 1\n' +
            '- Item 2\n' +
            '  1. Subitem 2.1\n' +
            '  2. Subitem 2.2\n' +
            '- Item 3';
        expect(convertHtmlToMarkdown(html, {overrideDOMParser: new dom.window.DOMParser()}).trim()).toBe(expected);
    });

    test('converts element to markdown', () => {
        const element = createElement('<p>This is a <strong>test</strong>.</p>');
        const expected = 'This is a **test**.';
        expect(convertElementToMarkdown(element, {overrideDOMParser: new dom.window.DOMParser()}).trim()).toBe(expected);
    });

    test('respects conversion options', () => {
        const html = '<div id="content" role="main"><p>Main content</p></div><div id="sidebar"><p>Sidebar</p></div>';
        const options: ConversionOptions = {
            extractMainContent: true,
            overrideDOMParser: new dom.window.DOMParser()
        };
        const expected = 'Main content';
        expect(convertHtmlToMarkdown(html, options).trim()).toBe(expected);
    });

});

describe('Custom Element Processing and Rendering', () => {

    let dom: JSDOM;

    beforeEach(() => {
        dom = new JSDOM('<!doctype html><html><body></body></html>');
        global.document = dom.window.document;
    });

    test('overrideElementProcessing', () => {
        const html = '<custom-element>Custom content</custom-element>';
        const options: ConversionOptions = {
            overrideElementProcessing: (element) => {
                if (element.tagName.toLowerCase() === 'custom-element') {
                    return [{type: 'custom', content: element.textContent}];
                }
            },
            renderCustomNode: (node) => {
                if (node.type === 'custom') {
                    return `**Custom:** ${node.content}`;
                }
            },
            overrideDOMParser: new dom.window.DOMParser()
        };
        const expected = '**Custom:** Custom content';
        expect(convertHtmlToMarkdown(html, options).trim()).toBe(expected);
    });

    test('processUnhandledElement', () => {
        const html = '<unknown-element>Unknown content</unknown-element>';
        const options: ConversionOptions = {
            processUnhandledElement: (element) => {
                return [{type: 'text', content: `[Unknown: ${element.tagName}] ${element.textContent}`}];
            },
            overrideDOMParser: new dom.window.DOMParser()
        };
        const expected = '[Unknown: UNKNOWN-ELEMENT] Unknown content';
        expect(convertHtmlToMarkdown(html, options).trim()).toBe(expected);
    });

    test('overrideNodeRenderer', () => {
        const html = '<h1>Title</h1>';
        const options: ConversionOptions = {
            overrideNodeRenderer: (node) => {
                if (node.type === 'heading' && node.level === 1) {
                    return `==== ${node.content} ====\n`;
                }
            },
            overrideDOMParser: new dom.window.DOMParser()
        };
        const expected = '==== Title ====';
        expect(convertHtmlToMarkdown(html, options).trim()).toBe(expected);
    });

    test('combination of custom processing and rendering', () => {
        const html = '<custom-element>Custom content</custom-element><h1>Title</h1>';
        const options: ConversionOptions = {
            overrideElementProcessing: (element) => {
                if (element.tagName.toLowerCase() === 'custom-element') {
                    return [{type: 'custom', content: element.textContent}];
                }
            },
            renderCustomNode: (node) => {
                if (node.type === 'custom') {
                    return `**Custom:** ${node.content}\n`;
                }
            },
            overrideNodeRenderer: (node) => {
                if (node.type === 'heading' && node.level === 1) {
                    return `==== ${node.content} ====\n`;
                }
            },
            overrideDOMParser: new dom.window.DOMParser()
        };
        const expected = '**Custom:** Custom content\n==== Title ====';
        expect(convertHtmlToMarkdown(html, options).trim()).toBe(expected);
    });
});

describe('Meta Data Extraction', () => {
    let dom: JSDOM;

    beforeEach(() => {
        dom = new JSDOM();
        global.document = dom.window.document;
    });

    test('extracts basic meta tags', () => {
        const html = `
      <html>
      <head>
        <title>Test Page Title</title>
        <meta name="description" content="This is a test page description.">
        <meta name="keywords" content="test, page, keywords">
      </head>
      <body>
        <h1>Test Page</h1>
      </body>
      </html>
    `;

        const expectedBasic = `---
title: "Test Page Title"
description: "This is a test page description."
keywords: "test, page, keywords"
---


# Test Page`;

        expect(convertHtmlToMarkdown(html, {
            includeMetaData: 'basic',
            overrideDOMParser: new dom.window.DOMParser()
        }).trim()).toBe(expectedBasic);
    });

    test('extracts extended meta tags', () => {
        const html = `
      <html>
      <head>
        <title>Test Page Title</title>
        <meta name="description" content="This is a test page description.">
        <meta property="og:title" content="Open Graph Title">
        <meta property="og:description" content="Open Graph Description">
        <meta property="og:image" content="https://example.com/image.jpg">
        <meta name="twitter:title" content="Twitter Card Title">
        <meta name="twitter:description" content="Twitter Card Description">
        <meta name="twitter:image" content="https://example.com/twitter-image.jpg">
        <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "JSON-LD Title",
            "description": "JSON-LD Description"
          }
        </script>
      </head>
      <body>
        <h1>Test Page</h1>
      </body>
      </html>
    `;

        const expectedExtended = `---
title: "Test Page Title"
description: "This is a test page description."
openGraph:
  title: "Open Graph Title"
  description: "Open Graph Description"
  image: "https://example.com/image.jpg"
twitter:
  title: "Twitter Card Title"
  description: "Twitter Card Description"
  image: "https://example.com/twitter-image.jpg"
schema:
  WebPage:
    name: "JSON-LD Title"
    description: "JSON-LD Description"
---


# Test Page`;

        expect(convertHtmlToMarkdown(html, {
            includeMetaData: 'extended',
            overrideDOMParser: new dom.window.DOMParser()
        }).trim()).toBe(expectedExtended);
    });

    test('handles missing meta data gracefully', () => {
        const html = `
      <html>
      <head>
        <title>Test Page Title</title>
      </head>
      <body>
        <h1>Test Page</h1>
      </body>
      </html>
    `;

        const expectedBasic = `---
title: "Test Page Title"
---


# Test Page`;

        const expectedExtended = `---
title: "Test Page Title"
---


# Test Page`;

        expect(convertHtmlToMarkdown(html, {
            includeMetaData: 'basic',
            overrideDOMParser: new dom.window.DOMParser()
        }).trim()).toBe(expectedBasic);
        expect(convertHtmlToMarkdown(html, {
            includeMetaData: 'extended',
            overrideDOMParser: new dom.window.DOMParser()
        }).trim()).toBe(expectedExtended);
    });

    test('does not include meta data when disabled', () => {
        const html = `
      <html>
      <head>
        <title>Test Page Title</title>
        <meta name="description" content="This is a test page description.">
      </head>
      <body>
        <h1>Test Page</h1>
      </body>
      </html>
    `;

        const expected = `# Test Page`;

        expect(convertHtmlToMarkdown(html, {
            includeMetaData: false,
            overrideDOMParser: new dom.window.DOMParser()
        }).trim()).toBe(expected);
        expect(convertHtmlToMarkdown(html, {overrideDOMParser: new dom.window.DOMParser()}).trim())
            .toBe(expected); // Default should be to not include meta data
    });
});
