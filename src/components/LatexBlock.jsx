import React, { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

export default function LatexBlock({ formula, display = true }) {
  const html = useMemo(
    () =>
      katex.renderToString(formula, {
        displayMode: display,
        throwOnError: false,
        strict: "ignore",
      }),
    [display, formula]
  );

  return (
    <div
      className={display ? "latex-block" : "latex-inline"}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
