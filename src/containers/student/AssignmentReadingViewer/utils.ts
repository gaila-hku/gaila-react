import type { AssignmentReadingContent } from 'types/assignment';

const getIndicesFromRange = (range: Range, container: HTMLDivElement) => {
  const preCaretRange = range.cloneRange();
  preCaretRange.selectNodeContents(container);
  preCaretRange.setEnd(range.endContainer, range.endOffset);
  const start = preCaretRange.toString().length - range.toString().length;
  const end = start + range.toString().length;
  return { start, end };
};

const highlightAnnotation = (
  annotation: AssignmentReadingContent['annotations'][number],
  container: HTMLDivElement,
) => {
  // Find and wrap the text with the same indices
  let charCount = 0;
  let startNode: Node | null = null;
  let startOffset = 0;
  let endNode: Node | null = null;
  let endOffset = 0;

  // Walk through text nodes to find start and end positions
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    null,
  );

  let currentNode: Node | null = null;
  while ((currentNode = walker.nextNode())) {
    const nodeText = currentNode.textContent || '';
    const nodeStart = charCount;
    const nodeEnd = charCount + nodeText.length;

    if (
      startNode === null &&
      annotation.start_index < nodeEnd &&
      annotation.start_index >= nodeStart
    ) {
      startNode = currentNode;
      startOffset = annotation.start_index - nodeStart;
    }

    if (
      endNode === null &&
      annotation.end_index <= nodeEnd &&
      annotation.end_index > nodeStart
    ) {
      endNode = currentNode;
      endOffset = annotation.end_index - nodeStart;
    }

    charCount += nodeText.length;

    if (startNode && endNode) break;
  }

  if (startNode && endNode) {
    const range = document.createRange();
    range.setStart(startNode, startOffset);
    range.setEnd(endNode, endOffset);

    const span = document.createElement('span');
    span.style.backgroundColor = annotation.color;
    span.style.cursor = 'pointer';
    span.style.borderRadius = '2px';
    span.className = 'annotation-highlight';

    try {
      range.surroundContents(span);
    } catch (e) {
      console.error(e);
      const contents = range.extractContents();
      span.appendChild(contents);
      range.insertNode(span);
    }
  }
};

export { getIndicesFromRange, highlightAnnotation };
