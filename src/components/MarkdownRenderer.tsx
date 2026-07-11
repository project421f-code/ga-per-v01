import React from "react";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Parse simple markdown (headers, bold, lists, quotes, paragraphs)
  const lines = content.split("\n");
  let inList = false;
  const renderedElements: React.ReactNode[] = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // End list if empty line or not a list item
    if (inList && !trimmed.startsWith("-") && !trimmed.startsWith("*") && !/^\d+\./.test(trimmed)) {
      inList = false;
    }

    // Header 3
    if (trimmed.startsWith("###")) {
      const text = trimmed.replace("###", "").trim();
      renderedElements.push(
        <h3 key={`h3-${index}`} className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-5 mb-2 flex items-center gap-2">
          {parseInline(text)}
        </h3>
      );
      return;
    }

    // Header 2
    if (trimmed.startsWith("##")) {
      const text = trimmed.replace("##", "").trim();
      renderedElements.push(
        <h2 key={`h2-${index}`} className="text-xl font-bold text-slate-900 dark:text-slate-50 mt-6 mb-3 border-b border-slate-200 dark:border-slate-800 pb-1">
          {parseInline(text)}
        </h2>
      );
      return;
    }

    // Header 1
    if (trimmed.startsWith("#")) {
      const text = trimmed.replace("#", "").trim();
      renderedElements.push(
        <h1 key={`h1-${index}`} className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-400 mt-8 mb-4">
          {parseInline(text)}
        </h1>
      );
      return;
    }

    // Blockquote
    if (trimmed.startsWith(">")) {
      const text = trimmed.replace(">", "").trim();
      renderedElements.push(
        <blockquote key={`quote-${index}`} className="border-l-4 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 px-4 py-2 my-3 rounded-r italic text-slate-700 dark:text-slate-300">
          {parseInline(text)}
        </blockquote>
      );
      return;
    }

    // Unordered List Item
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const text = trimmed.substring(2).trim();
      if (!inList) {
        inList = true;
      }
      renderedElements.push(
        <li key={`li-${index}`} className="list-disc ml-6 mb-1 text-slate-700 dark:text-slate-300">
          {parseInline(text)}
        </li>
      );
      return;
    }

    // Ordered List Item
    const matchOrdered = trimmed.match(/^(\d+)\.\s(.*)/);
    if (matchOrdered) {
      const text = matchOrdered[2].trim();
      if (!inList) {
        inList = true;
      }
      renderedElements.push(
        <li key={`ol-${index}`} className="list-decimal ml-6 mb-1 text-slate-700 dark:text-slate-300">
          <span className="font-semibold text-indigo-600 dark:text-indigo-400 mr-1">{matchOrdered[1]}.</span>
          {parseInline(text)}
        </li>
      );
      return;
    }

    // Empty lines
    if (trimmed === "") {
      return;
    }

    // Paragraph
    renderedElements.push(
      <p key={`p-${index}`} className="text-slate-700 dark:text-slate-300 mb-3 leading-relaxed">
        {parseInline(trimmed)}
      </p>
    );
  });

  // Simple parser for inline elements like **bold** and `code`
  function parseInline(text: string): React.ReactNode[] {
    const parts: React.ReactNode[] = [];
    let currentText = text;
    let keyIdx = 0;

    // Parse bold & code in a single-pass regex replacement style
    const regex = /(\*\*.*?\*\*|`.*?`)/g;
    const splitParts = currentText.split(regex);

    return splitParts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={i} className="font-mono text-xs bg-slate-100 dark:bg-slate-800 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  }

  return <div className="markdown-body text-sm space-y-1">{renderedElements}</div>;
}
