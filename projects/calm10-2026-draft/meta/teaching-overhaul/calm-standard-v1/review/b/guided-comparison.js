(() => {
  "use strict";

  document.querySelectorAll(".guided-builder").forEach(builder => {
    const fields = [...builder.querySelectorAll(".guided-fields [data-save-key]")];
    const copies = [...builder.querySelectorAll("[data-guided-response-copy]")];
    const comparison = builder.querySelector(".guided-comparison");

    if (fields.length !== copies.length || !comparison) return;

    const sync = () => {
      copies.forEach((copy, index) => {
        const response = fields[index]?.value.trim() || "";
        copy.textContent = response || "Nothing entered yet. Write in the field above, then compare.";
        copy.classList.toggle("is-empty", !response);
      });
    };

    fields.forEach(field => field.addEventListener("input", sync));
    comparison.addEventListener("toggle", sync);
    document.addEventListener("calm:restore", sync);
    sync();
  });
})();
