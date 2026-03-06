import { useEffect, useMemo, useRef, useState } from "react";
import "./folderDropGallery.styles.scss";

const ACCEPTED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/heic",
  "image/heif",
  "image/bmp",
  "image/tiff",
]);

const isImageFile = (file) => {
  if (!file) return false;
  if (file.type && ACCEPTED.has(file.type)) return true;
  const name = (file.name || "").toLowerCase();
  return /\.(jpe?g|png|webp|gif|avif|heic|heif|bmp|tiff?)$/.test(name);
};

const formatBytes = (bytes = 0) => {
  const units = ["B", "KB", "MB", "GB"];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

const traverseEntry = async (entry, path = "") => {
  if (!entry) return [];
  if (entry.isFile) {
    const file = await new Promise((resolve, reject) => {
      entry.file(resolve, reject);
    });
    file._relativePath = `${path}${file.name}`;
    return [file];
  }
  if (entry.isDirectory) {
    const reader = entry.createReader();
    const readEntries = () =>
      new Promise((resolve) => {
        reader.readEntries(resolve);
      });

    let all = [];
    while (true) {
      // eslint-disable-next-line no-await-in-loop
      const entries = await readEntries();
      if (!entries.length) break;

      // eslint-disable-next-line no-await-in-loop
      const nested = await Promise.all(
        entries.map((e) => traverseEntry(e, `${path}${entry.name}/`)),
      );
      all = all.concat(...nested);
    }
    return all;
  }
  return [];
};

const FolderDropGallery = () => {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [items, setItems] = useState([]); // { id, name, path, size, file, url }
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const total = items.length;

  useEffect(() => {
    return () => {
      items.forEach((it) => URL.revokeObjectURL(it.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearAll = () => {
    items.forEach((it) => URL.revokeObjectURL(it.url));
    setItems([]);
    setError("");
    setQuery("");
    setSelectedId(null);
  };

  const removeOne = (id) => {
    setItems((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.url);
      const next = prev.filter((p) => p.id !== id);
      if (selectedId === id) setSelectedId(next[0]?.id || null);
      return next;
    });
  };

  const addFiles = (files = []) => {
    const imageFiles = files.filter(isImageFile);
    if (!imageFiles.length) {
      setError("No supported image files found in that drop.");
      return;
    }

    setError("");

    setItems((prev) => {
      const existingKeys = new Set(
        prev.map((p) => `${p.path || p.name}__${p.size}`),
      );

      const next = [];
      for (const f of imageFiles) {
        const path =
          f.webkitRelativePath || f._relativePath || f.relativePath || "";
        const key = `${path || f.name}__${f.size}`;
        if (existingKeys.has(key)) continue;

        const url = URL.createObjectURL(f);
        const id =
          crypto?.randomUUID?.() ||
          `${Date.now()}_${Math.random().toString(16).slice(2)}`;

        next.push({
          id,
          name: f.name,
          path: path || f.name,
          size: f.size,
          file: f,
          url,
        });
      }

      const merged = [...prev, ...next].sort((a, b) =>
        (a.path || a.name).localeCompare(b.path || b.name),
      );

      // auto-select first added if nothing selected
      if (!selectedId && merged.length) setSelectedId(merged[0].id);

      return merged;
    });
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const dt = e.dataTransfer;
    const itemsList = Array.from(dt?.items || []);
    const hasEntries = itemsList.some((it) => it.webkitGetAsEntry?.());

    try {
      if (hasEntries) {
        const roots = itemsList
          .map((it) => it.webkitGetAsEntry?.())
          .filter(Boolean);

        const nested = await Promise.all(
          roots.map((r) => traverseEntry(r, "")),
        );
        const files = nested.flat().filter(Boolean);
        addFiles(files);
        return;
      }

      const files = Array.from(dt?.files || []);
      addFiles(files);
    } catch (err) {
      setError(err?.message || "Failed to read dropped folder.");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const onPickFolder = () => inputRef.current?.click();

  const onInputChange = (e) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
    e.target.value = "";
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => {
      const p = (it.path || it.name || "").toLowerCase();
      const n = (it.name || "").toLowerCase();
      return p.includes(q) || n.includes(q);
    });
  }, [items, query]);

  const selected = useMemo(() => {
    return items.find((i) => i.id === selectedId) || items[0] || null;
  }, [items, selectedId]);

  const gridTitle = useMemo(() => {
    if (!total) return "No images loaded yet";
    if (!query.trim()) return `${total} image${total === 1 ? "" : "s"} loaded`;
    return `${filtered.length} match${filtered.length === 1 ? "" : "es"} • ${total} total`;
  }, [total, query, filtered.length]);

  return (
    <section className="fdg2">
      <header className="fdg2__top">
        <div className="fdg2__top-left">
          <div className="fdg2__kicker">Gallery Builder</div>
          <h2 className="fdg2__title">Folder Drop Gallery</h2>
          <p className="fdg2__subtitle">
            Drop a folder of images to generate a clean, uniform thumbnail grid.
          </p>
        </div>

        <div className="fdg2__top-right">
          <div className="fdg2__search">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or path…"
              aria-label="Search images"
            />
          </div>

          <div className="fdg2__btns">
            <button
              className="fdg2__btn fdg2__btn--ghost"
              onClick={onPickFolder}
            >
              Select Folder
            </button>
            <button
              className="fdg2__btn fdg2__btn--primary"
              onClick={clearAll}
              disabled={!items.length}
            >
              Clear
            </button>
          </div>

          <input
            ref={inputRef}
            type="file"
            multiple
            webkitdirectory="true"
            directory="true"
            style={{ display: "none" }}
            onChange={onInputChange}
            accept="image/*"
          />
        </div>
      </header>

      <section
        className={`fdg2__drop ${dragActive ? "is-active" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="fdg2__drop-inner">
          <div className="fdg2__drop-title">Drop folder here</div>
          <div className="fdg2__drop-hint">
            Supported: jpg, png, webp, gif, avif, heic/heif
          </div>
          <div className="fdg2__drop-meta">{gridTitle}</div>
        </div>

        {selected?.url ? (
          <div
            className="fdg2__drop-bg"
            style={{ backgroundImage: `url(${selected.url})` }}
            aria-hidden="true"
          />
        ) : null}
        <div className="fdg2__drop-overlay" aria-hidden="true" />
      </section>

      {!!error && <div className="fdg2__error">{error}</div>}

      {!!filtered.length && (
        <section className="fdg2__grid-wrap">
          <div className="fdg2__grid">
            {filtered.map((it) => {
              const isSelected = (selected?.id || "") === it.id;

              return (
                <button
                  key={it.id}
                  type="button"
                  className={`fdg2__tile ${isSelected ? "is-selected" : ""}`}
                  onClick={() => setSelectedId(it.id)}
                  style={{ backgroundImage: `url(${it.url})` }}
                  title={it.path}
                >
                  <span className="fdg2__tile-overlay" aria-hidden="true" />

                  <span className="fdg2__tile-top">
                    <span className="fdg2__chip">{formatBytes(it.size)}</span>

                    <span
                      className="fdg2__x"
                      role="button"
                      aria-label={`Remove ${it.name}`}
                      title="Remove"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeOne(it.id);
                      }}
                    >
                      ×
                    </span>
                  </span>

                  <span className="fdg2__tile-bottom">
                    <span className="fdg2__name">{it.name}</span>
                    <span className="fdg2__path">{it.path}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {!filtered.length && total > 0 && (
        <div className="fdg2__empty">
          No matches for <span className="fdg2__empty-q">“{query.trim()}”</span>
        </div>
      )}
    </section>
  );
};

export default FolderDropGallery;
