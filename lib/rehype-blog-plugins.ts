import { visit } from 'unist-util-visit';
import { toString } from 'hast-util-to-string';
import type { Root, Element } from 'hast';

export function rehypeCallouts() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'blockquote') return;

      const text = toString(node).trim();

      // Check for explicit markers
      let calloutType: string | null = null;
      if (text.startsWith('[savings]')) calloutType = 'savings';
      else if (text.startsWith('[tip]')) calloutType = 'tip';
      else if (text.startsWith('[warning]')) calloutType = 'warning';

      // Auto-detect efficiency patterns
      if (!calloutType) {
        if (/\d+x\s+(return|efficiency|multiplier)/i.test(text) || /\d+\.\d+x/i.test(text)) {
          calloutType = 'savings';
        }
      }

      if (calloutType) {
        const existing = (node.properties?.className as string[] | undefined) ?? [];
        node.properties = node.properties ?? {};
        node.properties.className = [...existing, `callout-${calloutType}`];

        // Remove the marker text from the first text node if present
        if (text.startsWith('[')) {
          visit(node, 'text', (textNode) => {
            if (typeof textNode.value === 'string') {
              textNode.value = textNode.value.replace(/^\[(savings|tip|warning)\]\s*/, '');
            }
          });
        }
      }
    });
  };
}

export function rehypeTableWrapper() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index: number | undefined, parent: any) => {
      if (node.tagName !== 'table' || !parent || index === undefined) return;

      const wrapper: Element = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['table-wrapper'] },
        children: [node],
      };

      parent.children[index] = wrapper;
    });
  };
}
